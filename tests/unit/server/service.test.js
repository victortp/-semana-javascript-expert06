import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { Service } from '../../../server/service.js';
import TestUtil from '../_util/testUtil.js';
import fs from 'fs';

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
  test.todo('#getFileInfo');
  test.todo('#getFileStream');
});
