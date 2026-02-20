import { Controller, Get, Headers, Query } from '@nestjs/common';
import { UserSdkService } from './user-sdk.service';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import { SearchUserDto, SearchUserSchema } from './DTO/user-quer-dto';

@Controller('user-sdk')
export class UserSdkController {
  constructor(private readonly userSdkService: UserSdkService) {}

  @Get('search')
  async searchUsers(
    @Headers() headers: any,
    @Query(new ZodValidationPipe(SearchUserSchema)) query: SearchUserDto,
  ) {
    return this.userSdkService.searchUser(headers, query);
  }
}
