import { useState, useMemo, useEffect, useRef } from 'react';
import { useVentas } from '../../hooks/useVentas';
import { useArticulos } from '../../hooks/useArticulos';
import { DataTable } from '../molecules/DataTable';
import { CreateVentaModal } from './CreateVentaModal';
import { Button } from '../atoms/Button';
import { Plus, Calendar, User, Download, X, Search } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import type { Venta } from '../../hooks/useVentas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

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
  const [searchCode, setSearchCode] = useState('');
  
  // Date Range State
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close calendar on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Export states
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

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

  // Filter sales
  const filteredVentas = useMemo(() => {
    return ventas.filter((v) => {
      // Estado filter
      if (selectedEstado !== 'Todas') {
        if (selectedEstado === 'Pagada' && v.estado !== 'PAGADA') return false;
        if (selectedEstado === 'Fiada' && v.estado !== 'FIADA') return false;
      }
      
      // Code filter
      if (searchCode.trim()) {
        const shortCode = v.id.slice(-6).toLowerCase();
        if (!shortCode.includes(searchCode.trim().toLowerCase())) {
          return false;
        }
      }
      // Date filter
      if (dateRange?.from) {
        const saleDate = new Date(v.fecha);
        saleDate.setHours(0, 0, 0, 0);

        const startDate = new Date(dateRange.from);
        startDate.setHours(0, 0, 0, 0);

        const endDate = dateRange.to ? new Date(dateRange.to) : new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        if (saleDate.getTime() < startDate.getTime() || saleDate.getTime() > endDate.getTime()) {
          return false;
        }
      }
      return true;
    });
  }, [ventas, selectedEstado, dateRange, searchCode]);

  // Calculate totals
  const totalRegistros = filteredVentas.length;
  const totalMonto = useMemo(() => {
    return filteredVentas.reduce((sum, v) => sum + v.total, 0);
  }, [filteredVentas]);

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('COP', '$');
  };

  // Excel/CSV Export handler (Filtered sales directly)
  const handleExportExcel = (dataToExport: Venta[]) => {
    const headers = ['Fecha', 'Código Venta', 'Artículos', 'Cliente', 'Total', 'Estado'];
    const rows = dataToExport.map((venta) => {
      const fecha = new Date(venta.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      const codigo = venta.id.slice(-6).toUpperCase();
      const articulosStr = venta.detalles.map((d) => `${d.articuloNombre} T${d.talla} (${d.cantidad})`).join(' | ');
      const cliente = venta.fiado?.cliente?.nombre || '—';
      const total = venta.total;
      const estado = venta.estado;
      return [fecha, codigo, articulosStr, cliente, total, estado];
    });

    const pagadasSum = dataToExport.filter((v) => v.estado === 'PAGADA').reduce((sum, v) => sum + v.total, 0);
    const fiadasSum = dataToExport.filter((v) => v.estado === 'FIADA').reduce((sum, v) => sum + v.total, 0);
    const formatCurrStr = (val: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val).replace('COP', '$');

    const summaryRows = [
      ['', '', '', '', '', ''],
      ['', '', '', 'TOTAL INGRESOS (PAGADAS):', formatCurrStr(pagadasSum), ''],
      ['', '', '', 'TOTAL CRÉDITO (FIADAS):', formatCurrStr(fiadasSum), '']
    ];

    const csvContent = 
      '\uFEFF' + 
      [headers, ...rows, ...summaryRows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Print report handler (Filtered sales directly)
  const handleExportPDF = (dataToExport: Venta[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = `Reporte de Ventas - LuzSport`;
    const dateText = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const totalSum = dataToExport.reduce((sum, v) => sum + v.total, 0);
    const totalPagado = dataToExport.filter((v) => v.estado === 'PAGADA').reduce((sum, v) => sum + v.total, 0);
    const totalFiado = dataToExport.filter((v) => v.estado === 'FIADA').reduce((sum, v) => sum + v.total, 0);

    const rowsHTML = dataToExport.map((venta) => {
      const fecha = new Date(venta.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
      const codigo = venta.id.slice(-6).toUpperCase();
      const articulosStr = venta.detalles.map((d) => `<div>${d.articuloNombre} T${d.talla} (x${d.cantidad})</div>`).join('');
      const cliente = venta.fiado?.cliente?.nombre || '—';
      const totalFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(venta.total).replace('COP', '$');
      const estadoBadge = `<span style="font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; background: ${venta.estado === 'PAGADA' ? '#D1FAE5; color: #065F46;' : '#FFEDD5; color: #9A3412;'}">${venta.estado}</span>`;

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px;">${fecha}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: bold;">${codigo}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px;">${articulosStr}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px;">${cliente}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; font-weight: bold;">${totalFormatted}</td>
          <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px;">${estadoBadge}</td>
        </tr>
      `;
    }).join('');

    const totalSumFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalSum).replace('COP', '$');
    const totalPagadoFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalPagado).replace('COP', '$');
    const totalFiadoFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(totalFiado).replace('COP', '$');

    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; margin: 40px; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 5px; color: #C2410C; }
            p { font-size: 14px; color: #64748B; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #F8FAFC; text-align: left; padding: 12px 10px; font-size: 11px; font-weight: bold; color: #64748B; border-bottom: 2px solid #E2E8F0; text-transform: uppercase; }
            .total-row { background-color: #FCFAF7; font-weight: bold; }
            @media print {
              button { display: none; }
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #C2410C; padding-bottom: 15px; margin-bottom: 20px;">
             <div>
               <h1>LuzSport - Reporte de Ventas</h1>
               <p>${dateText}</p>
             </div>
             <div style="text-align: right;">
               <div style="font-size: 18px; font-weight: bold; color: #C2410C;">Calzado & Moda</div>
               <div style="font-size: 12px; color: #64748B;">Total Reportado: ${totalSumFormatted}</div>
             </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Código</th>
                <th>Artículos</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
              <tr class="total-row">
                <td colspan="4" style="padding: 15px 10px; border-top: 2px solid #E2E8F0; text-align: right; font-size: 14px; font-weight: bold;">TOTAL INGRESOS (PAGADAS):</td>
                <td colspan="2" style="padding: 15px 10px; border-top: 2px solid #E2E8F0; font-size: 16px; font-weight: 900; color: #059669;">${totalPagadoFormatted}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4" style="padding: 10px; border-top: 1px solid #E2E8F0; text-align: right; font-size: 14px; font-weight: bold;">TOTAL CRÉDITO (FIADAS):</td>
                <td colspan="2" style="padding: 10px; border-top: 1px solid #E2E8F0; font-size: 16px; font-weight: 900; color: #D97706;">${totalFiadoFormatted}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94A3B8;">
            Este documento es una representación digital de las ventas de Calzado & Moda. Generado el ${new Date().toLocaleString()}.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
        <div className="flex gap-2 items-center relative">
          
          {/* Dropdown de Exportación */}
          <div className="relative">
            <Button 
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              variant="outline"
              className="flex items-center gap-1.5 !px-3 !py-1.5 !text-[10px] !tracking-[1px] border-neutral-border text-neutral-textSecondary hover:text-primary hover:border-primary/20 shrink-0 font-bold"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Button>
            
            {isExportDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsExportDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-white border border-neutral-border rounded-xl shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Excel section */}
                  <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Excel (CSV)</div>
                  <button
                    type="button"
                    onClick={() => {
                      const pagadas = filteredVentas.filter((v) => v.estado === 'PAGADA');
                      handleExportExcel(pagadas);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-neutral-textPrimary hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>🟢</span>
                    Solo ventas pagadas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fiadas = filteredVentas.filter((v) => v.estado === 'FIADA');
                      handleExportExcel(fiadas);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-neutral-textPrimary hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>🟠</span>
                    Solo ventas fiadas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportExcel(filteredVentas);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-neutral-textPrimary hover:bg-slate-50 transition-colors flex items-center gap-2 border-b border-slate-100 pb-2"
                  >
                    <span>📊</span>
                    Todas las Ventas (filtradas)
                  </button>

                  {/* PDF section */}
                  <div className="px-3 py-1 pt-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">PDF (Imprimir)</div>
                  <button
                    type="button"
                    onClick={() => {
                      const pagadas = filteredVentas.filter((v) => v.estado === 'PAGADA');
                      handleExportPDF(pagadas);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-neutral-textPrimary hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>🟢</span>
                    Solo ventas pagadas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fiadas = filteredVentas.filter((v) => v.estado === 'FIADA');
                      handleExportPDF(fiadas);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-neutral-textPrimary hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>🟠</span>
                    Solo ventas fiadas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleExportPDF(filteredVentas);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-neutral-textPrimary hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span>📄</span>
                    Todas las Ventas (filtradas)
                  </button>
                </div>
              </>
            )}
          </div>

          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 !px-3.5 !py-1.5 !text-[10px] !tracking-[1px] shrink-0 font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva
          </Button>
        </div>
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

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Code Search Filter */}
          <div className="relative w-full sm:w-[150px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-textSecondary" />
            <input
              type="text"
              placeholder="Buscar código"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-textPrimary shadow-sm uppercase placeholder:normal-case"
            />
          </div>

          {/* Date Range Filter */}
          <div className="relative w-full sm:w-[260px]" ref={datePickerRef}>
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-textSecondary pointer-events-none" />
            <input
              type="text"
              readOnly
              placeholder="Filtrar por fechas..."
              value={
                dateRange?.from 
                  ? `${format(dateRange.from, 'dd MMM yyyy', { locale: es })}${dateRange.to ? ` - ${format(dateRange.to, 'dd MMM yyyy', { locale: es })}` : ''}`
                  : ''
              }
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full pl-4 pr-10 py-2 text-sm bg-white border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-textPrimary cursor-pointer shadow-sm"
            />
            {dateRange?.from && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRange(undefined);
                }}
                className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {isDatePickerOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-white border border-neutral-border rounded-2xl shadow-2xl p-3 animate-in fade-in slide-in-from-top-2">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={es}
                  showOutsideDays
                  modifiersClassNames={{
                    selected: "bg-primary text-white hover:bg-primary-hover",
                    range_middle: "bg-primary/10 text-neutral-textPrimary hover:bg-primary/20",
                    range_start: "bg-primary text-white rounded-l-full",
                    range_end: "bg-primary text-white rounded-r-full",
                    today: "font-bold text-primary",
                  }}
                  className="font-sans text-sm"
                />
                <div className="flex justify-end pt-3 border-t border-slate-100 mt-2">
                  <Button onClick={() => setIsDatePickerOpen(false)} className="!px-4 !py-1.5 text-xs font-bold" variant="primary">
                    Aplicar
                  </Button>
                </div>
              </div>
            )}
          </div>
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
