import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, Matches } from 'class-validator';
import { OtpType } from '../../../common/enums/otp-type.enum';

export class VerifyOtpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: OtpType })
  @IsEnum(OtpType)
  type: OtpType;

  @ApiProperty({ example: '123456' })
  @Matches(/^\d{6}$/, { message: 'O código tem 6 dígitos' })
  code: string;
}
