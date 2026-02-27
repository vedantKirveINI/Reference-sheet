import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { verifyAndExtractToken } from '../utils/token.utils';

@Injectable()
export class WsJwtGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      console.log('HTTP');
      return true;
    }

    const client: Socket = context.switchToWs().getClient();

    WsJwtGuard.validateToken(client);

    return true;
  }

  static validateToken(client: Socket) {
    const token: any = client.handshake.query.token; // Use query instead of headers

    if (!token) {
      throw new WsException('No token provided');
    }

    try {
      const { decoded, user_id } = verifyAndExtractToken(token);

      // Merge data into client data
      WsJwtGuard.mergeDataInClientData(client, decoded, user_id);

      return { decoded, user_id };
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }

  static mergeDataInClientData(client: Socket, data: any, user_id: string) {
    client.data = { ...data, user_id };
  }
}
