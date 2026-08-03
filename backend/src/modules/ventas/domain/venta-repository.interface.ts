export interface IVentaRepository {
  listByTienda(tiendaId: string): Promise<any[]>;
  create(tiendaId: string, data: {
    total: number;
    estado: 'PAGADA' | 'FIADA';
    detalles: { articuloId: string; talla: string; cantidad: number; precioUnitario: number }[];
    clienteId?: string;
  }): Promise<any>;
}
