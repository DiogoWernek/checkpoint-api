import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { GameStatus } from '../../../common/enums/game-status.enum';

/** Corpo das ações rápidas (Zerei/Jogando/Quero jogar/Curti) — só mexe em game_states. */
export class SetGameStateDto {
  @ApiProperty()
  @IsUUID()
  gameId: string;

  @ApiProperty({ enum: GameStatus })
  @IsEnum(GameStatus)
  status: GameStatus;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, description: 'Escala do banco (meia estrela × 2). null = sem nota.' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rating?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  liked?: boolean;
}
