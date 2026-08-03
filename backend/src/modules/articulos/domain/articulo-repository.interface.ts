export interface IArticuloRepository {
  listByTienda(tiendaId: string): Promise<any[]>;
  create(tiendaId: string, data: {
    nombre: string;
    categoria: string;
    color: string;
    precio: number;
    tallas: { talla: string; cantidad: number; stockMinimo: number }[];
  }): Promise<any>;
}
