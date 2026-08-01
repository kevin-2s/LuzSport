import { Rol } from '@prisma/client';

export interface IUserRepository {
  create(email: string, passwordHash: string, rol: Rol, tiendaId: string | null): Promise<any>;
  findByEmail(email: string): Promise<any>;
}
