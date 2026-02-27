import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: ZodSchema,
    private isSocket: boolean = false,
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    console.log('metadata::--->>', metadata, 'ZodSchema::', ZodSchema);
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error: any) {
      console.error('Zod validation error:', error);
      if (error instanceof ZodError) {
        const errorMessage = this.formatErrorMessage(error);
        if (this.isSocket) {
          throw new WsException(errorMessage);
        } else {
          throw new BadRequestException(errorMessage);
        }
      }

      if (this.isSocket) {
        throw new WsException('Validation failed');
      } else {
        throw new BadRequestException('Validation failed');
      }
    }
  }

  private formatErrorMessage(error: ZodError): string {
    const firstError = error.errors[0];
    if (firstError?.path) {
      // If the error has a path (indicating which key failed validation)
      return `Validation failed for ${firstError.path.join('.')}: ${firstError.message}`;
    } else {
      const message = firstError?.message ?? 'Unknown error';
      // If the error doesn't have a path (indicating a general validation error)
      return 'Validation failed: ' + message;
    }
  }
}
