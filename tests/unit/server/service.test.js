import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { Service } from '../../../server/service.js';
import TestUtil from '../_util/testUtil.js';
import fs from 'fs';
import fsPromises from 'fs/promises';
import config from '../../../server/config.js';
import { join, extname } from 'path';

const {
  dir: { publicDirectory }
} = config;

describe('#Service - test suite for service calls', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('Should return a ReadableStream', () => {
    const service = new Service();
    const mockFileStream = TestUtil.generateReadableStream(['test']);
    const filename = 'test.png';

    jest.spyOn(fs, fs.createReadStream.name).mockReturnValue(mockFileStream);

    const fileStream = service.createFileStream(filename);

    expect(fileStream).toStrictEqual(mockFileStream);
    expect(fs.createReadStream).toHaveBeenCalledWith(filename);
  });

  test(`Should return a file's type and name`, async () => {
    const service = new Service();
    const filename = 'test.png';

    jest.spyOn(fsPromises, fsPromises.access.name).mockResolvedValue();

    const { type, name } = await service.getFileInfo(filename);

    expect(type).toBe(extname(filename));
    expect(name).toBe(join(publicDirectory, filename));
  });

  test.todo('#getFileStream');
});
