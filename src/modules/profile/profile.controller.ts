import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@Controller('perfil')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':userId/stats')
  @ApiOperation({ summary: 'Contadores do perfil (jogos, em <ano>, reviews, listas, seguidores/seguindo)' })
  stats(@Param('userId') userId: string) {
    return this.profileService.stats(userId);
  }

  @Get(':userId/jogando-agora')
  @ApiOperation({ summary: '"Jogando agora" — estado playing mais recente + horas/plataforma do log' })
  playingNow(@Param('userId') userId: string) {
    return this.profileService.playingNow(userId);
  }

  @Get(':userId/diario')
  @ApiOperation({ summary: 'Diário — últimos registros, mais recentes primeiro' })
  diary(@Param('userId') userId: string, @Query('limit') limit?: string) {
    return this.profileService.diary(userId, limit ? Number(limit) : undefined);
  }

  @Get(':userId/notas')
  @ApiOperation({ summary: 'Histograma de notas do usuário (10 faixas de meia estrela) + média' })
  ratingHistogram(@Param('userId') userId: string) {
    return this.profileService.ratingHistogram(userId);
  }
}
