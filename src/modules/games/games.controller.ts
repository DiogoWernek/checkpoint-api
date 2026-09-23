import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Games')
@Controller('games')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Busca jogos na IGDB por texto (e cacheia os resultados)' })
  search(@Query('q') query: string) {
    return this.gamesService.search(query ?? '');
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Detalhe do jogo por slug — usa cache quando não está velho' })
  bySlug(@Param('slug') slug: string) {
    return this.gamesService.getBySlug(slug);
  }
}
