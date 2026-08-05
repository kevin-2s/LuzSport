import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { TiendaGuard } from '../../../shared/infrastructure/guards/tienda.guard';
import { ActiveUser } from '../../../shared/infrastructure/decorators/active-user.decorator';
import { calculateNextDueDate } from '../../ventas/infrastructure/prisma-venta.repository';

@Controller('fiados')
@UseGuards(JwtAuthGuard, TiendaGuard)
export class FiadosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@ActiveUser('tiendaId') tiendaId: string) {
    const fiados = await this.prisma.fiado.findMany({
      where: {
        venta: {
          tiendaId,
        },
      },
      include: {
        cliente: true,
        abonos: {
          orderBy: {
            fecha: 'desc',
          },
        },
        venta: {
          include: {
            detalles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const articleIds = Array.from(new Set(fiados.flatMap((f) => f.venta.detalles.map((d) => d.articuloId))));
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

    return fiados.map((f) => ({
      ...f,
      venta: {
        ...f.venta,
        detalles: f.venta.detalles.map((d) => ({
          ...d,
          articuloNombre: articleMap.get(d.articuloId) || 'Artículo',
        })),
      },
    }));
  }

  @Post(':id/abonos')
  async registrarAbono(
    @ActiveUser('tiendaId') tiendaId: string,
    @Param('id') fiadoId: string,
    @Body() body: { monto: number; metodo?: string },
  ) {
    const { monto, metodo } = body;
    if (monto === undefined || monto === null || monto <= 0) {
      throw new BadRequestException('El monto del abono debe ser mayor a cero.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Get fiado details
      const fiado = await tx.fiado.findFirst({
        where: {
          id: fiadoId,
          venta: {
            tiendaId,
          },
        },
      });

      if (!fiado) {
        throw new BadRequestException('Fiado no encontrado.');
      }

      if (fiado.saldoPendiente <= 0) {
        throw new BadRequestException('Este fiado ya está completamente pagado.');
      }

      if (monto > fiado.saldoPendiente) {
        throw new BadRequestException(`El monto del abono ($${monto}) supera el saldo pendiente ($${fiado.saldoPendiente}).`);
      }

      // 2. Create Abono
      const abono = await tx.abono.create({
        data: {
          fiadoId,
          monto,
          metodo: metodo || 'EFECTIVO',
        },
      });

      // 3. Update Fiado saldo and shift next due date if unpaid
      const nuevoSaldo = fiado.saldoPendiente - monto;
      const nextDueDate = nuevoSaldo > 0 
        ? calculateNextDueDate(new Date(), fiado.tipoCobro, fiado.diaCobro || undefined)
        : fiado.fechaVencimiento;

      await tx.fiado.update({
        where: { id: fiadoId },
        data: { 
          saldoPendiente: nuevoSaldo,
          fechaVencimiento: nextDueDate
        },
      });

      // 4. If paid off completely, set sale state to PAGADA
      if (nuevoSaldo === 0) {
        await tx.venta.update({
          where: { id: fiado.ventaId },
          data: { estado: 'PAGADA' },
        });
      }

      return abono;
    });
  }
}
