import fs from 'fs';
import fsPromises from 'fs/promises';
import config from './config.js';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { PassThrough, Writable } from 'stream';
import Throttle from 'throttle';
import childProcess from 'child_process';
import { logger } from './util.js';
import streamsPromises from 'stream/promises';
import { once } from 'events';

const {
  dir: { publicDirectory },
  constants: { fallbackBitRate, englishConversation, bitRateDivisor }
} = config;

export class Service {
  constructor() {
    this.clientStreams = new Map();
    this.currentSong = englishConversation;
    this.currentBitrate = 0;
    this.throttleTransform = {};
    this.currentReadable = {};
  }

  getClientStream() {
    const id = randomUUID();
    const clientStream = new PassThrough();
    this.clientStreams.set(id, clientStream);

    return { id, clientStream };
  }

  removeClientStream(id) {
    this.clientStreams.delete(id);
  }

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  _executeSoxCommand(args) {
    return childProcess.spawn('sox', args);
  }

  async getBitRate(song) {
    try {
      const args = ['--i', '-B', song];

      const { stderr, stdout } = this._executeSoxCommand(args);

      await Promise.all([once(stderr, 'readable'), once(stdout, 'readable')]);

      const [success, error] = [stdout, stderr].map(stream => stream.read());

      if (error) return await Promise.reject(error);

      return success.toString().trim().replace('k', '000');
    } catch (error) {
      logger.error(error);
      return fallbackBitRate;
    }
  }

  broadcast() {
    return new Writable({
      write: (chunk, enc, cb) => {
        for (const [id, stream] of this.clientStreams) {
          if (stream.writableEnded) {
            this.removeClientStream(id);
            continue;
          }
          stream.write(chunk);
        }

        cb();
      }
    });
  }

  async startStreaming() {
    logger.info(`starting with ${this.currentSong}`);

    const bitRate = (this.currentBitrate =
      (await this.getBitRate(this.currentSong)) / bitRateDivisor);
    const throttleTransform = (this.throttleTransform = new Throttle(bitRate));
    const songReadable = (this.currentReadable = this.createFileStream(this.currentSong));
    streamsPromises.pipeline(songReadable, throttleTransform, this.broadcast());
  }

  async stopStreaming() {
    this.throttleTransform?.end?.();
  }

  async getFileInfo(file) {
    const fullFilePath = join(publicDirectory, file);
    //check if file exists
    await fsPromises.access(fullFilePath);
    const fileType = extname(fullFilePath);

    return { type: fileType, name: fullFilePath };
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file);
    return {
      stream: this.createFileStream(name),
      type
    };
  }
}
