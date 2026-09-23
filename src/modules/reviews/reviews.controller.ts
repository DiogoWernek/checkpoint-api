import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('games/:gameId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Reviews de um jogo (autor, nota, curtidas/comentários)' })
  byGame(@Param('gameId') gameId: string) {
    return this.reviewsService.findByGame(gameId);
  }
}
