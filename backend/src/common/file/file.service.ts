import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
  private readonly staticFilesPath: string;
  private readonly nginxImageServerUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.staticFilesPath = path.join(process.cwd(), 'static-files', 'images');
    this.nginxImageServerUrl = this.configService.get<string>('NGINX_IMAGE_SERVER_URL');

    // 정적 파일 저장 경로가 없으면 생성
    if (!fs.existsSync(this.staticFilesPath)) {
      fs.mkdirSync(this.staticFilesPath, { recursive: true });
    }
  }

  /**
   * 파일을 로컬 디스크에 저장하고, Nginx를 통해 접근 가능한 URL을 반환합니다.
   * @param file Express.Multer.File 객체
   * @returns 업로드된 파일의 URL
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.staticFilesPath, fileName);

    try {
      await fs.promises.writeFile(filePath, file.buffer);
      const fileUrl = `${this.nginxImageServerUrl}/${fileName}`;
      console.log(`File uploaded successfully to: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error('File upload failed:', error);
      throw new Error('File upload failed.');
    }
  }
}
