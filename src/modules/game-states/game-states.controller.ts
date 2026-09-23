import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameStatesService } from './game-states.service';
import { SetGameStateDto } from './dto/set-game-state.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';

@ApiTags('Game states')
@Controller('game-states')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GameStatesController {
  constructor(private readonly service: GameStatesService) {}

  @Get(':gameId/me')
  @ApiOperation({ summary: 'Meu estado atual com esse jogo (Sua nota, ações rápidas ativas)' })
  mine(@CurrentUser() user: JwtPayload, @Param('gameId') gameId: string) {
    return this.service.get(user.sub, gameId);
  }

  @Get(':gameId/amigos')
  @ApiOperation({ summary: 'Amigos que jogaram (quem eu sigo com estado nesse jogo)' })
  friends(@CurrentUser() user: JwtPayload, @Param('gameId') gameId: string) {
    return this.service.friendsWhoPlayed(user.sub, gameId);
  }

  @Put()
  @ApiOperation({ summary: 'Ação rápida (Zerei/Jogando/Quero jogar/Curti) — upsert em game_states' })
  set(@CurrentUser() user: JwtPayload, @Body() dto: SetGameStateDto) {
    return this.service.set(user.sub, dto);
  }
}
