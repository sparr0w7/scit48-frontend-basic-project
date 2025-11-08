import { ApiProperty } from '@nestjs/swagger';
import { MessageStatus } from '@prisma/client';

export class MessageDto {
  @ApiProperty({ description: '쪽지 ID', example: 'b3b5d0ea-5e4e-4b3a-b134-5e58af7d6cb1' })
  id: string;

  @ApiProperty({ description: '발신자 IP', example: '192.0.2.10' })
  fromIP: string;

  @ApiProperty({ description: '수신자 IP', example: '198.51.100.23' })
  toIP: string;

  @ApiProperty({ description: '쪽지 제목', example: '프론트 로비에서 만나요', required: false })
  subject?: string | null;

  @ApiProperty({ description: '쪽지 본문', example: '체크인 완료되었습니다.' })
  body: string;

  @ApiProperty({
    description: '쪽지 상태',
    enum: MessageStatus,
    example: MessageStatus.sent,
  })
  status: MessageStatus;

  @ApiProperty({ description: '생성 시각', type: String, example: '2024-08-01T12:34:56.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정 시각', type: String, example: '2024-08-01T12:34:56.000Z' })
  updatedAt: Date;

  @ApiProperty({
    description: '취소 시각',
    type: String,
    nullable: true,
    example: '2024-08-01T13:00:00.000Z',
  })
  canceledAt?: Date | null;
}
