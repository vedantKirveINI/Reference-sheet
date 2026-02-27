import { Body, Controller, Post } from '@nestjs/common';
import { SpaceService } from './space.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('/space')
export class SpaceController {
  constructor(
    private spaceService: SpaceService,
    private readonly prisma: PrismaService,
  ) {}
  @Post()
  async createSpace(@Body() body: any) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.spaceService.createSpace(body, prisma);
    });
  }
}
