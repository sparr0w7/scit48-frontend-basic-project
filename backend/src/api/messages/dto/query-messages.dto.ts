import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIP,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CursorPaginationDto {
  @ApiPropertyOptional({
    description: '커서로 사용할 이전 마지막 메시지 ID',
    example: 'b3b5d0ea-5e4e-4b3a-b134-5e58af7d6cb1',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: '가져올 최대 메시지 수',
    default: 20,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class InboxQueryDto extends CursorPaginationDto {
  @ApiProperty({
    description: '수신자 IP 주소',
    example: '198.51.100.23',
  })
  @IsIP()
  toIP: string;
}

export class StatusParamDto {
  @ApiProperty({
    description: '조회할 메시지 상태',
    enum: MessageStatus,
    example: MessageStatus.sent,
  })
  @IsEnum(MessageStatus)
  status: MessageStatus;
}
