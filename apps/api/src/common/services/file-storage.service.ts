import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class FileStorageService implements OnModuleInit {
  private readonly logger = new Logger(FileStorageService.name);
  private minioClient: Minio.Client;
  private bucket: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.endpoint')!,
      port: this.configService.get<number>('minio.port')!,
      useSSL: this.configService.get<boolean>('minio.useSSL')!,
      accessKey: this.configService.get<string>('minio.accessKey')!,
      secretKey: this.configService.get<string>('minio.secretKey')!,
    });

    this.bucket = this.configService.get<string>('minio.bucket')!;
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    const exists = await this.minioClient.bucketExists(this.bucket);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucket);
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucket}/*`],
          },
        ],
      };
      await this.minioClient.setBucketPolicy(
        this.bucket,
        JSON.stringify(policy),
      );
      this.logger.log(`Bucket ${this.bucket} created with public read policy`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    const ext = path.extname(file.originalname);
    const key = `${folder}/${uuidv4()}${ext}`;

    await this.minioClient.putObject(
      this.bucket,
      key,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const url = await this.getPublicUrl(key);
    return { url, key };
  }

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    await this.minioClient.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': contentType,
    });

    const url = await this.getPublicUrl(key);
    return { url, key };
  }

  async deleteFile(key: string): Promise<void> {
    await this.minioClient.removeObject(this.bucket, key);
  }

  async getPresignedUrl(key: string, expiry: number = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucket, key, expiry);
  }

  private async getPublicUrl(key: string): Promise<string> {
    const endpoint = this.configService.get<string>('minio.endpoint');
    const port = this.configService.get<number>('minio.port');
    const useSSL = this.configService.get<boolean>('minio.useSSL');
    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${this.bucket}/${key}`;
  }
}
