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

  async addStock(tiendaId: string, articuloId: string, tallaId: string, cantidad: number) {
    // Verificar que el artículo pertenece a la tienda
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tiendaId },
    });

    if (!articulo) {
      throw new Error('Artículo no encontrado o no pertenece a esta tienda');
    }

    return this.prisma.tallaStock.update({
      where: { id: tallaId },
      data: {
        cantidad: {
          increment: cantidad,
        },
      },
    });
  }
}
