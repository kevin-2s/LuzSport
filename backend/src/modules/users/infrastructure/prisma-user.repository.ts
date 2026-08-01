import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/user-repository.interface';
import { PrismaService } from '../../../shared/infrastructure/database/prisma.service';
import { Rol } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, passwordHash: string, rol: Rol, tiendaId: string | null): Promise<any> {
    return this.prisma.usuario.create({
      data: {
        email,
        password: passwordHash,
        rol,
        tiendaId,
      },
    });
  }

  async findByEmail(email: string): Promise<any> {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }
}
