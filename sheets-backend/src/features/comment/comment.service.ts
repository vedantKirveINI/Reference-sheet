import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';

interface CreateCommentDto {
  tableId: string;
  recordId: string;
  content: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  parentId?: number;
}

interface UpdateCommentDto {
  commentId: number;
  content: string;
  userId: string;
}

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: EventEmitterService,
  ) {}

  private commentTableReady = false;

  async ensureCommentTable(prisma: any): Promise<void> {
    if (this.commentTableReady) return;
    try {
      const exists: any[] = await prisma.$queryRawUnsafe(
        `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name='__comments'`
      );
      if (exists.length > 0) {
        const cols: any[] = await prisma.$queryRawUnsafe(
          `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='__comments' AND column_name='table_id'`
        );
        if (cols.length > 0 && cols[0].data_type === 'integer') {
          await prisma.$executeRawUnsafe(`DROP TABLE public.__comments CASCADE`);
        } else {
          this.commentTableReady = true;
          return;
        }
      }
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.__comments (
          id SERIAL PRIMARY KEY,
          table_id TEXT NOT NULL,
          record_id TEXT NOT NULL,
          parent_id INTEGER REFERENCES public.__comments(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          user_name VARCHAR(255),
          user_avatar TEXT,
          reactions JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          deleted_at TIMESTAMP WITH TIME ZONE
        )
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_comments_table_record ON public.__comments(table_id, record_id)
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.__comments(parent_id)
      `);
      this.commentTableReady = true;
    } catch (error) {
      this.logger.warn('Comment table may already exist', error);
    }
  }

  async createComment(dto: CreateCommentDto): Promise<any> {
    const prisma = this.prisma.prismaClient;
    await this.ensureCommentTable(prisma);

    const { tableId, recordId, content, userId, userName, userAvatar, parentId } = dto;

    if (!content || content.trim() === '') {
      throw new BadRequestException('Comment content cannot be empty');
    }

    const params: any[] = [tableId, recordId, content, userId];
    let paramIndex = 5;
    let parentClause = 'NULL';
    let userNameClause = 'NULL';
    let userAvatarClause = 'NULL';

    if (parentId) {
      parentClause = `$${paramIndex}`;
      params.push(parentId);
      paramIndex++;
    }
    if (userName) {
      userNameClause = `$${paramIndex}`;
      params.push(userName);
      paramIndex++;
    }
    if (userAvatar) {
      userAvatarClause = `$${paramIndex}`;
      params.push(userAvatar);
      paramIndex++;
    }

    const insertQuery = `
      INSERT INTO public.__comments (table_id, record_id, content, user_id, parent_id, user_name, user_avatar)
      VALUES ($1, $2, $3, $4, ${parentClause}, ${userNameClause}, ${userAvatarClause})
      RETURNING *
    `;

    const result: any[] = await prisma.$queryRawUnsafe(insertQuery, ...params);

    if (result.length > 0) {
      this.emitter.emit('comment.created', {
        tableId,
        recordId,
        comment: result[0],
      });
    }

    return result[0];
  }

  async getComments(
    tableId: string,
    recordId: string,
    cursor?: number,
    limit: number = 50,
  ): Promise<{ comments: any[]; nextCursor: number | null }> {
    const prisma = this.prisma.prismaClient;
    await this.ensureCommentTable(prisma);

    const params: any[] = [tableId, recordId, limit + 1];
    let whereClause = 'table_id = $1 AND record_id = $2 AND deleted_at IS NULL';

    if (cursor) {
      whereClause += ` AND id < $4`;
      params.push(cursor);
    }

    const query = `
      SELECT * FROM public.__comments
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $3
    `;

    const comments: any[] = await prisma.$queryRawUnsafe(query, ...params);

    let nextCursor: number | null = null;
    if (comments.length > limit) {
      const lastComment = comments.pop();
      nextCursor = lastComment.id;
    }

    return { comments, nextCursor };
  }

  async getCommentCount(tableId: string, recordId: string): Promise<number> {
    const prisma = this.prisma.prismaClient;
    await this.ensureCommentTable(prisma);

    const query = `
      SELECT COUNT(*)::int as count FROM public.__comments
      WHERE table_id = $1 AND record_id = $2 AND deleted_at IS NULL
    `;

    const result: any[] = await prisma.$queryRawUnsafe(query, tableId, recordId);
    return result[0]?.count || 0;
  }

  async updateComment(dto: UpdateCommentDto): Promise<any> {
    const prisma = this.prisma.prismaClient;

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM public.__comments WHERE id = $1 AND deleted_at IS NULL`,
      dto.commentId,
    );

    if (existing.length === 0) {
      throw new BadRequestException('Comment not found');
    }

    if (existing[0].user_id !== dto.userId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    const result: any[] = await prisma.$queryRawUnsafe(
      `UPDATE public.__comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      dto.content,
      dto.commentId,
    );

    if (result.length > 0) {
      this.emitter.emit('comment.updated', {
        tableId: result[0].table_id,
        recordId: result[0].record_id,
        comment: result[0],
      });
    }

    return result[0];
  }

  async deleteComment(commentId: number, userId: string): Promise<void> {
    const prisma = this.prisma.prismaClient;

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM public.__comments WHERE id = $1 AND deleted_at IS NULL`,
      commentId,
    );

    if (existing.length === 0) {
      throw new BadRequestException('Comment not found');
    }

    if (existing[0].user_id !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await prisma.$queryRawUnsafe(
      `UPDATE public.__comments SET deleted_at = NOW() WHERE id = $1`,
      commentId,
    );

    this.emitter.emit('comment.deleted', {
      tableId: existing[0].table_id,
      recordId: existing[0].record_id,
      commentId,
    });
  }

  async addReaction(commentId: number, userId: string, emoji: string): Promise<any> {
    const prisma = this.prisma.prismaClient;

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM public.__comments WHERE id = $1 AND deleted_at IS NULL`,
      commentId,
    );

    if (existing.length === 0) {
      throw new BadRequestException('Comment not found');
    }

    const reactions = existing[0].reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    const result: any[] = await prisma.$queryRawUnsafe(
      `UPDATE public.__comments SET reactions = $1::jsonb WHERE id = $2 RETURNING *`,
      JSON.stringify(reactions),
      commentId,
    );

    return result[0];
  }

  async removeReaction(commentId: number, userId: string, emoji: string): Promise<any> {
    const prisma = this.prisma.prismaClient;

    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM public.__comments WHERE id = $1 AND deleted_at IS NULL`,
      commentId,
    );

    if (existing.length === 0) {
      throw new BadRequestException('Comment not found');
    }

    const reactions = existing[0].reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    const result: any[] = await prisma.$queryRawUnsafe(
      `UPDATE public.__comments SET reactions = $1::jsonb WHERE id = $2 RETURNING *`,
      JSON.stringify(reactions),
      commentId,
    );

    return result[0];
  }
}
