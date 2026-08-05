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

    // 1. Total vendido hoy and transaction count (Only PAGADA sales)
    const salesToday = await this.prisma.venta.findMany({
      where: {
        tiendaId,
        estado: 'PAGADA',
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
    const activeFiados = await this.prisma.fiado.findMany({
      where: {
        venta: {
          tiendaId,
        },
        saldoPendiente: {
          gt: 0,
        },
      },
      include: {
        cliente: true,
      },
    });

    const fiadosPendientesMonto = activeFiados.reduce((sum, f) => sum + f.saldoPendiente, 0);
    const uniqueClients = new Set(activeFiados.map((f) => f.clienteId));
    const fiadosClientesCount = uniqueClients.size;

    const now = new Date();
    const fiadosVencidosCount = activeFiados.filter((f) => f.fechaVencimiento < now).length;

    const cobrosHoy = activeFiados
      .filter((f) => f.fechaVencimiento <= endOfToday)
      .map((f) => ({
        id: f.id,
        clienteNombre: f.cliente.nombre,
        clienteTelefono: f.cliente.telefono,
        saldoPendiente: f.saldoPendiente,
        tipoCobro: f.tipoCobro,
        fechaVencimiento: f.fechaVencimiento,
      }));

    return {
      totalVendidoHoy,
      ventasHoyCount,
      tallasAlertaCount,
      fiadosPendientesMonto,
      fiadosClientesCount,
      fiadosVencidosCount,
      cobrosHoy,
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

    return ventas.map((v) => {
      const articuloNames = v.detalles
        .map((d) => `${articleMap.get(d.articuloId) || 'Artículo'} T${d.talla} (${d.cantidad})`)
        .join(', ');

      return {
        id: v.id,
        articulo: articuloNames || 'Venta sin artículos',
        fecha: new Date(v.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        cliente: v.fiado?.cliente?.nombre || null,
        monto: v.total,
        estado: v.estado.toLowerCase(),
      };
    });
  }

  async getLowStockTallas(tiendaId: string) {
    const tallas = await this.prisma.$queryRaw<any[]>`
      SELECT 
        a.id as "articuloId", 
        a.nombre as "articuloNombre", 
        ts.talla, 
        ts.cantidad, 
        ts."stockMinimo",
        (SELECT COUNT(*) FROM "TallaStock" WHERE "articuloId" = a.id) as "totalTallasArticulo"
      FROM "TallaStock" ts
      INNER JOIN "Articulo" a ON ts."articuloId" = a.id
      WHERE a."tiendaId" = ${tiendaId} AND ts.cantidad <= ts."stockMinimo"
    `;

    const grouped = new Map<string, any>();
    
    for (const t of tallas) {
      const totalTallas = Number(t.totalTallasArticulo);
      if (!grouped.has(t.articuloId)) {
        grouped.set(t.articuloId, {
          id: t.articuloId,
          articulo: t.articuloNombre,
          tallasBajas: [],
          totalTallas
        });
      }
      grouped.get(t.articuloId).tallasBajas.push({
        talla: t.talla,
        cantidad: t.cantidad
      });
    }

    const result = Array.from(grouped.values()).map(art => {
      const isCompletamenteAgotado = art.tallasBajas.length === art.totalTallas && art.tallasBajas.every((t: any) => t.cantidad === 0);
      const stock = art.tallasBajas.reduce((sum: number, t: any) => sum + t.cantidad, 0);
      
      let descripcion = '';
      if (isCompletamenteAgotado) {
        descripcion = 'Agotado totalmente';
      } else if (art.tallasBajas.length === art.totalTallas) {
        descripcion = 'Todas las tallas con stock bajo';
      } else {
        descripcion = `Tallas: ${art.tallasBajas.map((t: any) => t.talla).join(', ')}`;
      }

      return {
        id: art.id,
        articulo: art.articulo,
        descripcion,
        stock
      };
    });

    result.sort((a, b) => a.stock - b.stock);
    return result.slice(0, 5);
  }
}
