import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BasicAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/admin/logout') {
      // Send a 401 response to make the browser forget the credentials
      res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
      return res.status(401).send('Logged out successfully');
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
      throw new UnauthorizedException('Authentication required');
    }

    const [type, credentials] = authHeader.split(' ');

    if (type === 'Basic') {
      const [username, password] = Buffer.from(credentials, 'base64')
        .toString()
        .split(':');

      if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
      ) {
        next();
      } else {
        throw new UnauthorizedException('Invalid username or password');
      }
    } else {
      throw new UnauthorizedException('Authentication required');
    }
  }
}
