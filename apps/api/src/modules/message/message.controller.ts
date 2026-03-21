import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MessageService } from './message.service';
import { MessageResponseDto } from './dto/message-response.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('inbox')
  @ApiOperation({ summary: 'List inbox messages' })
  listInbox(@CurrentTenant() tenantId: string, @CurrentUser('sub') userId: string, @Query() query: PaginationQueryDto) {
    return this.messageService.listInbox(tenantId, userId, query);
  }

  @Get('sent')
  @ApiOperation({ summary: 'List sent messages' })
  listSent(@CurrentTenant() tenantId: string, @CurrentUser('sub') userId: string, @Query() query: PaginationQueryDto) {
    return this.messageService.listSent(tenantId, userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message detail' })
  getById(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    return this.messageService.getById(tenantId, userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send message' })
  send(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: SendMessageDto,
  ): Promise<MessageResponseDto> {
    return this.messageService.send(tenantId, userId, dto);
  }

  @Post(':id/reply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reply to message' })
  reply(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyMessageDto,
  ): Promise<MessageResponseDto> {
    return this.messageService.reply(tenantId, userId, id, dto);
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark message as read' })
  async markRead(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.messageService.markRead(tenantId, userId, id);
  }

  @Put(':id/archive')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive message' })
  async archive(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.messageService.archive(tenantId, userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete message' })
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.messageService.delete(tenantId, userId, id);
  }
}
