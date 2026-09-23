import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GameStatesService } from './game-states.service';
import { SetGameStateDto } from './dto/set-game-state.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';

@ApiTags('Game states')
@Controller('game-states')
export class GameStatesController {
  constructor(private readonly service: GameStatesService) {}

  @Get(':gameId/stats')
  @ApiOperation({ summary: 'Média/histograma do jogo (público — igual a leitura das reviews)' })
  stats(@Param('gameId') gameId: string) {
    return this.service.gameStats(gameId);
  }

  @Get(':gameId/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Meu estado atual com esse jogo (Sua nota, ações rápidas ativas)' })
  mine(@CurrentUser() user: JwtPayload, @Param('gameId') gameId: string) {
    return this.service.get(user.sub, gameId);
  }

  @Get(':gameId/amigos')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Amigos que jogaram (quem eu sigo com estado nesse jogo)' })
  friends(@CurrentUser() user: JwtPayload, @Param('gameId') gameId: string) {
    return this.service.friendsWhoPlayed(user.sub, gameId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ação rápida (Zerei/Jogando/Quero jogar/Curti) — upsert em game_states' })
  set(@CurrentUser() user: JwtPayload, @Body() dto: SetGameStateDto) {
    return this.service.set(user.sub, dto);
  }
}
