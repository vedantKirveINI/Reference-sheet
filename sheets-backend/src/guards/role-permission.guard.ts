import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { EventEmitterService } from '../eventemitter/eventemitter.service';

import { OperationType } from 'src/common/enums/operation-type.enum';

export interface PermissionResult {
  can_access: boolean;
  can_edit: boolean;
  can_view: boolean;
  in_trash: boolean;
  general_role: string;
}

@Injectable()
export class RolePermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private emitter: EventEmitterService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const operationType = this.reflector.get<OperationType>(
      'role_permission_operation',
      context.getHandler(),
    );

    if (!operationType) {
      return true;
    }

    const isHttp = context.getType() === 'http';

    const { token, baseId } = this.extractAuthData(context, isHttp);

    return this.checkPermission(
      token,
      baseId,
      operationType,
      isHttp,
      context,
    ).then(() => true);
  }

  private async checkPermission(
    token: string,
    baseId: string,
    operationType: OperationType,
    isHttp: boolean,
    context: ExecutionContext,
  ): Promise<PermissionResult> {
    console.log(
      `🔒 Role Permission Check: ${operationType} (${isHttp ? 'HTTP' : 'WebSocket'})`,
    );

    this.validateRequiredFields(token, baseId, isHttp);

    const permissions = await this.fetchPermissions(token, baseId);
    const result = this.validateAccessPermissions(permissions, isHttp);

    this.validateOperationPermissions(result, operationType, isHttp);

    // Attach permission data to request object
    this.attachPermissionToRequest(context, result, isHttp);

    console.log(`✅ Role Permission Check Passed for ${operationType}`);
    return result;
  }

  private attachPermissionToRequest(
    context: ExecutionContext,
    permissions: PermissionResult,
    isHttp: boolean,
  ): void {
    if (isHttp) {
      const request = context.switchToHttp().getRequest();
      // Attach to request object
      request.userPermissions = permissions;
    } else {
      const client: Socket = context.switchToWs().getClient();
      // For WebSocket, attach to client data
      client.data = { ...client.data, userPermissions: permissions };
    }
  }

  private validateRequiredFields(
    token: string,
    baseId: string,
    isHttp: boolean,
  ): void {
    if (!token) {
      this.throwAuthError('Token is required', isHttp);
    } else if (!baseId) {
      this.throwAuthError('BaseId is required', isHttp);
    }
  }

  private async fetchPermissions(token: string, baseId: string): Promise<any> {
    try {
      const permissions_payload = { token, asset_id: baseId };

      const [permissions]: any = await this.emitter.emitAsync(
        'permission.getCachedPermission',
        permissions_payload,
      );

      console.log('permissions::-->>>', permissions);
      return permissions;
    } catch (error) {
      console.log(
        `❌ Role Permission Check Error: ${(error as Error).message}`,
      );
      throw new UnauthorizedException('Invalid token');
    }
  }

  private validateAccessPermissions(
    permissions: any,
    isHttp: boolean,
  ): PermissionResult {
    if (!permissions?.result?.can_access) {
      this.throwAuthError("You don't have access", isHttp);
    }

    const result: PermissionResult = permissions.result;
    console.log(
      `✅ Access granted. Can Edit: ${result.can_edit}, Can View: ${result.can_view}`,
    );

    return result;
  }

  private validateOperationPermissions(
    permissions: PermissionResult,
    operationType: OperationType,
    isHttp: boolean,
  ): void {
    const operationValidators = {
      [OperationType.CREATE]: () =>
        this.validateEditPermission(permissions, isHttp),
      [OperationType.UPDATE]: () =>
        this.validateEditPermission(permissions, isHttp),
      [OperationType.DELETE]: () =>
        this.validateEditPermission(permissions, isHttp),
      [OperationType.GET]: () =>
        this.validateViewPermission(permissions, isHttp),
      [OperationType.VIEW]: () =>
        this.validateViewPermission(permissions, isHttp),
    };

    const validator = operationValidators[operationType];
    if (validator) {
      validator();
    }
  }

  private validateEditPermission(
    permissions: PermissionResult,
    isHttp: boolean,
  ): void {
    if (!permissions.can_edit) {
      this.throwAuthError("You don't have edit permission", isHttp);
    }
  }

  private validateViewPermission(
    permissions: PermissionResult,
    isHttp: boolean,
  ): void {
    if (!permissions.can_view) {
      this.throwAuthError("You don't have view permission", isHttp);
    }
  }

  private extractAuthData(
    context: ExecutionContext,
    isHttp: boolean,
  ): { token: string; baseId: string } {
    if (isHttp) {
      return this.extractAuthDataFromHttp(context);
    } else {
      return this.extractAuthDataFromWebSocket(context);
    }
  }

  private extractAuthDataFromHttp(context: ExecutionContext): {
    token: string;
    baseId: string;
  } {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHttpRequest(request);
    const baseId = this.extractBaseIdFromHttpRequest(request);

    this.logAuthDataExtraction('HTTP', token, baseId);
    return { token, baseId };
  }

  private extractAuthDataFromWebSocket(context: ExecutionContext): {
    token: string;
    baseId: string;
  } {
    const client: Socket = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    const token = this.extractTokenFromWebSocket(client);
    const baseId = this.extractBaseIdFromWebSocket(data);

    this.logAuthDataExtraction('WebSocket', token, baseId);
    return { token, baseId };
  }

  private extractTokenFromHttpRequest(request: any): string {
    return request.headers.token || request.query.token || request.body?.token;
  }

  private extractBaseIdFromHttpRequest(request: any): string {
    return (
      request.body?.baseId ||
      request.body?.asset_id ||
      request.query.baseId ||
      request.query.asset_id ||
      request.params.baseId ||
      request.params.asset_id ||
      request.body?.id
    );
  }

  private extractTokenFromWebSocket(client: Socket): string {
    return client.handshake.query.token as string;
  }

  private extractBaseIdFromWebSocket(data: any): string {
    return (
      data?.baseId ||
      data?.asset_id ||
      data?.payload?.baseId ||
      data?.payload?.asset_id
    );
  }

  private logAuthDataExtraction(
    contextType: string,
    token: string,
    baseId: string,
  ): void {
    console.log(
      `📋 ${contextType} Context - Token: ${token ? 'Found' : 'Missing'}, BaseId: ${baseId || 'Missing'}`,
    );
  }

  private throwAuthError(message: string, isHttp: boolean): never {
    if (isHttp) {
      throw new ForbiddenException(message);
    } else {
      throw new WsException(message);
    }
  }
}
