import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import type { IClienteRepository } from '../domain/cliente-repository.interface';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { TiendaGuard } from '../../../shared/infrastructure/guards/tienda.guard';
import { ActiveUser } from '../../../shared/infrastructure/decorators/active-user.decorator';
import { Inject } from '@nestjs/common';

@Controller('clientes')
@UseGuards(JwtAuthGuard, TiendaGuard)
export class ClientesController {
  constructor(
    @Inject('IClienteRepository')
    private readonly clienteRepository: IClienteRepository,
  ) {}

  @Get()
  async list(@ActiveUser('tiendaId') tiendaId: string) {
    return this.clienteRepository.listByTienda(tiendaId);
  }

  @Post()
  async create(
    @ActiveUser('tiendaId') tiendaId: string,
    @Body() body: { nombre: string; telefono: string },
  ) {
    return this.clienteRepository.create(tiendaId, body);
  }
}
