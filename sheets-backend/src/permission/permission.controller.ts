import { Controller } from '@nestjs/common';

import { PermissionService } from './permission.service';

@Controller('/permission')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}
}
