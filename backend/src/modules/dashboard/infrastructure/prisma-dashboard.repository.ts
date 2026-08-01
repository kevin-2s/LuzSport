import { Injectable } from '@nestjs/common';
import { IDashboardRepository } from '../domain/dashboard-repository.interface';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';

@Injectable()
export class PrismaDashboardRepository implements IDashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tiendaId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Total vendido hoy and transaction count
    const salesToday = await this.prisma.venta.findMany({
      where: {
        tiendaId,
        fecha: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      select: {
        total: true,
      },
    });

    const totalVendidoHoy = salesToday.reduce((sum, sale) => sum + sale.total, 0);
    const ventasHoyCount = salesToday.length;

    // 2. Tallas con alerta (cantidad <= stockMinimo) usando queryRaw para comparar campos de la misma tabla
    const alertResult = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int as count 
      FROM "TallaStock" ts
      INNER JOIN "Articulo" a ON ts."articuloId" = a.id
      WHERE a."tiendaId" = ${tiendaId} AND ts.cantidad <= ts."stockMinimo"
    `;
    const tallasAlertaCount = alertResult[0]?.count || 0;

    // 3. Fiados pendientes (saldoPendiente > 0)
    const fiados = await this.prisma.fiado.findMany({
      where: {
        venta: {
          tiendaId,
        },
        saldoPendiente: {
          gt: 0,
        },
      },
      select: {
        saldoPendiente: true,
        clienteId: true,
      },
    });

    const fiadosPendientesMonto = fiados.reduce((sum, f) => sum + f.saldoPendiente, 0);
    const uniqueClients = new Set(fiados.map((f) => f.clienteId));
    const fiadosClientesCount = uniqueClients.size;

    return {
      totalVendidoHoy,
      ventasHoyCount,
      tallasAlertaCount,
      fiadosPendientesMonto,
      fiadosClientesCount,
    };
  }

  async getRecentSales(tiendaId: string) {
    const ventas = await this.prisma.venta.findMany({
      where: {
        tiendaId,
      },
      orderBy: {
        fecha: 'desc',
      },
      take: 5,
      include: {
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
    });

    return ventas.map((v) => ({
      id: v.id,
      articulo: 'Venta #' + v.id.slice(-6).toUpperCase(),
      fecha: new Date(v.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      cliente: v.fiado?.cliente?.nombre || null,
      monto: v.total,
      estado: v.estado.toLowerCase(),
    }));
  }

  async getLowStockTallas(tiendaId: string) {
    const tallas = await this.prisma.$queryRaw<any[]>`
      SELECT ts.id, a.nombre as "articuloNombre", ts.talla, ts.cantidad
      FROM "TallaStock" ts
      INNER JOIN "Articulo" a ON ts."articuloId" = a.id
      WHERE a."tiendaId" = ${tiendaId} AND ts.cantidad <= ts."stockMinimo"
      ORDER BY ts.cantidad ASC
      LIMIT 5
    `;

    return tallas.map((t) => ({
      id: t.id,
      articulo: t.articuloNombre,
      descripcion: `Talla ${t.talla}`,
      stock: t.cantidad,
    }));
  }
}
