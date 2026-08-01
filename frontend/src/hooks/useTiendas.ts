import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface Tienda {
  id: string;
  nombre: string;
  direccion: string;
  createdAt: string;
}

export const useTiendas = () => {
  const queryClient = useQueryClient();

  const tiendasQuery = useQuery<Tienda[]>({
    queryKey: ['tiendas'],
    queryFn: async () => {
      const response = await api.get('/tiendas');
      return response.data;
    },
  });

  const createTiendaMutation = useMutation({
    mutationFn: async (data: { nombre: string; direccion: string }) => {
      const response = await api.post('/tiendas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiendas'] });
    },
  });

  const createManagerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; tiendaId: string }) => {
      const response = await api.post('/users/manager', data);
      return response.data;
    },
  });

  return {
    tiendas: tiendasQuery.data || [],
    isLoading: tiendasQuery.isLoading,
    error: tiendasQuery.error,
    createTienda: createTiendaMutation.mutateAsync,
    isCreatingTienda: createTiendaMutation.isPending,
    createManager: createManagerMutation.mutateAsync,
    isCreatingManager: createManagerMutation.isPending,
  };
};
