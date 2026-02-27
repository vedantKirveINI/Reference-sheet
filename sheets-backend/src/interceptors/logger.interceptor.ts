import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from "@nestjs/common";
import { Observable, tap, catchError } from "rxjs";
import { Request, Response } from "express";
import { Logger } from "winston";
import { WinstonLoggerService } from "src/logger/winstonLogger.service";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
	private readonly logger: Logger;

	// ✅ Define excluded paths inside the class
	private readonly excludedPaths: string[] = ["/health"];
	constructor(private winstonLoggerService: WinstonLoggerService) {
		this.logger = this.winstonLoggerService.logger;
	}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const startTime = Date.now();

		// **1️⃣ Handle HTTP Requests**
		// if (context.getType() === 'http') {
		//   const httpContext = context.switchToHttp();
		//   const request = httpContext.getRequest<Request>();
		//   const response = httpContext.getResponse<Response>();

		//   // ⛔ Skip logging for excluded paths
		//   if (this.excludedPaths.includes(request.path)) {
		//     return next.handle();
		//   }

		//   this.logger.info('Incoming HTTP Request', {
		//     method: request.method,
		//     url: request.url,
		//     headers: request.headers,
		//     body: request.body,
		//   });

		//   return next.handle().pipe(
		//     tap((data) => {
		//       const duration = Date.now() - startTime;
		//       this.logger.info('Outgoing HTTP Response', {
		//         method: request.method,
		//         url: request.url,
		//         statusCode: response.statusCode,
		//         duration: `${duration}ms`,
		//         responseBody: data,
		//       });
		//     }),
		//     catchError((error) => {
		//       const duration = Date.now() - startTime;
		//       this.logger.error('HTTP Error Response', {
		//         method: request.method,
		//         url: request.url,
		//         statusCode: response.statusCode,
		//         duration: `${duration}ms`,
		//         errorMessage: error.message,
		//         errorStack: error.stack,
		//       });
		//       throw error;
		//     }),
		//   );
		// }

		// // **2️⃣ Handle WebSocket Requests**
		// if (context.getType() === 'ws') {
		//   const wsContext = context.switchToWs();
		//   const client = wsContext.getClient();
		//   const data = wsContext.getData();
		//   const event = wsContext.getPattern(); // Get the WebSocket event name

		//   this.logger.info('Incoming WebSocket Message', {
		//     socketId: client.id,
		//     event,
		//     data,
		//   });

		//   return next.handle().pipe(
		//     tap((response) => {
		//       const duration = Date.now() - startTime;
		//       this.logger.info('Outgoing WebSocket Response', {
		//         socketId: client.id,
		//         event,
		//         duration: `${duration}ms`,
		//         response,
		//       });
		//     }),
		//     catchError((error) => {
		//       const duration = Date.now() - startTime;
		//       this.logger.error('WebSocket Error Response', {
		//         socketId: client.id,
		//         event,
		//         duration: `${duration}ms`,
		//         errorMessage: error.message,
		//         errorStack: error.stack,
		//       });
		//       throw error;
		//     }),
		//   );
		// }

		// **3️⃣ Fallback: Default Behavior**
		return next.handle();
	}
}
