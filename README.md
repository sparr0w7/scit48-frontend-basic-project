# IpTalk (SCIT48 프론트엔드 기본 프로젝트)

익명 사용자가 공용 네트워크(IP /24 대역) 안에서 메시지를 주고받을 수 있도록 설계한 실험적 서비스입니다.  
NestJS + Prisma 기반의 API 서버와 순수 HTML/CSS/JS로 만든 다중 페이지 프론트엔드가 같은 저장소에 들어 있습니다.

## 저장소 구조

| 경로 | 설명 |
| --- | --- |
| `backend/` | NestJS 10 기반 API 서버. Prisma(MySQL)와 Socket.IO 게이트웨이를 사용해 메시지 CRUD, 근처 사용자 조회, 실시간 이벤트를 제공합니다. |
| `frontend/` | 정적 멀티 페이지 앱. `shared/`에 공통 레이아웃, 메시지 API 래퍼, Socket.IO 구독, 토스트 UI가 들어있습니다. |
| `backend/static-files/` | Nginx 등으로 바로 서비스할 수 있는 정적 자원 샘플. |

## 기술 스택

- **Backend:** NestJS 10, Prisma ORM(MySQL), express-session(FileStore), Socket.IO, Swagger.
- **Frontend:** 순수 HTML/CSS/ES Modules, Fetch API, Socket.IO 클라이언트(CDN), ipify 공개 API.
- **Infra/도구:** Docker Compose(MySQL + phpMyAdmin + Nginx 정적 배포 예시), Yarn/NPM 스크립트, Jest/ESLint/Prettier.

## 주요 기능

- 로그인 없이 IP 기반으로 메시지 전송 (`POST /api/messages`) 및 조회(받은/보낸/상태별 페이징).
- 동일 /24 대역에서 최근 3일간 활동한 사용자 탐색(`GET /api/messages/nearby`).
- 메시지 취소/삭제, 커서 기반 무한 스크롤을 고려한 정렬/필터 로직.
- Socket.IO 네임스페이스(`/messages`)를 통한 실시간 수신/업데이트/삭제 알림 + 프론트 토스트 UI.
- Swagger 문서(`/api/docs`) 및 요청/응답 로깅 미들웨어, 세션 파일스토어를 이용한 간단한 상태 관리.
- 프론트 페이지: 메인, 쪽지 작성, 받은쪽지, 보낸쪽지, 주변 사용자, 소개 템플릿.

## 백엔드 실행 방법 (`backend/`)

### 1. 필수 도구

- Node.js 18 LTS 이상 (Nest 10 권장 사양)
- Yarn 1.x 또는 npm
- MySQL 8 (또는 `docker compose` 이용)

### 2. 환경 변수 만들기

`backend/.env` 파일을 수동으로 생성해 아래 값들을 지정합니다.

```env
DATABASE_URL="mysql://admin:admin@localhost:3306/iptalk"
PORT=8000
SESSION_SECRET=change-me
```

> Docker Compose를 쓰면 `admin:admin@localhost:3306/iptalk` 조합이 바로 살아납니다. 외부 DB를 쓰는 경우 접속 정보를 알맞게 변경하세요.

### 3. 의존성 설치 및 DB 준비

```bash
cd backend
yarn install          # 또는 npm install

# (선택) Docker로 MySQL/관리자 도구 실행
docker compose up -d db phpmyadmin

# Prisma 마이그레이션 및 스키마 동기화
npx prisma migrate deploy
npx prisma generate
```

- Prisma 스키마는 `prisma/schema.prisma`이며 `messages` 테이블과 인덱스가 정의돼 있습니다.
- 세션 파일은 `backend/sessions/` 폴더에 자동으로 생성되므로, 필요한 경우 권한을 755 이상으로 맞춰 주세요.

### 4. 개발/운영 실행

```bash
# 개발 (파일 감시)
yarn start:dev

# 단발 실행
yarn start

# 프로덕션 빌드 후 실행
yarn build
yarn start:prod
```

- 서버는 기본으로 `http://localhost:8000/api`를 루트로 사용하며, Swagger UI는 `http://localhost:8000/api/docs`에서 확인할 수 있습니다.
- Socket.IO 엔드포인트는 `ws://localhost:8000/messages`입니다.

### 5. 테스트 및 기타 스크립트

```bash
yarn test         # 단위 테스트
yarn test:e2e     # e2e (기본 Nest 템플릿)
yarn lint         # ESLint + Prettier
```

## API 개요

| 메서드/경로 | 설명 |
| --- | --- |
| `GET /api/messages/my-ip` | 요청자의 공인 IP를 반환 |
| `GET /api/messages/nearby` | 같은 /24 대역에서 최근 3일 내 활동한 사용자 요약 |
| `POST /api/messages` | `toIP`, `subject`, `body`로 새 쪽지를 발송 |
| `GET /api/messages/inbox` | 받은 쪽지(cursor, limit 지원) |
| `GET /api/messages/sent` | 보낸 쪽지(cursor, limit 지원) |
| `GET /api/messages/:id` | 특정 메시지 상세 |
| `POST /api/messages/:id/cancel` | 발신자가 미처리 메시지를 취소 |
| `DELETE /api/messages/:id` | 발신자가 메시지 삭제 |
| `GET /api/messages/status/:status` | 상태(sent/canceled/failed)별 히스토리 |

모든 REST 응답은 Nest ValidationPipe + class-transformer DTO를 거치며, 오류 시 한국어 예외 메시지를 제공합니다.

## 프론트엔드 실행 방법 (`frontend/`)

정적 HTML/ES Module 프로젝트인 만큼 별도의 빌드 도구가 없습니다. 임의의 정적 서버로 `frontend/` 루트를 서빙하면 됩니다.

```bash
# 예시: npm http-server 사용
npx http-server frontend -p 4173 --cors
```

- 각 페이지(`index/index.html`, `compose/compose.html`, …)는 공통 레이아웃을 초기화하기 위해 `<script type="module">`에서 `shared/layout.js`를 import 합니다.
- 백엔드 주소는 `shared/messagesApi.js`의 `BASE_URL`/`WS_BASE_URL` 상수에서 관리합니다. API 서버 포트나 HTTPS 프록시를 바꾸면 이 값을 수정하세요.
- Socket.IO 클라이언트는 CDN(`https://cdn.socket.io/4.7.5/socket.io.min.js`)으로 동적으로 로드되며 새 메시지 알림을 토스트로 띄웁니다.

### 페이지 요약

- **메인(index):** ipify API로 내 IP 및 /24 대역을 조회하고 주요 섹션으로 이동하는 허브입니다.
- **쪽지 작성(compose):** IP 유효성 검증, 미리보기 카드, 성공/오류 알림을 제공하며 즉시 `POST /messages` 요청을 보냅니다.
- **받은쪽지(inbox):** 최초 페이지 로딩 시 받은 메시지를 가져오고, Socket.IO 구독으로 실시간 갱신합니다.
- **보낸쪽지(sent):** 상태 배지, 통계(SENT/CANCELED/FAILED 카운트)를 렌더링합니다.
- **주변 사용자(nearby):** `GET /messages/nearby` 응답을 카드 리스트로 보여주고, 같은 대역 메시지가 생기면 자동으로 갱신합니다.
- **소개(about):** 프로젝트 개요 페이지. 통계/설정 메뉴는 현재 숨겨졌습니다.

## 개발 팁

- `shared/messagesSocket.js`는 한 번만 Socket.IO를 초기화하고 페이지별 구독자에게 브로드캐스트합니다. 페이지 이동 시 불필요한 소켓 생성이 없도록 `subscribeToMessages`에서 언구독 함수를 반환합니다.
- 로거 미들웨어(`backend/src/common/middleware/logger.middleware.ts`)가 모든 요청/응답을 출력하므로, 배포 전에는 `Logger.logLevel` 조정이나 APM 연동을 고려하세요.
- API 기본 포트(8000)와 정적 서버 포트가 다를 경우 CORS가 허용되도록 `main.ts`에서 `origin: true`로 설정되어 있습니다. 실서비스에선 구체적인 허용 도메인을 지정하세요.

필요한 내용이 더 있다면 언제든 알려 주세요!
