import {
  NestMiddleware,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verifyAndExtractToken } from '../utils/token.utils';

@Injectable()
export class ApiTokenCheckMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = Array.isArray(req.headers['token'])
      ? req.headers['token'][0]
      : req.headers['token'];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Use the utility function to verify and extract
      const { decoded, user_id } = verifyAndExtractToken(token);

      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      this.mergeValueInBody(req, user_id);
      this.mergeValueInHeaders(req, decoded);

      next();
    } catch (error: any) {
      throw new UnauthorizedException(error?.message);
    }
  }

  mergeValueInBody(req: Request, user_id: string) {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body) {
        req.body.user_id = user_id;
      } else {
        req.body = { user_id };
      }
    } else if (['GET', 'DELETE'].includes(req.method)) {
      if (req.query) {
        req.query.user_id = user_id;
      } else {
        req.query = { user_id };
      }
    }
  }

  mergeValueInHeaders(req: Request, decoded: any) {
    // Merge decoded token into the request headers
    req.headers['decoded-token'] = decoded;
  }
}
