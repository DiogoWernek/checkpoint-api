import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'O código tem 6 dígitos' })
  code: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
