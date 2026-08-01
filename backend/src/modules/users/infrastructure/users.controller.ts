import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateManagerUseCase } from '../application/create-manager.use-case';
import { CreateManagerDto } from './dtos/create-manager.dto';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/infrastructure/guards/roles.guard';
import { Roles } from '../../../shared/infrastructure/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly createManagerUseCase: CreateManagerUseCase) {}

  @Post('manager')
  @Roles(Rol.SUPERADMIN)
  async createManager(@Body() createManagerDto: CreateManagerDto) {
    return this.createManagerUseCase.execute(
      createManagerDto.email,
      createManagerDto.password,
      createManagerDto.tiendaId,
    );
  }
}
