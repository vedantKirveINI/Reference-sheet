import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { SearchUserDto } from './DTO/user-quer-dto';

@Injectable()
export class UserSdkService {
  constructor(@Inject('UserSdk') private UserSdk: any) {}

  getUserInstance = (userInstancePayload: Record<string, any>) => {
    const { access_token } = userInstancePayload;

    return new this.UserSdk({
      url: process.env.OUTE_SERVER,
      token: access_token,
    });
  };

  async searchUser(headers: any, query: SearchUserDto) {
    // Validate workspace_id
    if (!query.workspace_id) {
      throw new BadRequestException('Workspace ID is required');
    }

    try {
      const { token } = headers;
      const access_token = token;

      const userInstance = this.getUserInstance({ access_token });

      const finalQuery = {
        q: query.q,
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        workspace_id: query.workspace_id,
      };

      console.log('finalQuery >>', finalQuery);

      const result = await userInstance.search(finalQuery);

      // If SDK explicitly returns a failed response
      if (result?.status === 'failed') {
        throw new BadRequestException(
          result?.result?.message || 'Search failed',
        );
      }

      return result;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Search failed');
    }
  }
}
