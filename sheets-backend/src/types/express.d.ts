import { PermissionResult } from '../guards/role-permission.guard';

declare global {
  namespace Express {
    interface Request {
      userPermissions?: PermissionResult;
    }
  }
}

export {};
