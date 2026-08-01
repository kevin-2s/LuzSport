import { Rol } from '@prisma/client';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly rol: Rol,
    public readonly tiendaId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
