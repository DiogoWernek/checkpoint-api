import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';

@ApiTags('Social')
@Controller()
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('users/:userId/seguindo-por-mim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Se eu (logado) sigo esse usuário' })
  async isFollowing(@CurrentUser() me: JwtPayload, @Param('userId') userId: string) {
    return { following: await this.socialService.isFollowing(me.sub, userId) };
  }

  @Post('users/:userId/seguir')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seguir usuário' })
  follow(@CurrentUser() me: JwtPayload, @Param('userId') userId: string) {
    return this.socialService.follow(me.sub, userId);
  }

  @Delete('users/:userId/seguir')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deixar de seguir' })
  unfollow(@CurrentUser() me: JwtPayload, @Param('userId') userId: string) {
    return this.socialService.unfollow(me.sub, userId);
  }

  @Get('users/:userId/favoritos')
  @ApiOperation({ summary: 'Favoritos (até 4) de um usuário' })
  favorites(@Param('userId') userId: string) {
    return this.socialService.favoritesByUser(userId);
  }
}
