import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetDashboardDataUseCase } from '../application/get-dashboard-data.use-case';
import { JwtAuthGuard } from '../../../shared/infrastructure/guards/jwt-auth.guard';
import { TiendaGuard } from '../../../shared/infrastructure/guards/tienda.guard';
import { ActiveUser } from '../../../shared/infrastructure/decorators/active-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, TiendaGuard)
export class DashboardController {
  constructor(private readonly getDashboardDataUseCase: GetDashboardDataUseCase) {}

  @Get('data')
  async getDashboardData(@ActiveUser('tiendaId') tiendaId: string) {
    return this.getDashboardDataUseCase.execute(tiendaId);
  }
}
