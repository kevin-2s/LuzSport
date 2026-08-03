import { useState, useMemo, useEffect } from 'react';
import { useArticulos } from '../../hooks/useArticulos';
import { DataTable } from '../molecules/DataTable';
import { CreateArticuloModal } from './CreateArticuloModal';
import { Button } from '../atoms/Button';
import { 
  Package, 
  Plus, 
  AlertTriangle
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Articulo } from '../../hooks/useArticulos';

interface InventarioViewProps {
  initialOpenAddModal?: boolean;
  onAddModalClosed?: () => void;
}

export const InventarioView: React.FC<InventarioViewProps> = ({ initialOpenAddModal, onAddModalClosed }) => {
  const { articulos, isLoading, createArticulo, isCreating } = useArticulos();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [tallaFilter, setTallaFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');

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

  // 1. Calculate overall stats
  const totalArticulos = articulos.length;
  const totalUnidades = useMemo(() => {
    return articulos.reduce(
      (sum, art) => sum + art.tallas.reduce((tSum, t) => tSum + t.cantidad, 0),
      0
    );
  }, [articulos]);

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('COP', '$');
  };

  // COLOR QUE TIENE EL NIVEL DE STOCK
  const getTallaBadgeClass = (cantidad: number, stockMinimo: number) => {
    if (cantidad === 0) {
      return 'bg-red-50 border-red-200 text-semantic-danger font-bold';
    }
    if (cantidad <= stockMinimo) {
      return 'bg-orange-50 border-orange-200 text-primary font-bold';
    }
    return 'bg-green-50 border-green-200 text-semantic-success font-semibold';
  };

  // 2. Filtered data list for rendering (both table and cards)
  const filteredArticulos = useMemo(() => {
    return articulos.filter((art) => {
      // Category filter
      if (selectedCategory !== 'Todos' && art.categoria !== selectedCategory) {
        return false;
      }
      // Talla filter
      if (tallaFilter.trim() && !art.tallas.some((t) => t.talla.toLowerCase().includes(tallaFilter.toLowerCase().trim()))) {
        return false;
      }
      // Color filter
      if (colorFilter.trim() && !art.color.toLowerCase().includes(colorFilter.toLowerCase().trim())) {
        return false;
      }
      return true;
    });
  }, [articulos, selectedCategory, tallaFilter, colorFilter]);

  // 3. Define columns for Desktop TanStack Table
  const columns = useMemo<ColumnDef<Articulo>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Artículo',
        cell: ({ row }) => (
          <div className="font-semibold text-neutral-textPrimary flex items-center gap-2">
            <Package className="h-4 w-4 text-primary shrink-0" />
            {row.original.nombre}
          </div>
        )
      },
      {
        accessorKey: 'categoria',
        header: 'Categoría',
        cell: ({ row }) => (
          <span className="text-xs bg-slate-100 text-neutral-textSecondary font-semibold px-2 py-0.5 rounded">
            {row.original.categoria}
          </span>
        )
      },
      {
        accessorKey: 'color',
        header: 'Color',
        cell: ({ row }) => (
          <span className="text-neutral-textSecondary">{row.original.color}</span>
        )
      },
      {
        accessorKey: 'precio',
        header: 'Precio Venta',
        cell: ({ row }) => (
          <span className="font-bold text-neutral-textPrimary">
            {formatCurrency(row.original.precio)}
          </span>
        )
      },
      {
        id: 'stockTotal',
        header: 'Stock Total',
        accessorFn: (row) => row.tallas.reduce((sum, t) => sum + t.cantidad, 0),
        cell: ({ getValue }) => (
          <span className="font-semibold">{getValue() as number} uds</span>
        )
      },
      {
        id: 'tallas',
        header: 'Tallas Disponibles',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tallas.map((t) => (
              <span 
                key={t.id} 
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-all ${getTallaBadgeClass(t.cantidad, t.stockMinimo)}`}
              >
                {t.talla} • {t.cantidad}
              </span>
            ))}
          </div>
        )
      },
      {
        id: 'alertas',
        header: 'Alertas',
        accessorFn: (row) => row.tallas.filter((t) => t.cantidad <= t.stockMinimo).length,
        cell: ({ getValue }) => {
          const alerts = getValue() as number;
          if (alerts === 0) return <span className="text-semantic-success text-xs font-bold">✓ Al día</span>;
          return (
            <span className="bg-orange-50 text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max">
              <AlertTriangle className="h-3 w-3" />
              {alerts} {alerts === 1 ? 'alerta' : 'alertas'}
            </span>
          );
        }
      }
    ],
    []
  );

  const handleCreate = async (data: {
    nombre: string;
    categoria: string;
    color: string;
    precio: number;
    tallas: { talla: string; cantidad: number; stockMinimo: number }[];
  }) => {
    await createArticulo(data);
  };

  return (
    <div className="space-y-6">
      
      {/* 4. Module Header Section (Desktop & Mobile Unified Header) */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-textPrimary tracking-tight">
            Inventario
          </h1>
          <p className="text-xs md:text-sm text-neutral-textSecondary font-medium">
            {totalArticulos} artículos • {totalUnidades} uds en total
          </p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1 px-5 py-2"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </Button>
      </div>

      {/* 5. Mobile Search and Category Controls */}
      <div className="flex md:hidden flex-col gap-4">
        {/* Category horizontal scroll bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-6 px-6">
          {['Todos', 'Zapatos', 'Ropa', 'Accesorios'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all shrink-0
                ${selectedCategory === cat 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-white border-neutral-border text-neutral-textPrimary hover:bg-slate-50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Talla..."
            value={tallaFilter}
            onChange={(e) => setTallaFilter(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-textPrimary"
          />
          <input
            placeholder="Color..."
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-textPrimary"
          />
        </div>
      </div>

      {/* 6. Desktop Mode: Header filters and Data Grid Table */}
      <div className="hidden md:block">
        {/* Tab selector for categories on desktop */}
        <div className="flex gap-2 border-b border-neutral-border pb-3 mb-4">
          {['Todos', 'Zapatos', 'Ropa', 'Accesorios'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all -mb-[14px]
                ${selectedCategory === cat 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-neutral-textSecondary hover:text-neutral-textPrimary'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filter input row on desktop */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <input
              placeholder="Filtrar por talla..."
              value={tallaFilter}
              onChange={(e) => setTallaFilter(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-textPrimary"
            />
          </div>
          <div className="relative">
            <input
              placeholder="Filtrar por color..."
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-white border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-neutral-textPrimary"
            />
          </div>
        </div>

        {/* DataTable component */}
        <DataTable
          columns={columns}
          data={filteredArticulos}
          isLoading={isLoading}
          searchPlaceholder="Buscar artículo..."
          urlSyncPrefix="inventario"
        />
      </div>

      {/* 7. Mobile Mode: Cards Grid Layout (Matching Screenshot exactly) */}
      <div className="block md:hidden space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-neutral-textSecondary text-sm">
            <span className="loading loading-infinity loading-lg text-primary mx-auto mb-2 block"></span>
            Cargando artículos...
          </div>
        ) : filteredArticulos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-border p-8 text-center text-neutral-textSecondary text-sm">
            No se encontraron artículos en esta categoría.
          </div>
        ) : (
          filteredArticulos.map((art) => {
            const alertsCount = art.tallas.filter((t) => t.cantidad <= t.stockMinimo).length;
            const stockTotal = art.tallas.reduce((sum, t) => sum + t.cantidad, 0);

            return (
              <div 
                key={art.id} 
                className="bg-white rounded-2xl border border-neutral-border p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {/* Title & Alerts Row */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-base text-neutral-textPrimary">{art.nombre}</h3>
                    <p className="text-xs text-neutral-textSecondary">
                      {art.categoria} • {art.color}
                    </p>
                  </div>
                  {alertsCount > 0 && (
                    <span className="bg-orange-50 border border-orange-200 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      {alertsCount} {alertsCount === 1 ? 'alerta' : 'alertas'}
                    </span>
                  )}
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-neutral-border/40">
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Stock Total</p>
                    <p className="text-sm font-semibold text-neutral-textPrimary mt-0.5">
                      <span className="font-bold text-base">{stockTotal}</span> uds
                    </p>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl border border-neutral-border/40">
                    <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Precio Venta</p>
                    <p className="text-base font-bold text-neutral-textPrimary mt-0.5">
                      {formatCurrency(art.precio)}
                    </p>
                  </div>
                </div>

                {/* Tallas Disponibles Row */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-700 tracking-wide uppercase">Tallas Disponibles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {art.tallas.map((t) => (
                      <span 
                        key={t.id} 
                        className={`text-xs px-2 py-1 rounded-md border transition-all ${getTallaBadgeClass(t.cantidad, t.stockMinimo)}`}
                      >
                        T{t.talla} • {t.cantidad}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Action */}
                <button className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 border border-neutral-border hover:bg-slate-100 rounded-xl text-xs font-bold text-neutral-textSecondary hover:text-neutral-textPrimary transition-all">
                  Ver detalle completo
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 8. Create Article Modal */}
      <CreateArticuloModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

    </div>
  );
};
