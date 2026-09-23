import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
    return user;
  }
}
