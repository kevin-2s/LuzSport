export class TiendaEntity {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly direccion: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
