export interface IClienteRepository {
  listByTienda(tiendaId: string): Promise<any[]>;
  create(tiendaId: string, data: { nombre: string; telefono: string }): Promise<any>;
}
