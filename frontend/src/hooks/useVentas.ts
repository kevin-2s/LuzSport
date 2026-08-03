import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export interface DetalleVenta {
  id: string;
  ventaId: string;
  articuloId: string;
  articuloNombre: string;
  talla: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Venta {
  id: string;
  tiendaId: string;
  fecha: string;
  total: number;
  estado: 'PAGADA' | 'FIADA';
  detalles: DetalleVenta[];
  fiado?: {
    id: string;
    clienteId: string;
    cliente: {
      nombre: string;
    };
    saldoPendiente: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  tiendaId: string;
  createdAt: string;
  updatedAt: string;
}

export const useVentas = () => {
  const queryClient = useQueryClient();

  const queryVentas = useQuery<Venta[]>({
    queryKey: ['ventas'],
    queryFn: async () => {
      const response = await api.get('/ventas');
      return response.data;
    },
  });

  const queryClientes = useQuery<Cliente[]>({
    queryKey: ['clientes'],
    queryFn: async () => {
      const response = await api.get('/clientes');
      return response.data;
    },
  });

  const createVentaMutation = useMutation({
    mutationFn: async (data: {
      total: number;
      estado: 'PAGADA' | 'FIADA';
      detalles: { articuloId: string; talla: string; cantidad: number; precioUnitario: number }[];
      clienteId?: string;
    }) => {
      const response = await api.post('/ventas', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['articulos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });

  const createClienteMutation = useMutation({
    mutationFn: async (data: { nombre: string; telefono: string }) => {
      const response = await api.post('/clientes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });

  return {
    ventas: queryVentas.data || [],
    isVentasLoading: queryVentas.isLoading,
    clientes: queryClientes.data || [],
    isClientesLoading: queryClientes.isLoading,
    createVenta: createVentaMutation.mutateAsync,
    isCreatingVenta: createVentaMutation.isPending,
    createCliente: createClienteMutation.mutateAsync,
    isCreatingCliente: createClienteMutation.isPending,
  };
};
