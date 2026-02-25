import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from '../http-exception/http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockWinstonLogger: any;
  let mockAssetService: any;

  beforeEach(() => {
    mockWinstonLogger = {
      logger: {
        error: jest.fn(),
        info: jest.fn(),
      },
    };
    mockAssetService = {
      getAssetInstance: jest.fn(),
    };

    filter = new HttpExceptionFilter(mockWinstonLogger, mockAssetService);
  });

  const createMockHost = (overrides: any = {}) => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockRequest = {
      url: overrides.url ?? '/test',
      method: overrides.method ?? 'GET',
      headers: overrides.headers ?? {},
      body: overrides.body ?? {},
      params: overrides.params ?? {},
      query: overrides.query ?? {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      mockRequest,
      mockResponse,
    };
  };

  it('should catch HttpException and return formatted response', async () => {
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
    const { mockResponse, ...host } = createMockHost();

    await filter.catch(exception, host as any);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
      }),
    );
  });

  it('should handle string exception response', async () => {
    const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    const { mockResponse, ...host } = createMockHost();

    await filter.catch(exception, host as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['Bad Request'],
      }),
    );
  });

  it('should handle object exception response', async () => {
    const exception = new HttpException(
      { message: ['Field is required'], error: 'Validation Error' },
      HttpStatus.BAD_REQUEST,
    );
    const { mockResponse, ...host } = createMockHost();

    await filter.catch(exception, host as any);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: ['Field is required'],
        error: 'Validation Error',
      }),
    );
  });

  it('should attempt to delete asset on create_sheet failure', async () => {
    const exception = new HttpException(
      'Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    const mockInstance = { delete: jest.fn() };
    mockAssetService.getAssetInstance.mockResolvedValue(mockInstance);

    const { mockResponse, ...host } = createMockHost({
      url: '/sheet/create_sheet',
      headers: {
        token: 'some-token',
        metadata: { assetId: 'asset-1' },
      },
    });

    await filter.catch(exception, host as any);

    expect(mockAssetService.getAssetInstance).toHaveBeenCalledWith({
      access_token: 'some-token',
    });
    expect(mockInstance.delete).toHaveBeenCalledWith(['asset-1'], true);
  });

  it('should handle create_form_sheet failure too', async () => {
    const exception = new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    const mockInstance = { delete: jest.fn() };
    mockAssetService.getAssetInstance.mockResolvedValue(mockInstance);

    const { mockResponse, ...host } = createMockHost({
      url: '/sheet/create_form_sheet',
      headers: {
        token: 'token',
        metadata: { assetId: 'asset-2' },
      },
    });

    await filter.catch(exception, host as any);

    expect(mockInstance.delete).toHaveBeenCalledWith(['asset-2'], true);
  });

  it('should log error when asset deactivation fails', async () => {
    const exception = new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    mockAssetService.getAssetInstance.mockRejectedValue(
      new Error('Service unavailable'),
    );

    const { mockResponse, ...host } = createMockHost({
      url: '/sheet/create_sheet',
      headers: {
        token: 'token',
        metadata: { assetId: 'asset-3' },
      },
    });

    await filter.catch(exception, host as any);

    expect(mockWinstonLogger.logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to deactivate asset'),
    );
  });

  it('should not attempt cleanup for non-create_sheet routes', async () => {
    const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

    const { mockResponse, ...host } = createMockHost({
      url: '/other/route',
      headers: { metadata: { assetId: 'asset-4' } },
    });

    await filter.catch(exception, host as any);

    expect(mockAssetService.getAssetInstance).not.toHaveBeenCalled();
  });
});
