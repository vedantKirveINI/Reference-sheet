import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class WinstonLoggerService {
  public readonly logger: winston.Logger;

  constructor() {
    if (true) {
      this.logger = this.createLogger();
    }
  }

  createLogger() {
    return winston.createLogger({
      level: 'info', // Default log level
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp in readable format
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Customize the log output format
          return `${timestamp} [${level.toUpperCase()}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        }),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }), // Adds colors to all output (level, message, etc.)
            winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), // Include timestamp
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              // Customize log output for console
              return `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta) : ''
              }`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/application.log',
          format: winston.format.combine(
            winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }), // Include timestamp in log file
            winston.format.json(), // JSON format for structured logs in files
          ),
        }),
      ],
    });
  }
}
