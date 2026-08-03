import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { TiendasModule } from './modules/tiendas/infrastructure/tiendas.module';
import { UsersModule } from './modules/users/infrastructure/users.module';
import { DashboardModule } from './modules/dashboard/infrastructure/dashboard.module';
import { ArticulosModule } from './modules/articulos/infrastructure/articulos.module';
import { VentasModule } from './modules/ventas/infrastructure/ventas.module';
import { ClientesModule } from './modules/clientes/infrastructure/clientes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    TiendasModule,
    UsersModule,
    DashboardModule,
    ArticulosModule,
    VentasModule,
    ClientesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
