import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface TallaStock {
  id: string;
  articuloId: string;
  talla: string;
  cantidad: number;
  stockMinimo: number;
  createdAt: string;
  updatedAt: string;
}

export interface Articulo {
  id: string;
  nombre: string;
  categoria: string;
  color: string;
  precio: number;
  tiendaId: string;
  tallas: TallaStock[];
  createdAt: string;
  updatedAt: string;
}

export const useArticulos = () => {
  const queryClient = useQueryClient();

  const query = useQuery<Articulo[]>({
    queryKey: ['articulos'],
    queryFn: async () => {
      const response = await api.get('/articulos');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      nombre: string;
      categoria: string;
      color: string;
      precio: number;
      tallas: { talla: string; cantidad: number; stockMinimo: number }[];
    }) => {
      const response = await api.post('/articulos', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: async ({ articuloId, tallaId, cantidad }: { articuloId: string, tallaId: string, cantidad: number }) => {
      const response = await api.patch(`/articulos/${articuloId}/stock`, { tallaId, cantidad });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articulos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });

  return {
    articulos: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createArticulo: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    addStock: addStockMutation.mutateAsync,
    isAddingStock: addStockMutation.isPending,
  };
};
