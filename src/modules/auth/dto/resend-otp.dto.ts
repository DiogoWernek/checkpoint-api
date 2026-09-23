import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { OtpType } from '../../../common/enums/otp-type.enum';

export class ResendOtpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: OtpType })
  @IsEnum(OtpType)
  type: OtpType;
}
