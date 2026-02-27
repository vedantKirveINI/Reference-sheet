import { WsJwtGuard } from 'src/auth/ws-jwt.guard';

// the default funtion type is wrong need to verify why is it wrong in docs
export const SocketAuthMiddleware = () => {
  return (client, next) => {
    try {
      const { decoded, user_id } = WsJwtGuard.validateToken(client);

      WsJwtGuard.mergeDataInClientData(client, decoded, user_id);

      next();
    } catch (error) {
      next(error);
    }
  };
};
