import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Cliente, Venta } from './useVentas';

export interface Abono {
  id: string;
  fiadoId: string;
  fecha: string;
  monto: number;
  metodo: string;
  createdAt: string;
}

export interface Fiado {
  id: string;
  ventaId: string;
  clienteId: string;
  saldoPendiente: number;
  tipoCobro: string;
  diaCobro: string | null;
  fechaVencimiento: string;
  cliente: Cliente;
  venta: Venta;
  abonos: Abono[];
  createdAt: string;
  updatedAt: string;
}

export const useFiados = () => {
  const queryClient = useQueryClient();

  const queryFiados = useQuery<Fiado[]>({
    queryKey: ['fiados'],
    queryFn: async () => {
      const response = await api.get('/fiados');
      return response.data;
    },
  });

  const registrarAbonoMutation = useMutation({
    mutationFn: async ({ fiadoId, monto, metodo }: { fiadoId: string; monto: number; metodo: string }) => {
      const response = await api.post(`/fiados/${fiadoId}/abonos`, { monto, metodo });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiados'] });
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });

  return {
    fiados: queryFiados.data || [],
    isFiadosLoading: queryFiados.isLoading,
    registrarAbono: registrarAbonoMutation.mutateAsync,
    isRegistrandoAbono: registrarAbonoMutation.isPending,
  };
};
