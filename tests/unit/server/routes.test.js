import { jest, expect, describe, test, beforeEach } from '@jest/globals';
import config from '../../../server/config.js';
import TestUtil from '../_util/testUtil.js';
import { handler } from '../../../server/routes.js';
import { Controller } from '../../../server/controller';

const { pages, location } = config;

describe('#Routes - test suite for api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = 'GET';
    params.request.url = '/';

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(302, {
      Location: location.home
    });
    expect(params.response.end).toHaveBeenCalled();
  });

  test(`GET /home - should respond with ${pages.homeHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParams();
    params.request.method = 'GET';
    params.request.url = '/home';

    const mockFileStream = TestUtil.generateReadableStream(['data']);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream
      });

    jest.spyOn(mockFileStream, 'pipe').mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(pages.homeHTML);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test.todo(`GET /controller - should respond with ${pages.controllerHTML} file stream`);
  test.todo(`GET /file.txt - should respond with file stream`);
  test.todo(`GET /unknown - given an inexistent route it should respond with 404`);

  describe('exceptions', () => {
    test.todo('given an inexistent file it should respond with 404');
    test.todo('given an error it should respond with 500');
  });
});
