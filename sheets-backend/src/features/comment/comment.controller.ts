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

@Controller('/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/create')
  @RolePermission(OperationType.CREATE)
  @UseGuards(RolePermissionGuard)
  async createComment(@Body() body: any, @Req() req: any) {
    const { tableId, recordId, content, parentId } = body;

    if (!tableId || !recordId || !content) {
      throw new BadRequestException('tableId, recordId, and content are required');
    }

    const userId = req.user?.userId || body.userId;
    const userName = req.user?.name || body.userName;
    const userAvatar = req.user?.avatar || body.userAvatar;

    return this.commentService.createComment({
      tableId: Number(tableId),
      recordId: Number(recordId),
      content,
      userId: String(userId),
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
      Number(tableId),
      Number(recordId),
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

    return { count: await this.commentService.getCommentCount(Number(tableId), Number(recordId)) };
  }

  @Patch('/update')
  @RolePermission(OperationType.UPDATE)
  @UseGuards(RolePermissionGuard)
  async updateComment(@Body() body: any, @Req() req: any) {
    const { commentId, content } = body;

    if (!commentId || !content) {
      throw new BadRequestException('commentId and content are required');
    }

    const userId = req.user?.userId || body.userId;

    return this.commentService.updateComment({
      commentId: Number(commentId),
      content,
      userId: String(userId),
    });
  }

  @Delete('/delete/:commentId')
  @RolePermission(OperationType.DELETE)
  @UseGuards(RolePermissionGuard)
  async deleteComment(@Param('commentId') commentId: string, @Req() req: any) {
    const userId = req.user?.userId || req.body?.userId;
    await this.commentService.deleteComment(Number(commentId), String(userId));
    return { success: true };
  }

  @Post('/reaction/add')
  async addReaction(@Body() body: any, @Req() req: any) {
    const { commentId, emoji } = body;

    if (!commentId || !emoji) {
      throw new BadRequestException('commentId and emoji are required');
    }

    const userId = req.user?.userId || body.userId;
    return this.commentService.addReaction(Number(commentId), String(userId), emoji);
  }

  @Post('/reaction/remove')
  async removeReaction(@Body() body: any, @Req() req: any) {
    const { commentId, emoji } = body;

    if (!commentId || !emoji) {
      throw new BadRequestException('commentId and emoji are required');
    }

    const userId = req.user?.userId || body.userId;
    return this.commentService.removeReaction(Number(commentId), String(userId), emoji);
  }
}
