import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface DashboardSummary {
  totalVendidoHoy: number;
  ventasHoyCount: number;
  tallasAlertaCount: number;
  fiadosPendientesMonto: number;
  fiadosClientesCount: number;
}

export interface RecentSale {
  id: string;
  articulo: string;
  fecha: string;
  cliente: string | null;
  monto: number;
  estado: 'pagada' | 'fiada';
}

export interface LowStockTalla {
  id: string;
  articulo: string;
  descripcion: string;
  stock: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentSales: RecentSale[];
  lowStock: LowStockTalla[];
}

export const useDashboard = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      const response = await api.get('/dashboard/data');
      return response.data;
    },
  });
};
