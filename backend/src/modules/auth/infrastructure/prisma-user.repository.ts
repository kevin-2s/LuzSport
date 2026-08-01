import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/user-repository.interface';
import { UserEntity } from '../domain/user.entity';
import { PrismaService } from '../../../../src/shared/infrastructure/database/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (!user) return null;
    return this.toEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });
    if (!user) return null;
    return this.toEntity(user);
  }

  private toEntity(user: any): UserEntity {
    return new UserEntity(
      user.id,
      user.email,
      user.password,
      user.rol,
      user.tiendaId,
      user.createdAt,
      user.updatedAt,
    );
  }
}
