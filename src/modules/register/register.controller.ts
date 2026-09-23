import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterService } from './register.service';
import { RegisterLogDto } from './dto/register-log.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/types/jwt-payload.type';

@ApiTags('Register')
@Controller('register')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar/avaliar um jogo — cria log de diário + espelha game_state + review opcional' })
  registrar(@CurrentUser() user: JwtPayload, @Body() dto: RegisterLogDto) {
    return this.registerService.registrarLog(user.sub, dto);
  }
}
