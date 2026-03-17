import { ApiProperty } from '@nestjs/swagger';
import { Message, MessageStatus, User } from '@prisma/client';

interface MessageUserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

type MessageWithUsers = Message & {
  sender: User;
  receiver: User;
};

export class MessageUserSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  static from(user: MessageUserSummary): MessageUserSummaryDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}

export class MessageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  senderId!: string;

  @ApiProperty()
  receiverId!: string;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty({ enum: MessageStatus })
  status!: MessageStatus;

  @ApiProperty({ nullable: true })
  parentId!: string | null;

  @ApiProperty({ type: MessageUserSummaryDto })
  sender!: MessageUserSummaryDto;

  @ApiProperty({ type: MessageUserSummaryDto })
  receiver!: MessageUserSummaryDto;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  static from(message: MessageWithUsers): MessageResponseDto {
    return {
      id: message.id,
      tenantId: message.tenantId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      subject: message.subject,
      body: message.body,
      status: message.status,
      parentId: message.parentId,
      sender: MessageUserSummaryDto.from(message.sender),
      receiver: MessageUserSummaryDto.from(message.receiver),
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }
}
