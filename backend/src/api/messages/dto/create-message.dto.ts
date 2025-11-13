import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsIP } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: '수신자 IP 주소',
    example: '198.51.100.23',
  })
  @IsIP()
  toIP: string;

  @ApiProperty({
    description: '쪽지 제목',
    example: '프론트 로비에서 만나요',
    maxLength: 120,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  subject?: string;

  @ApiProperty({
    description: '쪽지 본문',
    example: '체크인 완료되었습니다. 로비에서 안내 도와드릴게요.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;
}
