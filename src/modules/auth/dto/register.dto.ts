import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'jogador@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'marina.joga', description: 'Minúsculas, números, ponto e underline — 3 a 20 caracteres.' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-z0-9._]+$/, { message: 'Use só letras minúsculas, números, ponto e underline' })
  username: string;

  @ApiProperty({ example: 'Marina Costa' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  displayName: string;

  @ApiProperty({ example: 'senha-bem-forte-123' })
  @IsString()
  @MinLength(8)
  @MaxLength(72) // limite físico do bcrypt
  password: string;
}
