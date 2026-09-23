import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { GameStatus, REGISTER_STATUSES } from '../../../common/enums/game-status.enum';

export class RegisterLogDto {
  @ApiProperty()
  @IsUUID()
  gameId: string;

  @ApiProperty({ enum: REGISTER_STATUSES })
  @IsIn(REGISTER_STATUSES)
  status: Exclude<GameStatus, GameStatus.WISHLIST>;

  @ApiPropertyOptional({ minimum: 1, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  liked?: boolean;

  @ApiPropertyOptional({ example: '2026-09-23' })
  @IsOptional()
  @IsDateString()
  playedOn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(9999)
  hours?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  platform?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isReplay?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  reviewBody?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  reviewHasSpoilers?: boolean;
}
