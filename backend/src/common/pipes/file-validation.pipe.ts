import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  // 허용할 이미지 파일의 매직 넘버 (파일 시그니처)
  private readonly allowedSignatures = {
    jpeg: 'ffd8ffe0',
    png: '89504e47',
    gif: '47494638',
    webp: '52494646', // RIFF
  };

  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('파일이 전송되지 않았습니다.');
    }

    // 파일 버퍼의 첫 4바이트를 16진수 문자열로 변환
    const signature = value.buffer.toString('hex', 0, 4);

    // WebP의 경우 추가적인 시그니처 확인
    if (signature === this.allowedSignatures.webp) {
      const webpSignature = value.buffer.toString('hex', 8, 12); // WEBP 시그니처
      if (webpSignature !== '57454250') {
        throw new BadRequestException(
          '유효하지 않은 WebP 파일 형식입니다.',
        );
      }
    } else {
      // 다른 이미지 형식의 경우 일반적인 시그니처 확인
      const isValid = Object.values(this.allowedSignatures).some((s) =>
        signature.startsWith(s),
      );

      if (!isValid) {
        throw new BadRequestException(
          '유효하지 않은 파일 형식입니다. JPEG, PNG, GIF, WebP 파일만 업로드할 수 있습니다.',
        );
      }
    }

    return value;
  }
}
