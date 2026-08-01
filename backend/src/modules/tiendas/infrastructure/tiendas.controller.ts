import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateTiendaUseCase } from '../application/create-tienda.use-case';
import { ListTiendasUseCase } from '../application/list-tiendas.use-case';
import { CreateTiendaDto } from './dtos/create-tienda.dto';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/infrastructure/guards/roles.guard';
import { Roles } from '../../../shared/infrastructure/decorators/roles.decorator';
import { Rol } from '@prisma/client';

@Controller('tiendas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TiendasController {
  constructor(
    private readonly createTiendaUseCase: CreateTiendaUseCase,
    private readonly listTiendasUseCase: ListTiendasUseCase,
  ) {}

  @Post()
  @Roles(Rol.SUPERADMIN)
  async create(@Body() createTiendaDto: CreateTiendaDto) {
    return this.createTiendaUseCase.execute(createTiendaDto.nombre, createTiendaDto.direccion);
  }

  @Get()
  @Roles(Rol.SUPERADMIN)
  async findAll() {
    return this.listTiendasUseCase.execute();
  }
}
