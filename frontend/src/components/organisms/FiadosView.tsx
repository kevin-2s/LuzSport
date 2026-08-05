import React, { useState, useMemo } from 'react';
import { useFiados } from '../../hooks/useFiados';
import { Button } from '../atoms/Button';
import { Calendar, User, Search, CreditCard, X, AlertCircle } from 'lucide-react';

export const FiadosView: React.FC = () => {
  const { fiados, isFiadosLoading, registrarAbono, isRegistrandoAbono } = useFiados();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'pendientes' | 'todos'>('pendientes');
  
  // Abono modal states
  const [selectedFiadoId, setSelectedFiadoId] = useState<string | null>(null);
  const [abonoMonto, setAbonoMonto] = useState('');
  const [abonoMetodo, setAbonoMetodo] = useState('EFECTIVO');
  const [error, setError] = useState<string | null>(null);

  const selectedFiado = fiados.find((f) => f.id === selectedFiadoId);

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('COP', '$');
  };

  // Filter raw fiados list
  const filteredFiados = fiados.filter((f) => {
    // Filter type (pending vs all)
    if (filterType === 'pendientes' && f.saldoPendiente === 0) return false;

    // Search term
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      const matchClient = f.cliente.nombre.toLowerCase().includes(query);
      const matchPhone = f.cliente.telefono.includes(query);
      const matchSale = f.ventaId.slice(-6).toLowerCase().includes(query);
      if (!matchClient && !matchPhone && !matchSale) return false;
    }

    return true;
  });

  // Group filtered fiados by client
  const groupedFiados = useMemo(() => {
    const groups: Record<string, {
      clienteId: string;
      clienteNombre: string;
      clienteTelefono: string;
      fiados: typeof fiados;
      totalSaldo: number;
      tieneVencidos: boolean;
      tienePendientes: boolean;
    }> = {};

    filteredFiados.forEach((f) => {
      const cId = f.clienteId;
      if (!groups[cId]) {
        groups[cId] = {
          clienteId: cId,
          clienteNombre: f.cliente.nombre,
          clienteTelefono: f.cliente.telefono,
          fiados: [],
          totalSaldo: 0,
          tieneVencidos: false,
          tienePendientes: false,
        };
      }
      groups[cId].fiados.push(f);
      groups[cId].totalSaldo += f.saldoPendiente;
      if (f.saldoPendiente > 0) {
        groups[cId].tienePendientes = true;
        if (new Date(f.fechaVencimiento) < new Date()) {
          groups[cId].tieneVencidos = true;
        }
      }
    });

    // Sort groups: overdue clients first, then sorted by outstanding debt total
    return Object.values(groups).sort((a, b) => {
      if (a.tieneVencidos && !b.tieneVencidos) return -1;
      if (!a.tieneVencidos && b.tieneVencidos) return 1;
      return b.totalSaldo - a.totalSaldo;
    });
  }, [filteredFiados]);

  const handleOpenAbonoModal = (fiadoId: string) => {
    setSelectedFiadoId(fiadoId);
    setAbonoMonto('');
    setAbonoMetodo('EFECTIVO');
    setError(null);
  };

  const handleCloseAbonoModal = () => {
    setSelectedFiadoId(null);
    setAbonoMonto('');
    setAbonoMetodo('EFECTIVO');
    setError(null);
  };

  const handleRegisterAbonoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiadoId || !selectedFiado) return;
    setError(null);

    const monto = parseFloat(abonoMonto);
    if (isNaN(monto) || monto <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    if (monto > selectedFiado.saldoPendiente) {
      setError(`El monto ingresado supera el saldo pendiente de ${formatCurrency(selectedFiado.saldoPendiente)}.`);
      return;
    }

    try {
      await registrarAbono({ fiadoId: selectedFiadoId, monto, metodo: abonoMetodo });
      handleCloseAbonoModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el abono.');
    }
  };

  // Overall metrics helper
  const totalCarteraMonto = useMemo(() => {
    return fiados.reduce((sum, f) => sum + f.saldoPendiente, 0);
  }, [fiados]);

  const activeFiadosCount = useMemo(() => {
    return fiados.filter((f) => f.saldoPendiente > 0).length;
  }, [fiados]);

  const overdueFiadosCount = useMemo(() => {
    const today = new Date();
    return fiados.filter((f) => f.saldoPendiente > 0 && new Date(f.fechaVencimiento) < today).length;
  }, [fiados]);

  const formatFreq = (freq: string, day: string | null) => {
    if (freq === 'DIARIO') return 'Cobro Diario';
    if (freq === 'SEMANAL') return `Semanal (${day ? day.toLowerCase() : ''})`;
    if (freq === 'QUINCENAL') return 'Cobro Quincenal';
    if (freq === 'MENSUAL') return 'Cobro Mensual';
    return freq;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-textPrimary tracking-tight">
            Fiados
          </h1>
          <p className="text-xs md:text-sm text-neutral-textSecondary font-medium">
            Lleva el control de saldos pendientes y abonos de tus clientes.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      {!isFiadosLoading && fiados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {/* Total Cartera */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Cartera Pendiente</p>
              <p className="text-2xl font-black text-neutral-textPrimary">
                {formatCurrency(totalCarteraMonto)}
              </p>
              <p className="text-xs text-neutral-textSecondary font-semibold">
                Deuda total de {activeFiadosCount} cuentas activas
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>

          {/* Fiados Vencidos */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-border shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fiados Vencidos</p>
              <p className={`text-2xl font-black ${overdueFiadosCount > 0 ? 'text-semantic-danger animate-pulse' : 'text-neutral-textPrimary'}`}>
                {overdueFiadosCount}
              </p>
              <p className="text-xs text-neutral-textSecondary font-semibold">
                Cuentas fuera de fecha de pago
              </p>
            </div>
            <div className={`p-3 rounded-xl ${overdueFiadosCount > 0 ? 'bg-red-50 text-semantic-danger' : 'bg-slate-50 text-slate-500'}`}>
              <AlertCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        
        {/* State tabs */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilterType('pendientes')}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all shrink-0
              ${filterType === 'pendientes' 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white border-neutral-border text-neutral-textPrimary hover:bg-slate-50'
              }`}
          >
            Pendientes
          </button>
          <button
            type="button"
            onClick={() => setFilterType('todos')}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all shrink-0
              ${filterType === 'todos' 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white border-neutral-border text-neutral-textPrimary hover:bg-slate-50'
              }`}
          >
            Todos
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:max-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-textSecondary pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por cliente o venta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-textPrimary"
          />
        </div>

      </div>

      {/* Grouped Client Fiados Card List */}
      {isFiadosLoading ? (
        <div className="py-20 text-center text-neutral-textSecondary text-sm">
          <span className="loading loading-infinity loading-lg text-primary mx-auto mb-2 block"></span>
          Cargando cuentas de fiados...
        </div>
      ) : groupedFiados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-border p-12 text-center text-neutral-textSecondary text-sm max-w-lg mx-auto shadow-sm">
          <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          No se encontraron cuentas de fiados {filterType === 'pendientes' ? 'pendientes' : ''}.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groupedFiados.map((group) => {
            const isCompleted = group.totalSaldo === 0;
            const statusLabel = isCompleted ? 'Pagado' : group.tieneVencidos ? 'Vencido' : 'Pendiente';

            return (
              <div 
                key={group.clienteId} 
                className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between
                  ${isCompleted ? 'border-neutral-border opacity-75' : 'border-neutral-border/80'}`}
              >
                {/* Visual indicator ribbon */}
                <div className={`absolute top-0 left-0 right-0 h-1 
                  ${isCompleted ? 'bg-green-400' : group.tieneVencidos ? 'bg-red-500' : 'bg-orange-500'}`} 
                />

                <div className="space-y-4">
                  {/* Top Client info header */}
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-base text-neutral-textPrimary flex items-center gap-1.5">
                        <User className="h-4.5 w-4.5 text-primary shrink-0" />
                        {group.clienteNombre}
                      </h4>
                      <p className="text-[11px] text-neutral-textSecondary font-semibold">Telf: {group.clienteTelefono}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border
                        ${isCompleted 
                          ? 'bg-green-50 border-green-200 text-semantic-success' 
                          : group.tieneVencidos 
                            ? 'bg-red-50 border-red-200 text-semantic-danger'
                            : 'bg-orange-50 border-orange-200 text-primary'
                        }`}
                      >
                        {statusLabel}
                      </span>
                      <p className="text-xs font-black text-neutral-textPrimary">
                        Cartera Total: <span className={isCompleted ? 'text-green-600' : group.tieneVencidos ? 'text-semantic-danger font-black' : 'text-primary'}>{formatCurrency(group.totalSaldo)}</span>
                      </p>
                    </div>
                  </div>

                  {/* List of individual fiados under this client */}
                  <div className="space-y-4">
                    {group.fiados.map((fiado) => {
                      const fCompleted = fiado.saldoPendiente === 0;
                      const fDue = new Date(fiado.fechaVencimiento);
                      const fOverdue = !fCompleted && fDue < new Date();
                      const saleCode = fiado.ventaId.slice(-6).toUpperCase();

                      return (
                        <div 
                          key={fiado.id} 
                          className={`p-3.5 rounded-xl border space-y-3 transition-all
                            ${fCompleted 
                              ? 'bg-green-50/20 border-green-100/50' 
                              : fOverdue 
                                ? 'bg-red-50/20 border-red-100/60' 
                                : 'bg-slate-50/40 border-neutral-border/40'
                            }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-neutral-textPrimary">Venta #{saleCode}</span>
                            <span className="text-neutral-textSecondary font-medium">
                              {new Date(fiado.venta.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>

                          {/* Product list details */}
                          <div className="text-xs font-bold text-neutral-textPrimary">
                            {fiado.venta.detalles.map((d) => `${d.articuloNombre} T${d.talla} (${d.cantidad} ud)`).join(', ')}
                          </div>

                          {/* Frecuencia and next billing date */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-neutral-textSecondary pt-1 border-t border-slate-100/60">
                            <div>
                              <p className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">Frecuencia</p>
                              <p className="text-neutral-textPrimary mt-0.5">{formatFreq(fiado.tipoCobro, fiado.diaCobro)}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium uppercase tracking-wider text-[8px]">{fOverdue ? 'Vencido el' : 'Próximo cobro'}</p>
                              <p className={`mt-0.5 ${fOverdue ? 'text-semantic-danger font-black animate-pulse' : 'text-neutral-textPrimary'}`}>
                                {fDue.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          {/* Debt status and abono action */}
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-neutral-border/20 mt-1 shadow-sm">
                            <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Saldo Venta</p>
                              <p className={`text-sm font-black mt-0.5 
                                ${fCompleted ? 'text-green-600' : fOverdue ? 'text-semantic-danger' : 'text-amber-600'}`}
                              >
                                {formatCurrency(fiado.saldoPendiente)}
                              </p>
                            </div>
                            {!fCompleted && (
                              <Button
                                onClick={() => handleOpenAbonoModal(fiado.id)}
                                className="flex items-center gap-1 !px-2.5 !py-1 !text-[10px] !tracking-[0.5px] font-bold"
                              >
                                <CreditCard className="h-3 w-3" />
                                Abonar
                              </Button>
                            )}
                          </div>

                          {/* Nested Abonos history */}
                          {fiado.abonos.length > 0 && (
                            <div className="space-y-1 pt-1.5 border-t border-dashed border-slate-200">
                              <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Abonos Realizados ({fiado.abonos.length})</p>
                              <div className="max-h-20 overflow-y-auto space-y-1 divide-y divide-slate-50/50 pr-1.5 scrollbar-thin">
                                {fiado.abonos.map((abono) => (
                                  <div key={abono.id} className="flex justify-between text-[10px] font-bold text-neutral-textSecondary py-0.5">
                                    <span className="flex items-center gap-1 text-slate-400 font-medium">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(abono.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                    </span>
                                    <span className="text-neutral-textPrimary font-bold flex gap-1">
                                      <span>+{formatCurrency(abono.monto)}</span>
                                      <span className="text-[9px] text-slate-400 font-semibold uppercase">({abono.metodo})</span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Abono Modal */}
      {selectedFiadoId && selectedFiado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-neutral-border p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-neutral-textPrimary tracking-tight">Registrar Abono</h3>
              <button 
                onClick={handleCloseAbonoModal} 
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                disabled={isRegistrandoAbono}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterAbonoSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-semantic-danger/20 text-semantic-danger p-3 rounded-xl flex items-start gap-2 text-xs shrink-0">
                  <AlertCircle className="h-4.5 w-4.5 text-semantic-danger shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-2xl border border-neutral-border/30 space-y-2">
                <div className="flex justify-between text-xs text-neutral-textSecondary font-semibold">
                  <span>Cliente:</span>
                  <span className="text-neutral-textPrimary">{selectedFiado.cliente.nombre}</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-textSecondary font-semibold">
                  <span>Código Venta:</span>
                  <span className="text-neutral-textPrimary font-mono">#{selectedFiado.ventaId.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 border-t border-slate-100 font-bold text-amber-800">
                  <span>Saldo Pendiente:</span>
                  <span>{formatCurrency(selectedFiado.saldoPendiente)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="montoAbono" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Monto del Abono
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-textSecondary font-bold text-sm">$</span>
                  <input
                    id="montoAbono"
                    type="number"
                    placeholder="Ej: 50000"
                    value={abonoMonto}
                    onChange={(e) => setAbonoMonto(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-neutral-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold text-neutral-textPrimary"
                    required
                    min="100"
                    max={selectedFiado.saldoPendiente}
                    disabled={isRegistrandoAbono}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="metodoAbono" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Método de Pago
                </label>
                <input
                  id="metodoAbono"
                  type="text"
                  placeholder="Ej: Nequi, Efectivo, Transferencia"
                  value={abonoMetodo}
                  onChange={(e) => setAbonoMetodo(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-neutral-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-neutral-textPrimary font-semibold"
                  required
                  disabled={isRegistrandoAbono}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseAbonoModal}
                  disabled={isRegistrandoAbono}
                  className="!px-4 !py-2 !text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  isLoading={isRegistrandoAbono}
                  className="!px-5 !py-2 !text-xs font-bold"
                >
                  Confirmar Abono
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
