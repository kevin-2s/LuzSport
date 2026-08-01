import { Injectable } from '@nestjs/common';
import { ITiendaRepository } from '../domain/tienda-repository.interface';
import { TiendaEntity } from '../domain/tienda.entity';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

@Injectable()
export class PrismaTiendaRepository implements ITiendaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(nombre: string, direccion: string): Promise<TiendaEntity> {
    const tienda = await this.prisma.tienda.create({
      data: { nombre, direccion },
    });
    return this.toEntity(tienda);
  }

  async findAll(): Promise<TiendaEntity[]> {
    const tiendas = await this.prisma.tienda.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return tiendas.map((t) => this.toEntity(t));
  }

  async findById(id: string): Promise<TiendaEntity | null> {
    const tienda = await this.prisma.tienda.findUnique({
      where: { id },
    });
    if (!tienda) return null;
    return this.toEntity(tienda);
  }

  private toEntity(tienda: any): TiendaEntity {
    return new TiendaEntity(
      tienda.id,
      tienda.nombre,
      tienda.direccion,
      tienda.createdAt,
      tienda.updatedAt,
    );
  }
}
