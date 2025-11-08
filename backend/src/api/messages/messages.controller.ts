import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageDto } from './dto/message.dto';
import {
  CursorPaginationDto,
  InboxQueryDto,
  StatusParamDto,
} from './dto/query-messages.dto';
import { Request } from 'express';
import { getClientIp } from '../../common/utils/request-ip.util';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: '새로운 쪽지 생성' })
  @ApiResponse({ status: 201, description: '쪽지 생성 성공', type: MessageDto })
  createMessage(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true })) createMessageDto: CreateMessageDto,
  ) {
    const fromIP = getClientIp(req);
    return this.messagesService.createMessage(createMessageDto, fromIP);
  }

  @Get('inbox')
  @ApiOperation({ summary: '받은 쪽지 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '받은 쪽지 페이징 결과',
    type: MessageDto,
    isArray: false,
  })
  getInboxMessages(
    @Query(new ValidationPipe({ transform: true })) query: InboxQueryDto,
  ) {
    return this.messagesService.getInboxMessages(query);
  }

  @Get('sent')
  @ApiOperation({ summary: '보낸 쪽지 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '보낸 쪽지 페이징 결과',
  })
  getSentMessages(
    @Req() req: Request,
    @Query(new ValidationPipe({ transform: true })) query: CursorPaginationDto,
  ) {
    const fromIP = getClientIp(req);
    return this.messagesService.getSentMessages(fromIP, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '쪽지 상세 조회' })
  @ApiParam({ name: 'id', description: '쪽지 ID' })
  @ApiResponse({ status: 200, description: '쪽지 상세', type: MessageDto })
  getMessage(@Param('id') id: string) {
    return this.messagesService.getMessageById(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '보낸 쪽지 취소' })
  @ApiParam({ name: 'id', description: '쪽지 ID' })
  @ApiResponse({ status: 200, description: '쪽지 취소 성공', type: MessageDto })
  cancelMessage(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const fromIP = getClientIp(req);
    return this.messagesService.cancelMessage(id, fromIP);
  }

  @Delete(':id')
  @ApiOperation({ summary: '보낸 쪽지 삭제' })
  @ApiParam({ name: 'id', description: '쪽지 ID' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  deleteMessage(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const fromIP = getClientIp(req);
    return this.messagesService.deleteMessage(id, fromIP);
  }

  @Get('status/:status')
  @ApiOperation({ summary: '상태별 쪽지 조회' })
  @ApiParam({
    name: 'status',
    description: '조회할 상태(sent, canceled, failed)',
  })
  @ApiResponse({ status: 200, description: '상태별 쪽지 목록' })
  getMessagesByStatus(
    @Param(new ValidationPipe({ transform: true })) params: StatusParamDto,
    @Query(new ValidationPipe({ transform: true })) query: CursorPaginationDto,
  ) {
    return this.messagesService.getMessagesByStatus(params.status, query);
  }
}
