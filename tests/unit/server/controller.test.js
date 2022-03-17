import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import { Controller } from '../../../server/controller.js';
import { Service } from '../../../server/service.js';
import TestUtil from '../_util/testUtil.js';

describe('#Controller - test suite for controller calls', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('should respond with a file stream', async () => {
    const controller = new Controller();
    const mockFileStream = TestUtil.generateReadableStream(['test']);
    const mockType = '.html';
    const mockFileName = 'test.html';

    jest
      .spyOn(Service.prototype, Service.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: mockType
      });

    const { stream, type } = await controller.getFileStream(mockFileName);

    expect(stream).toStrictEqual(mockFileStream);
    expect(type).toStrictEqual(mockType);
  });
});
