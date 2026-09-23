import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/** "Receber código por e-mail" — login sem senha (tela Entrar). */
export class RequestOtpLoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
