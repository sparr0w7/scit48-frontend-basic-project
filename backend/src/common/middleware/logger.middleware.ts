import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    // 요청 정보 로깅
    this.logger.log(
      `📥 ${method} ${originalUrl} - ${ip} - ${userAgent}`,
    );

    // 쿼리 파라미터가 있으면 로깅
    if (Object.keys(request.query).length > 0) {
      this.logger.log(`   Query: ${JSON.stringify(request.query)}`);
    }

    // POST, PUT, PATCH 요청의 경우 body 로깅 (민감한 정보 제외)
    if (['POST', 'PUT', 'PATCH'].includes(method) && request.body) {
      const bodyToLog = { ...request.body };
      // 민감한 정보 마스킹
      if (bodyToLog.password) bodyToLog.password = '***';
      if (bodyToLog.token) bodyToLog.token = '***';
      if (bodyToLog.secret) bodyToLog.secret = '***';
      
      this.logger.log(`   Body: ${JSON.stringify(bodyToLog)}`);
    }

    // 응답 완료 후 로깅
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const responseTime = Date.now() - startTime;

      // 상태 코드에 따른 이모지
      const statusEmoji = 
        statusCode >= 500 ? '❌' :
        statusCode >= 400 ? '⚠️' :
        statusCode >= 300 ? '➡️' :
        statusCode >= 200 ? '✅' : '❓';

      this.logger.log(
        `${statusEmoji} ${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${contentLength || 0} bytes`,
      );
    });

    next();
  }
}