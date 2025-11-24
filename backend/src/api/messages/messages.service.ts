import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CursorPaginationDto } from './dto/query-messages.dto';
import { Message, MessageStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async createMessage(dto: CreateMessageDto, fromIP: string) {
    const message = await this.prisma.message.create({
      data: {
        id: randomUUID(),
        fromIP,
        toIP: dto.toIP,
        subject: dto.subject,
        body: dto.body,
      },
    });

    this.messagesGateway.emitIncomingMessage(message);
    return message;
  }

  async getInboxMessages(toIP: string, query: CursorPaginationDto) {
    const { cursor, limit } = query;
    const paginationLimit = limit ?? 20;
    const cursorMessage = await this.getCursorMessage(cursor);

    if (cursorMessage && cursorMessage.toIP !== toIP) {
      throw new ForbiddenException('커서가 받은 쪽지 목록과 일치하지 않습니다.');
    }

    const where: Prisma.MessageWhereInput = this.buildCursorWhere(
      { toIP },
      cursorMessage,
    );

    return this.fetchMessages(where, paginationLimit);
  }

  async getSentMessages(fromIP: string, query: CursorPaginationDto) {
    const { cursor, limit } = query;
    const paginationLimit = limit ?? 20;
    const cursorMessage = await this.getCursorMessage(cursor);

    if (cursorMessage && cursorMessage.fromIP !== fromIP) {
      throw new ForbiddenException('커서가 보낸 쪽지 목록과 일치하지 않습니다.');
    }

    const where: Prisma.MessageWhereInput = this.buildCursorWhere(
      { fromIP },
      cursorMessage,
    );

    return this.fetchMessages(where, paginationLimit);
  }

  async getMessageById(id: string) {
    return this.findMessageOrThrow(id);
  }

  async cancelMessage(id: string, fromIP: string) {
    const message = await this.ensureSenderOwnership(id, fromIP);

    if (message.status !== MessageStatus.sent) {
      throw new BadRequestException('이미 처리된 쪽지는 취소할 수 없습니다.');
    }

    const updated = await this.prisma.message.update({
      where: { id },
      data: {
        status: MessageStatus.canceled,
        canceledAt: new Date(),
      },
    });

    this.messagesGateway.emitMessageUpdate(updated);
    return updated;
  }

  async deleteMessage(id: string, fromIP: string) {
    const message = await this.ensureSenderOwnership(id, fromIP);
    await this.prisma.message.delete({ where: { id } });

    this.messagesGateway.emitMessageDeleted({
      id: message.id,
      fromIP: message.fromIP,
      toIP: message.toIP,
    });

    return { message: '쪽지가 삭제되었습니다.' };
  }

  async getMessagesByStatus(
    status: MessageStatus,
    query: CursorPaginationDto,
  ) {
    const { cursor, limit } = query;
    const paginationLimit = limit ?? 20;
    const cursorMessage = await this.getCursorMessage(cursor);

    if (cursorMessage && cursorMessage.status !== status) {
      throw new ForbiddenException('커서가 상태 목록과 일치하지 않습니다.');
    }

    const where: Prisma.MessageWhereInput = this.buildCursorWhere(
      { status },
      cursorMessage,
    );

    return this.fetchMessages(where, paginationLimit);
  }

  async getNearbyUsers(requestIp: string) {
    const sessions = await this.prisma.connectionSession.findMany({
      where: {
        disconnectedAt: null,
        NOT: { ip: requestIp },
      },
      orderBy: { connectedAt: 'desc' },
      take: 200,
    });

    const users = sessions.map((session) => ({
      ip: session.ip,
      lastActive: session.connectedAt.toISOString(),
      sentCount: 0,
      receivedCount: 0,
      recentSubject: null,
      recentPreview: null,
    }));

    return {
      me: requestIp,
      network: null,
      users,
    };
  }

  private async fetchMessages(
    where: Prisma.MessageWhereInput,
    limit: number,
  ) {
    const messages = await this.prisma.message.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      take: limit,
    });

    return {
      data: messages,
      nextCursor: messages.length === limit ? messages[messages.length - 1].id : null,
    };
  }

  private buildCursorWhere(
    base: Prisma.MessageWhereInput,
    cursorMessage?: Message | null,
  ) {
    if (!cursorMessage) {
      return base;
    }

    return {
      AND: [
        base,
        {
          OR: [
            { createdAt: { lt: cursorMessage.createdAt } },
            {
              AND: [
                { createdAt: cursorMessage.createdAt },
                { id: { lt: cursorMessage.id } },
              ],
            },
          ],
        },
      ],
    };
  }

  private async getCursorMessage(cursor?: string | null) {
    if (!cursor) {
      return null;
    }

    const message = await this.prisma.message.findUnique({
      where: { id: cursor },
    });

    if (!message) {
      throw new NotFoundException('커서로 지정한 쪽지를 찾을 수 없습니다.');
    }

    return message;
  }

  private async ensureSenderOwnership(id: string, fromIP: string) {
    const message = await this.findMessageOrThrow(id);

    if (message.fromIP !== fromIP) {
      throw new ForbiddenException('보낸 사람만 쪽지를 수정할 수 있습니다.');
    }

    return message;
  }

  private async findMessageOrThrow(id: string) {
    const message = await this.prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('쪽지를 찾을 수 없습니다.');
    }

    return message;
  }

  private extractSubnetPrefix(ip: string) {
    if (!ip || ip.includes(':')) {
      return null;
    }

    const segments = ip.split('.');
    if (segments.length !== 4) {
      return null;
    }

    return `${segments[0]}.${segments[1]}.${segments[2]}.`;
  }

  private buildPreview(body?: string | null) {
    if (!body) {
      return null;
    }

    const trimmed = body.trim();
    if (trimmed.length <= 80) {
      return trimmed;
    }

    return `${trimmed.slice(0, 77)}...`;
  }
}
