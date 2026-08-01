import { TiendaEntity } from './tienda.entity';

export interface ITiendaRepository {
  create(nombre: string, direccion: string): Promise<TiendaEntity>;
  findAll(): Promise<TiendaEntity[]>;
  findById(id: string): Promise<TiendaEntity | null>;
}
