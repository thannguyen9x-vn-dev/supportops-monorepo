import { Injectable, Logger } from '@nestjs/common';
import { MessageStatus } from '@prisma/client';
import { PageMeta, pageMetaOf } from '../../common/dto/page-meta.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { ForbiddenException } from '../../common/exceptions/forbidden.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageResponseDto } from './dto/message-response.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listInbox(
    tenantId: string,
    userId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: MessageResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where = {
      tenantId,
      receiverId: userId,
      status: { not: MessageStatus.ARCHIVED },
      ...(query.search
        ? {
            OR: [
              { subject: { contains: query.search, mode: 'insensitive' as const } },
              { body: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        include: { sender: true, receiver: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      data: items.map((item) => MessageResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async listSent(
    tenantId: string,
    userId: string,
    query: PaginationQueryDto,
  ): Promise<{ data: MessageResponseDto[]; meta: PageMeta }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const skip = (page - 1) * size;

    const where = {
      tenantId,
      senderId: userId,
      ...(query.search
        ? {
            OR: [
              { subject: { contains: query.search, mode: 'insensitive' as const } },
              { body: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.message.findMany({
        where,
        include: { sender: true, receiver: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: size,
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      data: items.map((item) => MessageResponseDto.from(item)),
      meta: pageMetaOf({ page, size, total }),
    };
  }

  async getById(tenantId: string, userId: string, id: string): Promise<MessageResponseDto> {
    const message = await this.prisma.message.findFirst({
      where: {
        id,
        tenantId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: { sender: true, receiver: true },
    });

    if (!message) {
      throw new NotFoundException('Message', id);
    }

    return MessageResponseDto.from(message);
  }

  async send(tenantId: string, senderId: string, dto: SendMessageDto): Promise<MessageResponseDto> {
    if (senderId === dto.receiverId) {
      throw new ForbiddenException('Cannot send message to yourself');
    }

    await this.ensureReceiver(tenantId, dto.receiverId);

    const message = await this.prisma.message.create({
      data: {
        tenantId,
        senderId,
        receiverId: dto.receiverId,
        subject: dto.subject,
        body: dto.body,
        status: MessageStatus.UNREAD,
      },
      include: { sender: true, receiver: true },
    });

    this.logger.log(`Message sent: id=${message.id}, tenantId=${tenantId}`);
    return MessageResponseDto.from(message);
  }

  async reply(tenantId: string, userId: string, parentId: string, dto: ReplyMessageDto): Promise<MessageResponseDto> {
    const parent = await this.prisma.message.findFirst({
      where: {
        id: parentId,
        tenantId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    if (!parent) {
      throw new NotFoundException('Message', parentId);
    }

    const receiverId = parent.senderId === userId ? parent.receiverId : parent.senderId;
    await this.ensureReceiver(tenantId, receiverId);

    const subject = dto.subject ?? (parent.subject.startsWith('Re:') ? parent.subject : `Re: ${parent.subject}`);

    const message = await this.prisma.message.create({
      data: {
        tenantId,
        senderId: userId,
        receiverId,
        subject,
        body: dto.body,
        status: MessageStatus.UNREAD,
        parentId: parent.id,
      },
      include: { sender: true, receiver: true },
    });

    this.logger.log(`Message replied: id=${message.id}, parentId=${parent.id}, tenantId=${tenantId}`);
    return MessageResponseDto.from(message);
  }

  async markRead(tenantId: string, userId: string, id: string): Promise<void> {
    const existing = await this.prisma.message.findFirst({
      where: {
        id,
        tenantId,
        receiverId: userId,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Message', id);
    }

    await this.prisma.message.update({
      where: { id },
      data: { status: MessageStatus.READ },
    });
  }

  async archive(tenantId: string, userId: string, id: string): Promise<void> {
    const existing = await this.prisma.message.findFirst({
      where: {
        id,
        tenantId,
        receiverId: userId,
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Message', id);
    }

    await this.prisma.message.update({
      where: { id },
      data: { status: MessageStatus.ARCHIVED },
    });
  }

  async delete(tenantId: string, userId: string, id: string): Promise<void> {
    const existing = await this.prisma.message.findFirst({
      where: {
        id,
        tenantId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Message', id);
    }

    await this.prisma.message.delete({ where: { id } });
  }

  private async ensureReceiver(tenantId: string, receiverId: string): Promise<void> {
    const receiver = await this.prisma.user.findFirst({
      where: {
        id: receiverId,
        tenantId,
        isActive: true,
      },
      select: { id: true },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver', receiverId);
    }
  }
}
