import { Injectable } from '@nestjs/common';
import { IClienteRepository } from '../domain/cliente-repository.interface';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

@Injectable()
export class PrismaClienteRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByTienda(tiendaId: string) {
    return this.prisma.cliente.findMany({
      where: {
        tiendaId,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  async create(tiendaId: string, data: { nombre: string; telefono: string }) {
    return this.prisma.cliente.create({
      data: {
        tiendaId,
        nombre: data.nombre,
        telefono: data.telefono,
      },
    });
  }
}
