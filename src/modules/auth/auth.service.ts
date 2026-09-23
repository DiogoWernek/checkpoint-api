import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHash, randomInt, randomUUID } from 'crypto';
import type { Request } from 'express';

import { User } from '../users/entities/user.entity';
import { Otp } from './entities/otp.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { OtpType } from '../../common/enums/otp-type.enum';
import { JwtPayload, JwtRefreshPayload } from '../../common/types/jwt-payload.type';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../../mail/mail.service';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

type TokenPair = { accessToken: string; refreshToken: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
    @InjectRepository(RefreshToken) private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async usernameAvailable(username: string): Promise<boolean> {
    const exists = await this.usersRepo.findOne({ where: { username: username.toLowerCase() } });
    return !exists;
  }

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase();
    const username = dto.username.toLowerCase();

    const [emailTaken, usernameTaken] = await Promise.all([
      this.usersRepo.findOne({ where: { email } }),
      this.usersRepo.findOne({ where: { username } }),
    ]);
    if (emailTaken) throw new ConflictException('Esse e-mail já está em uso');
    if (usernameTaken) throw new ConflictException('Esse nome de usuário já está em uso');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = this.usersRepo.create({
      email,
      username,
      displayName: dto.displayName,
      passwordHash,
      isEmailVerified: false,
    });
    await this.usersRepo.save(user);

    const sent = await this.issueOtp(email, OtpType.EMAIL_VERIFICATION);

    return {
      message: sent
        ? 'Código de verificação enviado'
        : 'Conta criada, mas houve um problema ao enviar o e-mail. Use "Reenviar" na próxima tela.',
    };
  }

  async login(dto: LoginDto, req: Request): Promise<TokenPair> {
    const email = dto.email.toLowerCase();
    const user = await this.usersRepo.findOne({ where: { email } });

    // Hash sempre, mesmo sem usuário, pra não vazar timing de "existe ou não".
    const dummyHash = '$2a$12$dummyhashtopreventtimingattacks.dummyhashvalue0000000';
    const passwordValid = await bcrypt.compare(dto.password, user?.passwordHash ?? dummyHash);

    if (!user || !passwordValid) {
      if (user) await this.handleFailedLogin(user);
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new UnauthorizedException('Conta temporariamente bloqueada por tentativas inválidas. Tente de novo em alguns minutos.');
    }

    if (user.failedLoginAttempts > 0) {
      await this.usersRepo.update(user.id, { failedLoginAttempts: 0, lockedUntil: null });
    }

    return this.issueTokenPair(user, req);
  }

  /** "Receber código por e-mail" — login sem senha. Não revela se o e-mail existe. */
  async requestOtpLogin(email: string): Promise<void> {
    await this.issueOtp(email.toLowerCase(), OtpType.LOGIN);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!user) return; // anti-enumeração: sempre "sucesso"
    await this.issueOtp(user.email, OtpType.PASSWORD_RESET);
  }

  async resendOtp(email: string, type: OtpType): Promise<void> {
    const sent = await this.issueOtp(email.toLowerCase(), type);
    if (!sent) {
      throw new BadRequestException('Não foi possível enviar o código. Confira o e-mail e tente de novo.');
    }
  }

  /**
   * Valida o código. `EMAIL_VERIFICATION`/`LOGIN` já fazem login (retornam
   * tokens); `PASSWORD_RESET` só confirma o código — a troca de senha de
   * verdade (e o `used = true`) acontece em `resetPassword`, reenviando o
   * mesmo código junto da senha nova.
   */
  async verifyOtp(email: string, type: OtpType, code: string, req: Request): Promise<TokenPair | { valid: true }> {
    const target = email.toLowerCase();
    const otp = await this.findValidOtp(target, type, code);

    if (type === OtpType.PASSWORD_RESET) {
      return { valid: true };
    }

    await this.otpRepo.update(otp.id, { used: true });

    const user = await this.usersRepo.findOne({ where: { email: target } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    if (type === OtpType.EMAIL_VERIFICATION && !user.isEmailVerified) {
      await this.usersRepo.update(user.id, { isEmailVerified: true });
    }

    return this.issueTokenPair(user, req);
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const target = email.toLowerCase();
    const otp = await this.findValidOtp(target, OtpType.PASSWORD_RESET, code);
    await this.otpRepo.update(otp.id, { used: true });

    const user = await this.usersRepo.findOne({ where: { email: target } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await this.usersRepo.update(user.id, { passwordHash });
    await this.refreshTokenRepo.update({ userId: user.id }, { revokedAt: new Date() });
  }

  async refreshTokens(payload: JwtRefreshPayload & { rawToken: string }, req: Request): Promise<TokenPair> {
    const tokenHash = this.hashToken(payload.rawToken);
    const stored = await this.refreshTokenRepo.findOne({ where: { id: payload.jti, tokenHash }, relations: ['user'] });

    if (!stored || !stored.isValid) {
      // Reuso de token revogado é sinal de roubo — derruba tudo por segurança.
      if (stored) await this.refreshTokenRepo.update({ userId: stored.userId }, { revokedAt: new Date() });
      throw new UnauthorizedException('Sessão inválida — faça login de novo');
    }

    await this.refreshTokenRepo.update(stored.id, { revokedAt: new Date() });
    return this.issueTokenPair(stored.user, req);
  }

  async logout(userId: string): Promise<void> {
    await this.refreshTokenRepo.update({ userId }, { revokedAt: new Date() });
  }

  // ─── Privado ────────────────────────────────────────────────────────────

  private async findValidOtp(target: string, type: OtpType, code: string): Promise<Otp> {
    const otp = await this.otpRepo.findOne({ where: { target, type, used: false }, order: { createdAt: 'DESC' } });

    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException('Código inválido ou expirado');
    }
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      await this.otpRepo.update(otp.id, { used: true });
      throw new BadRequestException('Código inválido — muitas tentativas. Peça um novo.');
    }

    const valid = await bcrypt.compare(code, otp.codeHash);
    if (!valid) {
      await this.otpRepo.increment({ id: otp.id }, 'attempts', 1);
      throw new BadRequestException('Código incorreto. Confira e tente de novo.');
    }

    return otp;
  }

  private async issueTokenPair(user: User, req: Request): Promise<TokenPair> {
    const accessPayload: JwtPayload = { sub: user.id, username: user.username };
    const tokenId = randomUUID();
    const refreshPayload: JwtRefreshPayload = { sub: user.id, jti: tokenId };

    const [accessToken, rawRefreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '30d',
      }),
    ]);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepo.save(
      this.refreshTokenRepo.create({
        id: tokenId,
        userId: user.id,
        tokenHash: this.hashToken(rawRefreshToken),
        expiresAt,
        ipAddress: this.extractIp(req),
        userAgent: (req.headers['user-agent'] ?? '').toString().substring(0, 500),
      }),
    );

    return { accessToken, refreshToken: rawRefreshToken };
  }

  /** @returns `true` se o e-mail foi enviado (o OTP é salvo mesmo se falhar — dá pra reenviar). */
  private async issueOtp(target: string, type: OtpType): Promise<boolean> {
    await this.otpRepo.update({ target, type, used: false }, { used: true });

    const plainCode = String(randomInt(100000, 999999));
    const codeHash = await bcrypt.hash(plainCode, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    await this.otpRepo.save(this.otpRepo.create({ target, type, codeHash, expiresAt }));

    try {
      await this.mailService.sendOtp(target, plainCode, type);
      return true;
    } catch (err) {
      this.logger.error(`Falha ao enviar OTP pra ${target}`, err);
      return false;
    }
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const attempts = user.failedLoginAttempts + 1;
    const update: Partial<User> = { failedLoginAttempts: attempts };

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_MINUTES);
      update.lockedUntil = lockedUntil;
      update.failedLoginAttempts = 0;
    }

    await this.usersRepo.update(user.id, update);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private extractIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      'unknown'
    ).substring(0, 45);
  }
}
