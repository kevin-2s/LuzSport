import { Injectable } from '@nestjs/common';
import { IVentaRepository } from '../domain/venta-repository.interface';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

@Injectable()
export class PrismaVentaRepository implements IVentaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByTienda(tiendaId: string) {
    const ventas = await this.prisma.venta.findMany({
      where: {
        tiendaId,
      },
      include: {
        detalles: true,
        fiado: {
          include: {
            cliente: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    // Fetch articles names to map them dynamically
    const articleIds = Array.from(new Set(ventas.flatMap((v) => v.detalles.map((d) => d.articuloId))));
    const articles = await this.prisma.articulo.findMany({
      where: {
        id: {
          in: articleIds,
        },
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    const articleMap = new Map(articles.map((a) => [a.id, a.nombre]));

    return ventas.map((v) => ({
      ...v,
      detalles: v.detalles.map((d) => ({
        ...d,
        articuloNombre: articleMap.get(d.articuloId) || 'Artículo Eliminado',
      })),
    }));
  }

  async create(
    tiendaId: string,
    data: {
      total: number;
      estado: 'PAGADA' | 'FIADA';
      detalles: { articuloId: string; talla: string; cantidad: number; precioUnitario: number }[];
      clienteId?: string;
      tipoCobro?: string;
      diaCobro?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Create the sale
      const venta = await tx.venta.create({
        data: {
          tiendaId,
          total: data.total,
          estado: data.estado,
          detalles: {
            createMany: {
              data: data.detalles.map((d) => ({
                articuloId: d.articuloId,
                talla: d.talla,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
              })),
            },
          },
        },
        include: {
          detalles: true,
        },
      });

      // 2. Subtract stock from TallaStock
      for (const d of data.detalles) {
        const tallaStock = await tx.tallaStock.findFirst({
          where: {
            articuloId: d.articuloId,
            talla: d.talla,
          },
        });

        if (!tallaStock) {
          throw new Error(`No se encontró stock para la talla ${d.talla} del artículo.`);
        }

        if (tallaStock.cantidad < d.cantidad) {
          throw new Error(`Stock insuficiente para la talla ${d.talla}. Stock disponible: ${tallaStock.cantidad}`);
        }

        await tx.tallaStock.update({
          where: {
            id: tallaStock.id,
          },
          data: {
            cantidad: tallaStock.cantidad - d.cantidad,
          },
        });
      }

      // 3. Create Fiado record if marked as FIADA
      if (data.estado === 'FIADA') {
        if (!data.clienteId) {
          throw new Error('Debe seleccionar un cliente para registrar una venta fiada.');
        }

        const tipoCobro = data.tipoCobro || 'DIARIO';
        const diaCobro = data.diaCobro || null;
        const fechaVencimiento = calculateNextDueDate(new Date(), tipoCobro, diaCobro || undefined);

        await tx.fiado.create({
          data: {
            ventaId: venta.id,
            clienteId: data.clienteId,
            saldoPendiente: data.total,
            tipoCobro,
            diaCobro,
            fechaVencimiento,
          },
        });
      }

      return venta;
    });
  }
}

export function calculateNextDueDate(baseDate: Date, tipoCobro: string, diaCobro?: string): Date {
  const result = new Date(baseDate);
  if (tipoCobro === 'DIARIO') {
    result.setDate(result.getDate() + 1);
  } else if (tipoCobro === 'SEMANAL') {
    const weekdayMap: Record<string, number> = {
      'DOMINGO': 0,
      'LUNES': 1,
      'MARTES': 2,
      'MIERCOLES': 3,
      'JUEVES': 4,
      'VIERNES': 5,
      'SABADO': 6,
    };
    const targetDay = weekdayMap[diaCobro?.toUpperCase() || ''] ?? 1; // Default to Lunes if invalid
    const currentDay = result.getDay();
    let daysToAdd = (targetDay - currentDay + 7) % 7;
    if (daysToAdd === 0) daysToAdd = 7; // Next occurrence is next week if today is that day
    result.setDate(result.getDate() + daysToAdd);
  } else if (tipoCobro === 'QUINCENAL') {
    result.setDate(result.getDate() + 15);
  } else if (tipoCobro === 'MENSUAL') {
    result.setMonth(result.getMonth() + 1);
  }
  return result;
}
