import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WinstonLoggerService } from 'src/logger/winstonLogger.service';
import { AssetService } from 'src/npmAssets/asset/asset.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly winstonLoggerService: WinstonLoggerService,
    private readonly assetService: AssetService,
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse();

    const routePath = request.url;

    const errorLog = {
      statusCode: status,
      message: exception.message || 'No message available',
      path: request.url || 'No URL available',
      method: request.method || 'No method available',
      headers: request.headers || 'No headers available',
      body: request.body || 'No body available',
      params: request.params || 'No params available',
      query: request.query || 'No query parameters available',
    };

    console.log(`HTTP Exception:${JSON.stringify(errorLog)}`);

    try {
      if (
        ['/sheet/create_sheet', '/sheet/create_form_sheet'].includes(routePath)
      ) {
        const metadata = request.headers?.metadata;

        if (metadata) {
          const { token }: any = request.headers;
          const { assetId }: any = request.headers.metadata as object;

          console.log('token-->>', typeof token);

          await this.deleteSheetAsset(assetId, token);
        }
      }
    } catch (deactivationError) {
      this.winstonLoggerService.logger.error(
        `Failed to deactivate asset: ${JSON.stringify(deactivationError)}`,
      );
    }

    response.status(status).json({
      statusCode: status,
      ...(typeof exceptionResponse === 'string'
        ? { message: [exceptionResponse] }
        : (exceptionResponse as object)),
    });
  }

  async deleteSheetAsset(assetId: string, token: string) {
    const asset_instance_payload = {
      access_token: token,
    };

    const asset_instance = await this.assetService.getAssetInstance(
      asset_instance_payload,
    );

    const asset_ids = [assetId];
    const is_hard_delete = true;

    await asset_instance.delete(asset_ids, is_hard_delete);
  }
}
