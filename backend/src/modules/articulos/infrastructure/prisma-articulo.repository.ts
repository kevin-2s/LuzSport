import { Injectable } from '@nestjs/common';
import { IArticuloRepository } from '../domain/articulo-repository.interface';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

@Injectable()
export class PrismaArticuloRepository implements IArticuloRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByTienda(tiendaId: string) {
    return this.prisma.articulo.findMany({
      where: {
        tiendaId,
      },
      include: {
        tallas: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  async create(tiendaId: string, data: {
    nombre: string;
    categoria: string;
    color: string;
    precio: number;
    tallas: { talla: string; cantidad: number; stockMinimo: number }[];
  }) {
    return this.prisma.articulo.create({
      data: {
        tiendaId,
        nombre: data.nombre,
        categoria: data.categoria,
        color: data.color,
        precio: data.precio,
        tallas: {
          createMany: {
            data: data.tallas.map((t) => ({
              talla: t.talla,
              cantidad: t.cantidad,
              stockMinimo: t.stockMinimo,
            })),
          },
        },
      },
      include: {
        tallas: true,
      },
    });
  }
}
