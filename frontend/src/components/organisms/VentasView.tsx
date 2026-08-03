import { useState, useMemo, useEffect } from 'react';
import { useVentas } from '../../hooks/useVentas';
import { useArticulos } from '../../hooks/useArticulos';
import { DataTable } from '../molecules/DataTable';
import { CreateVentaModal } from './CreateVentaModal';
import { Button } from '../atoms/Button';
import { Plus, Calendar, User } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Venta } from '../../hooks/useVentas';

interface VentasViewProps {
  initialOpenAddModal?: boolean;
  onAddModalClosed?: () => void;
}

export const VentasView: React.FC<VentasViewProps> = ({ initialOpenAddModal, onAddModalClosed }) => {
  const { 
    ventas, 
    isVentasLoading, 
    clientes, 
    createVenta, 
    isCreatingVenta, 
    createCliente, 
    isCreatingCliente 
  } = useVentas();

  const { articulos } = useArticulos();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEstado, setSelectedEstado] = useState('Todas');

  useEffect(() => {
    if (initialOpenAddModal) {
      setIsAddModalOpen(true);
    }
  }, [initialOpenAddModal]);

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    if (onAddModalClosed) {
      onAddModalClosed();
    }
  };
  const [dateFilter, setDateFilter] = useState('');

  // Calculate totals
  const totalRegistros = ventas.length;
  const totalMonto = useMemo(() => {
    return ventas.reduce((sum, v) => sum + v.total, 0);
  }, [ventas]);

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('COP', '$');
  };

  // Filter sales
  const filteredVentas = useMemo(() => {
    return ventas.filter((v) => {
      // Estado filter
      if (selectedEstado !== 'Todas') {
        if (selectedEstado === 'Pagada' && v.estado !== 'PAGADA') return false;
        if (selectedEstado === 'Fiada' && v.estado !== 'FIADA') return false;
      }
      // Date filter
      if (dateFilter) {
        const saleDateString = new Date(v.fecha).toISOString().slice(0, 10);
        if (saleDateString !== dateFilter) return false;
      }
      return true;
    });
  }, [ventas, selectedEstado, dateFilter]);

  // Define columns for desktop table
  const columns = useMemo<ColumnDef<Venta>[]>(
    () => [
      {
        id: 'fecha',
        header: 'Fecha',
        accessorFn: (row) => new Date(row.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1.5 text-neutral-textSecondary">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            {getValue() as string}
          </span>
        )
      },
      {
        id: 'articulos',
        header: 'Artículos',
        cell: ({ row }) => (
          <div className="space-y-1">
            {row.original.detalles.map((d) => (
              <div key={d.id} className="text-xs font-semibold text-neutral-textPrimary">
                {d.articuloNombre} T{d.talla} ({d.cantidad})
              </div>
            ))}
          </div>
        )
      },
      {
        id: 'cliente',
        header: 'Cliente',
        accessorFn: (row) => row.fiado?.cliente?.nombre || '—',
        cell: ({ getValue }) => {
          const client = getValue() as string;
          if (client === '—') return <span className="text-slate-400">—</span>;
          return (
            <span className="flex items-center gap-1 text-sm font-semibold text-neutral-textPrimary">
              <User className="h-3.5 w-3.5 text-slate-500" />
              {client}
            </span>
          );
        }
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className="font-extrabold text-neutral-textPrimary">
            {formatCurrency(row.original.total)}
          </span>
        )
      },
      {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
          const isPagada = row.original.estado === 'PAGADA';
          return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
              ${isPagada 
                ? 'bg-green-100 text-semantic-success' 
                : 'bg-orange-100 text-primary'
              }`}
            >
              {row.original.estado.toLowerCase()}
            </span>
          );
        }
      }
    ],
    []
  );

  const handleCreateVenta = async (data: {
    total: number;
    estado: 'PAGADA' | 'FIADA';
    detalles: { articuloId: string; talla: string; cantidad: number; precioUnitario: number }[];
    clienteId?: string;
  }) => {
    await createVenta(data);
  };

  const handleCreateCliente = async (data: { nombre: string; telefono: string }) => {
    return createCliente(data);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-textPrimary tracking-tight">
            Ventas
          </h1>
          <p className="text-xs md:text-sm text-neutral-textSecondary font-medium">
            {totalRegistros} registros • {formatCurrency(totalMonto)}
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 px-5 py-2"
        >
          <Plus className="h-4 w-4" />
          Nueva
        </Button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        
        {/* Horizontal scroll tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {['Todas', 'Pagada', 'Fiada'].map((state) => (
            <button
              key={state}
              onClick={() => setSelectedEstado(state)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all shrink-0
                ${selectedEstado === state 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-white border-neutral-border text-neutral-textPrimary hover:bg-slate-50'
                }`}
            >
              {state}
            </button>
          ))}
        </div>

        {/* Date Filter Input */}
        <div className="relative w-full sm:max-w-[200px]">
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-textSecondary pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-2 text-sm bg-white border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-textPrimary"
          />
        </div>

      </div>

      {/* Desktop view */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={filteredVentas}
          isLoading={isVentasLoading}
          searchPlaceholder="Buscar venta..."
          urlSyncPrefix="ventas"
        />
      </div>

      {/* Mobile view */}
      <div className="block md:hidden space-y-4">
        {isVentasLoading ? (
          <div className="py-12 text-center text-neutral-textSecondary text-sm">
            <span className="loading loading-infinity loading-lg text-primary mx-auto mb-2 block"></span>
            Cargando transacciones...
          </div>
        ) : filteredVentas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-border p-8 text-center text-neutral-textSecondary text-sm">
            No se encontraron ventas para esta categoría o fecha.
          </div>
        ) : (
          filteredVentas.map((venta) => {
            const isPagada = venta.estado === 'PAGADA';
            const clientName = venta.fiado?.cliente?.nombre;

            return (
              <div 
                key={venta.id} 
                className="bg-white rounded-2xl border border-neutral-border p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {/* Header Row */}
                <div className="flex justify-between items-center text-xs text-neutral-textSecondary font-semibold">
                  <span>Venta #{venta.id.slice(-6).toUpperCase()}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(venta.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Items details list */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-700 tracking-wide uppercase">Artículos</p>
                  <div className="divide-y divide-slate-50 border-t border-b border-slate-50 py-1">
                    {venta.detalles.map((d) => (
                      <div key={d.id} className="py-1 flex justify-between text-xs font-semibold text-neutral-textPrimary">
                        <span>{d.articuloNombre} (Talla: {d.talla})</span>
                        <span className="text-neutral-textSecondary font-bold">x{d.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client detail if fiada */}
                {clientName && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-textPrimary bg-slate-50/50 p-2.5 rounded-lg border border-neutral-border/40">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                    <span>Fiado a: <strong className="text-neutral-textPrimary">{clientName}</strong></span>
                  </div>
                )}

                {/* Footer totals & state */}
                <div className="flex justify-between items-center pt-1.5">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Total Venta</p>
                    <p className="text-base font-black text-neutral-textPrimary">{formatCurrency(venta.total)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border
                    ${isPagada 
                      ? 'bg-green-50 border-green-200 text-semantic-success' 
                      : 'bg-orange-50 border-orange-200 text-primary'
                    }`}
                  >
                    {venta.estado.toLowerCase()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checkout Modal */}
      <CreateVentaModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreateVenta}
        isLoading={isCreatingVenta}
        articulos={articulos}
        clientes={clientes}
        onCreateCliente={handleCreateCliente}
        isCreatingCliente={isCreatingCliente}
      />

    </div>
  );
};
