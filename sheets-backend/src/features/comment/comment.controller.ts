import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { RolePermission } from 'src/decorators/role-permission.decorator';
import { RolePermissionGuard } from 'src/guards/role-permission.guard';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { verifyAndExtractToken } from 'src/utils/token.utils';

@Controller('/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  private extractUserFromRequest(req: any): { userId: string; userName?: string; userAvatar?: string } {
    const token = req.headers?.token || req.query?.token || req.body?.token;
    let userId = 'anonymous';
    let userName: string | undefined;
    let userAvatar: string | undefined;

    if (token) {
      try {
        const { decoded, user_id } = verifyAndExtractToken(token);
        userId = user_id;
        userName = decoded?.name || decoded?.user_name || decoded?.username;
        userAvatar = decoded?.avatar || decoded?.user_avatar;
      } catch {}
    }

    return { userId, userName, userAvatar };
  }

  @Post('/create')
  async createComment(@Body() body: any, @Req() req: any) {
    const { tableId, recordId, content, parentId } = body;

    if (!tableId || !recordId || !content) {
      throw new BadRequestException('tableId, recordId, and content are required');
    }

    const { userId, userName, userAvatar } = this.extractUserFromRequest(req);

    return this.commentService.createComment({
      tableId: String(tableId),
      recordId: String(recordId),
      content,
      userId,
      userName,
      userAvatar,
      parentId: parentId ? Number(parentId) : undefined,
    });
  }

  @Get('/list')
  async getComments(
    @Query('tableId') tableId: string,
    @Query('recordId') recordId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    if (!tableId || !recordId) {
      throw new BadRequestException('tableId and recordId are required');
    }

    return this.commentService.getComments(
      String(tableId),
      String(recordId),
      cursor ? Number(cursor) : undefined,
      limit ? Number(limit) : 50,
    );
  }

  @Get('/count')
  async getCommentCount(
    @Query('tableId') tableId: string,
    @Query('recordId') recordId: string,
  ) {
    if (!tableId || !recordId) {
      throw new BadRequestException('tableId and recordId are required');
    }

    return { count: await this.commentService.getCommentCount(String(tableId), String(recordId)) };
  }

  @Patch('/update')
  async updateComment(@Body() body: any, @Req() req: any) {
    const { commentId, content } = body;

    if (!commentId || !content) {
      throw new BadRequestException('commentId and content are required');
    }

    const { userId } = this.extractUserFromRequest(req);

    return this.commentService.updateComment({
      commentId: Number(commentId),
      content,
      userId,
    });
  }

  @Delete('/delete/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    const { userId } = this.extractUserFromRequest(req);
    await this.commentService.deleteComment(Number(commentId), userId);
    return { success: true };
  }

  @Post('/reaction/add')
  async addReaction(@Body() body: any, @Req() req: any) {
    const { commentId, emoji } = body;

    if (!commentId || !emoji) {
      throw new BadRequestException('commentId and emoji are required');
    }

    const { userId } = this.extractUserFromRequest(req);
    return this.commentService.addReaction(Number(commentId), userId, emoji);
  }

  @Post('/reaction/remove')
  async removeReaction(@Body() body: any, @Req() req: any) {
    const { commentId, emoji } = body;

    if (!commentId || !emoji) {
      throw new BadRequestException('commentId and emoji are required');
    }

    const { userId } = this.extractUserFromRequest(req);
    return this.commentService.removeReaction(Number(commentId), userId, emoji);
  }
}
