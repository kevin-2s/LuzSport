export interface IDashboardRepository {
  getSummary(tiendaId: string): Promise<{
    totalVendidoHoy: number;
    ventasHoyCount: number;
    tallasAlertaCount: number;
    fiadosPendientesMonto: number;
    fiadosClientesCount: number;
    fiadosVencidosCount: number;
    cobrosHoy: any[];
  }>;
  getRecentSales(tiendaId: string): Promise<any[]>;
  getLowStockTallas(tiendaId: string): Promise<any[]>;
}
