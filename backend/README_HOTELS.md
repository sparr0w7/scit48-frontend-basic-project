# 호텔 데이터 시딩 가이드

## 개요
서울시 주요 호텔 30개의 실제 데이터를 데이터베이스에 삽입하는 스크립트입니다.

## 포함된 호텔 (30개)

### 5성급 특급 호텔
- 서울 신라호텔
- 롯데호텔 서울
- 그랜드 하얏트 서울
- 파크 하얏트 서울
- 포시즌스 호텔 서울
- 콘래드 서울
- 시그니엘 서울
- JW 메리어트 호텔 서울
- 웨스틴 조선 서울

### 비즈니스 호텔
- 그랜드 인터컨티넨탈 서울 파르나스
- 코엑스 인터컨티넨탈 서울
- 노보텔 앰배서더 서울 강남
- 드래곤 시티 호텔
- 페어몬트 앰배서더 서울

### 지역별 분포
- **강남구**: 5개
- **중구**: 6개
- **종로구**: 2개
- **용산구**: 3개
- **영등포구**: 3개
- **송파구**: 2개
- **기타**: 9개

## 실행 방법

### 1. 데이터베이스 준비
```bash
# Docker 컨테이너 실행 (MySQL)
cd backend
docker-compose up -d

# Prisma 마이그레이션 적용
npx prisma migrate deploy
npx prisma generate
```

### 2. 호텔 데이터 시딩
```bash
# backend 디렉토리에서 실행
cd backend

# 스크립트 실행
npm run seed:hotels

# 또는 직접 실행
npx ts-node prisma/seed-hotels.ts
```

### 3. 데이터 확인
```bash
# MySQL 접속
docker exec -it backend-mysql-1 mysql -u root -p

# 데이터베이스 선택
USE project_boat;

# 호텔 개수 확인
SELECT COUNT(*) FROM Hotel;

# 호텔 목록 확인
SELECT id, name, address_ko FROM Hotel LIMIT 10;

# 특정 위치 주변 호텔 검색 (강남역 기준 5km 이내)
SELECT 
  name,
  address_ko,
  ST_Distance_Sphere(location, POINT(127.0276, 37.4979)) / 1000 as distance_km
FROM Hotel
HAVING distance_km < 5
ORDER BY distance_km;
```

## API 테스트

### 주변 호텔 검색
```bash
# 강남역 주변 5km 이내 호텔 검색
curl "http://localhost:3001/api/hotels/nearby?latitude=37.4979&longitude=127.0276&radius=5"

# 명동 주변 3km 이내 호텔 검색
curl "http://localhost:3001/api/hotels/nearby?latitude=37.5640&longitude=126.9886&radius=3"
```

## 주의사항

1. **기존 데이터 삭제**: 스크립트 실행 시 기존 Hotel 테이블 데이터가 모두 삭제됩니다.

2. **좌표 정확도**: 모든 호텔의 위도/경도는 실제 위치를 기반으로 합니다.

3. **중복 실행**: 스크립트를 여러 번 실행해도 안전합니다 (기존 데이터 삭제 후 재삽입).

## 데이터 구조

```typescript
{
  id: string,           // 자동 생성 (CUID)
  name: string,         // 호텔명
  address: string,      // 영문 주소
  address_ko: string,   // 한글 주소
  location: Point,      // MySQL Point 타입 (경도, 위도)
  createdAt: DateTime,  // 생성 시각
  updatedAt: DateTime   // 수정 시각
}
```

## 트러블슈팅

### 1. ts-node 실행 오류
```bash
npm install -D ts-node typescript @types/node
```

### 2. Prisma Client 오류
```bash
npx prisma generate
```

### 3. MySQL 연결 오류
```bash
# .env 파일 확인
DATABASE_URL="mysql://root:password@localhost:3306/project_boat"

# Docker 컨테이너 상태 확인
docker ps
```

### 4. Point 타입 오류
MySQL 8.0 이상이 필요합니다. Docker Compose에서 MySQL 8.0 이미지를 사용 중인지 확인하세요.