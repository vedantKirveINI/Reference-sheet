import { SetMetadata } from '@nestjs/common';
import { OperationType } from '../common/enums/operation-type.enum';

export const RolePermission = (operationType: OperationType) =>
  SetMetadata('role_permission_operation', operationType);
