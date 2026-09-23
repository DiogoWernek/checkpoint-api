import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { seconds, Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestOtpLoginDto } from './dto/request-otp-login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, JwtRefreshPayload } from '../../common/types/jwt-payload.type';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('username-disponivel/:username')
  @ApiOperation({ summary: 'Checagem de disponibilidade de username (debounce no client)' })
  @ApiOkResponse({ schema: { example: { available: true } } })
  async usernameAvailable(@Param('username') username: string) {
    return { available: await this.authService.usernameAvailable(username) };
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Criar conta', description: 'Envia OTP de verificação por e-mail.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Entrar com e-mail e senha' })
  @ApiOkResponse({ schema: { example: { accessToken: 'eyJ...', refreshToken: 'eyJ...' } } })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas ou conta bloqueada' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }

  @Post('login/otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Pedir código de login sem senha' })
  requestOtpLogin(@Body() dto: RequestOtpLoginDto) {
    return this.authService.requestOtpLogin(dto.email).then(() => ({ message: 'Se esse e-mail existir, um código foi enviado' }));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Throttle({ default: { limit: 20, ttl: seconds(60) } })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Renovar tokens', description: 'Envia refreshToken no body. Rotação automática.' })
  refresh(@CurrentUser() payload: JwtRefreshPayload & { rawToken: string }, @Req() req: Request) {
    return this.authService.refreshTokens(payload, req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sair', description: 'Revoga todos os refresh tokens do usuário.' })
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Verificar código OTP', description: 'email_verification e login retornam tokens; password_reset só confirma.' })
  verifyOtp(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    return this.authService.verifyOtp(dto.email, dto.type, dto.code, req);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Reenviar OTP' })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email, dto.type).then(() => ({ message: 'Código reenviado' }));
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: seconds(300) } })
  @ApiOperation({ summary: 'Recuperar senha', description: 'Sempre retorna sucesso (anti-enumeração).' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email).then(() => ({ message: 'Se esse e-mail existir, um código foi enviado' }));
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: seconds(60) } })
  @ApiOperation({ summary: 'Redefinir senha com OTP' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword).then(() => ({ message: 'Senha redefinida' }));
  }
}
