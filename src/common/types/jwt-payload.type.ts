export class JwtPayload {
  sub: string;
  username: string;
  iat?: number;
  exp?: number;
}

export class JwtRefreshPayload {
  sub: string;
  jti: string;
  rawToken?: string;
  iat?: number;
  exp?: number;
}
