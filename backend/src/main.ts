import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as session from 'express-session';
import * as FileStore from 'session-file-store';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 파일 기반 세션 스토어 설정
  const FileStoreSession = FileStore(session);

  // 세션 설정
  app.use(
    session({
      store: new FileStoreSession({
        path: './sessions', // 세션 파일이 저장될 디렉토리
        ttl: 86400, // 세션 유효 시간 (초 단위, 24시간)
        retries: 1,
      }),
      secret:
        process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
        sameSite: 'lax',
      },
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: true, // 모든 origin 허용 (개발 환경)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api'); // 모든 API 엔드포인트에 /api 접두사 추가

  const port = parseInt(process.env.PORT ?? '8000', 10);

  // Swagger 설정
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SCIT48 Service API')
    .setDescription('쪽지 플랫폼 백엔드 API 문서')
    .setVersion('1.0.0')
    .addServer(`http://localhost:${port}/api`, 'Local')
    .addTag('Messages', 'IP 기반 쪽지 API')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: true,
  });
  const swaggerPath = 'api/docs';

  SwaggerModule.setup(swaggerPath, app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
    customSiteTitle: 'SCIT48 API Docs',
  });

  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0'); // 모든 네트워크 인터페이스에서 접근 가능
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Swagger UI is available at: ${await app.getUrl()}/${swaggerPath}`,
  );
}

bootstrap();
