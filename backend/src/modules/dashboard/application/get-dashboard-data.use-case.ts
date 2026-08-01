import { Inject, Injectable } from '@nestjs/common';
import type { IDashboardRepository } from '../domain/dashboard-repository.interface';

@Injectable()
export class GetDashboardDataUseCase {
  constructor(
    @Inject('IDashboardRepository')
    private readonly dashboardRepository: IDashboardRepository,
  ) {}

  async execute(tiendaId: string) {
    const [summary, recentSales, lowStock] = await Promise.all([
      this.dashboardRepository.getSummary(tiendaId),
      this.dashboardRepository.getRecentSales(tiendaId),
      this.dashboardRepository.getLowStockTallas(tiendaId),
    ]);

    return {
      summary,
      recentSales,
      lowStock,
    };
  }
}
