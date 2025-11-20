import { ApiProperty } from '@nestjs/swagger';

export class NearbyUserSummaryDto {
  @ApiProperty({ description: '사용자 IP', example: '203.0.113.17' })
  ip: string;

  @ApiProperty({
    description: '최근 활동 시각 (ISO8601)',
    example: '2024-12-27T09:30:00.000Z',
  })
  lastActive: string;

  @ApiProperty({ description: '보낸 메시지 수', example: 3 })
  sentCount: number;

  @ApiProperty({ description: '받은 메시지 수', example: 2 })
  receivedCount: number;

  @ApiProperty({
    description: '최근 메시지 제목',
    required: false,
    example: '같은 네트워크 반가워요',
  })
  recentSubject?: string | null;

  @ApiProperty({
    description: '최근 메시지 본문 미리보기',
    required: false,
    example: '안녕하세요! 혹시 여기 자주 접속하시나요?',
  })
  recentPreview?: string | null;
}

export class NearbyUsersResponseDto {
  @ApiProperty({
    description: '요청자의 IP',
    example: '203.0.113.3',
  })
  me: string;

  @ApiProperty({
    description: '요청자가 속한 /24 네트워크',
    example: '203.0.113.0/24',
    nullable: true,
  })
  network: string | null;

  @ApiProperty({
    description: '같은 네트워크에서 감지된 사용자 목록',
    type: NearbyUserSummaryDto,
    isArray: true,
  })
  users: NearbyUserSummaryDto[];
}
