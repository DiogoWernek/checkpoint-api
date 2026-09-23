import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

/**
 * Storage de avatares. Diferente do api-fops (documentos privados com signed
 * URL): aqui o bucket é público de leitura — avatar precisa carregar direto
 * num `<img src>` sem token, igual o bucket `cp_avatars` do Supabase Storage
 * que este projeto usava antes.
 */
@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = configService.getOrThrow<string>('MINIO_BUCKET');
    this.publicUrl = configService.getOrThrow<string>('MINIO_PUBLIC_URL').replace(/\/$/, '');

    this.client = new Minio.Client({
      endPoint: configService.getOrThrow<string>('MINIO_ENDPOINT'),
      port: Number(configService.get('MINIO_PORT') ?? 9000),
      useSSL: configService.get('MINIO_USE_SSL') === 'true',
      accessKey: configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
      secretKey: configService.getOrThrow<string>('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
        this.logger.log(`Bucket "${this.bucket}" criado`);
      }
      await this.client.setBucketPolicy(
        this.bucket,
        JSON.stringify({
          Version: '2012-10-17',
          Statement: [{ Effect: 'Allow', Principal: '*', Action: ['s3:GetObject'], Resource: [`arn:aws:s3:::${this.bucket}/*`] }],
        }),
      );
    } catch (err) {
      this.logger.error('Erro ao verificar/criar bucket MinIO', err);
    }
  }

  /** Sobe o arquivo e devolve a URL pública final (já pronta pra salvar em `avatar_url`). */
  async uploadPublic(objectKey: string, buffer: Buffer, mimeType: string, size: number): Promise<string> {
    try {
      await this.client.putObject(this.bucket, objectKey, buffer, size, { 'Content-Type': mimeType });
      return `${this.publicUrl}/${objectKey}`;
    } catch (err) {
      this.logger.error(`Falha no upload do objeto "${objectKey}"`, err);
      throw new InternalServerErrorException('Erro ao salvar arquivo');
    }
  }

  async remove(objectKey: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, objectKey);
    } catch (err) {
      this.logger.warn(`Falha ao remover objeto "${objectKey}"`, err);
    }
  }
}
