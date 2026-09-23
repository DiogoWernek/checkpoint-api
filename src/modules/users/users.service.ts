import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MinioService } from '../../storage/minio.service';

const ALLOWED_AVATAR_MIME = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly minioService: MinioService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { username: username.toLowerCase() } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    await this.usersRepo.update(userId, dto);
    return this.findById(userId);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    if (!file) throw new BadRequestException('Envie um arquivo');
    if (!ALLOWED_AVATAR_MIME.has(file.mimetype)) {
      throw new BadRequestException('Formato inválido — use PNG, JPEG ou WebP');
    }
    if (file.size > MAX_AVATAR_BYTES) {
      throw new BadRequestException('Arquivo muito grande (máx. 5MB)');
    }

    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const objectKey = `${userId}/${randomUUID()}.${ext}`;

    const url = await this.minioService.uploadPublic(objectKey, file.buffer, file.mimetype, file.size);
    await this.usersRepo.update(userId, { avatarUrl: url });
    return this.findById(userId);
  }
}
