import React, { useState, useMemo } from 'react';
import { Button } from '../atoms/Button';
import { X, Trash2, AlertCircle, UserPlus, ClipboardList } from 'lucide-react';
import type { Articulo } from '../../hooks/useArticulos';
import type { Cliente } from '../../hooks/useVentas';

interface CreateVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    total: number;
    estado: 'PAGADA' | 'FIADA';
    detalles: { articuloId: string; talla: string; cantidad: number; precioUnitario: number }[];
    clienteId?: string;
    tipoCobro?: string;
    diaCobro?: string;
  }) => Promise<void>;
  isLoading: boolean;
  articulos: Articulo[];
  clientes: Cliente[];
  onCreateCliente: (data: { nombre: string; telefono: string }) => Promise<any>;
  isCreatingCliente: boolean;
}

export const CreateVentaModal: React.FC<CreateVentaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  articulos,
  clientes,
  onCreateCliente,
  isCreatingCliente,
}) => {
  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('COP', '$');
  };

  // Sales lines state
  const [detalles, setDetalles] = useState<{ articuloId: string; talla: string; cantidad: string; precioUnitario: number | string }[]>([
    { articuloId: '', talla: '', cantidad: '1', precioUnitario: '' },
  ]);

  const [estado, setEstado] = useState<'PAGADA' | 'FIADA'>('PAGADA');
  const [clienteId, setClienteId] = useState('');
  const [tipoCobro, setTipoCobro] = useState('DIARIO');
  const [diaCobro, setDiaCobro] = useState('LUNES');
  
  // New Client quick form state
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientNombre, setNewClientNombre] = useState('');
  const [newClientTelefono, setNewClientTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddLine = () => {
    setDetalles([...detalles, { articuloId: '', talla: '', cantidad: '1', precioUnitario: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    if (detalles.length === 1) return;
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleLineChange = (
    index: number,
    field: 'articuloId' | 'talla' | 'cantidad' | 'precioUnitario',
    value: string
  ) => {
    const newDetalles = [...detalles];
    
    if (field === 'articuloId') {
      const selectedArt = articulos.find((a) => a.id === value);
      newDetalles[index] = {
        ...newDetalles[index],
        articuloId: value,
        talla: '', // reset talla
        precioUnitario: selectedArt ? selectedArt.precio : '',
      };
    } else if (field === 'talla') {
      newDetalles[index] = { ...newDetalles[index], talla: value };
    } else if (field === 'cantidad') {
      newDetalles[index] = { ...newDetalles[index], cantidad: value };
    } else if (field === 'precioUnitario') {
      newDetalles[index] = { ...newDetalles[index], precioUnitario: value };
    }

    setDetalles(newDetalles);
  };

  // Calculate dynamic sale total
  const calculatedTotal = useMemo(() => {
    return detalles.reduce((sum, d) => {
      const qty = parseInt(d.cantidad, 10) || 0;
      const price = typeof d.precioUnitario === 'string' ? parseFloat(d.precioUnitario) || 0 : d.precioUnitario;
      return sum + qty * price;
    }, 0);
  }, [detalles]);

  const handleCreateClient = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    if (!newClientNombre.trim() || !newClientTelefono.trim()) {
      setError('Por favor completa el nombre y teléfono del cliente.');
      return;
    }
    try {
      const created = await onCreateCliente({
        nombre: newClientNombre.trim(),
        telefono: newClientTelefono.trim(),
      });
      setClienteId(created.id);
      setNewClientNombre('');
      setNewClientTelefono('');
      setShowNewClientForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar cliente.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (detalles.some((d) => !d.articuloId || !d.talla || parseInt(d.cantidad, 10) <= 0)) {
      setError('Completa todas las líneas de productos con talla y cantidad válidas.');
      return;
    }

    if (estado === 'FIADA' && !clienteId) {
      setError('Las ventas fiadas requieren asociar un cliente.');
      return;
    }

    try {
      const formattedLines = detalles.map((d) => ({
        articuloId: d.articuloId,
        talla: d.talla,
        cantidad: parseInt(d.cantidad, 10),
        precioUnitario: typeof d.precioUnitario === 'string' ? parseFloat(d.precioUnitario) || 0 : d.precioUnitario,
      }));

      await onSubmit({
        total: calculatedTotal,
        estado,
        detalles: formattedLines,
        clienteId: estado === 'FIADA' ? clienteId : undefined,
        tipoCobro: estado === 'FIADA' ? tipoCobro : undefined,
        diaCobro: (estado === 'FIADA' && tipoCobro === 'SEMANAL') ? diaCobro : undefined,
      });

      // Clear checkout state
      setDetalles([{ articuloId: '', talla: '', cantidad: '1', precioUnitario: '' }]);
      setEstado('PAGADA');
      setClienteId('');
      setTipoCobro('DIARIO');
      setDiaCobro('LUNES');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar la venta. Verifica el stock.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-neutral-border flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-border flex justify-between items-center shrink-0">
          <h3 className="text-xl font-bold text-neutral-textPrimary italic tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            Registrar Nueva Venta
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-textSecondary hover:text-neutral-textPrimary rounded-lg p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[75vh]">
          {error && (
            <div className="bg-red-50 border border-semantic-danger/20 text-semantic-danger p-3 rounded-lg flex items-start gap-2 text-sm shrink-0">
              <AlertCircle className="h-5 w-5 text-semantic-danger shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Items Table */}
          <div className="space-y-3 shrink-0">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700 tracking-wide uppercase">Detalle de Artículos</h4>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                disabled={isLoading}
              >
                + Agregar artículo
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((line, index) => {
                const selectedArt = articulos.find((a) => a.id === line.articuloId);
                const availableTallas = selectedArt ? selectedArt.tallas : [];

                return (
                  <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/50 p-3 sm:p-0 sm:bg-transparent rounded-xl border sm:border-0 border-neutral-border/40">
                    
                    {/* Articulo selector */}
                    <div className="flex-1 min-w-[200px]">
                      <select
                        value={line.articuloId}
                        onChange={(e) => handleLineChange(index, 'articuloId', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-neutral-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                        required
                        disabled={isLoading}
                      >
                        <option value="">Selecciona un artículo...</option>
                        {articulos.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nombre} ({formatCurrency(a.precio)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Talla selector */}
                    <div className="w-full sm:w-[130px]">
                      <select
                        value={line.talla}
                        onChange={(e) => handleLineChange(index, 'talla', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-neutral-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                        required
                        disabled={!line.articuloId || isLoading}
                      >
                        <option value="">Talla...</option>
                        {availableTallas.map((t) => (
                          <option key={t.id} value={t.talla} disabled={t.cantidad <= 0}>
                            T{t.talla} ({t.cantidad} disp)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cantidad input */}
                    <div className="w-full sm:w-[80px]">
                      <input
                        type="number"
                        placeholder="Cant."
                        value={line.cantidad}
                        onChange={(e) => handleLineChange(index, 'cantidad', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-neutral-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                        required
                        min="1"
                        disabled={!line.talla || isLoading}
                        title="Cantidad"
                      />
                    </div>

                    {/* Precio Unitario input */}
                    <div className="w-full sm:w-[120px] relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                      <input
                        type="number"
                        placeholder="Precio"
                        value={line.precioUnitario}
                        onChange={(e) => handleLineChange(index, 'precioUnitario', e.target.value)}
                        className="w-full pl-6 pr-2 py-2.5 bg-white border border-neutral-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                        required
                        min="0"
                        step="any"
                        disabled={!line.articuloId || isLoading}
                        title="Precio Unitario"
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      disabled={detalles.length === 1 || isLoading}
                      className="p-2.5 text-slate-400 hover:text-semantic-danger rounded-lg transition-colors disabled:opacity-30 self-end sm:self-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment total Cream Box */}
          <div className="bg-[#FCFAF2] border border-amber-200/60 p-4 rounded-xl flex justify-between items-center shrink-0">
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Total de la Venta</p>
              <p className="text-xl font-black text-amber-900 mt-0.5">
                {formatCurrency(calculatedTotal)}
              </p>
            </div>
          </div>

          {/* Estado de pago toggles */}
          <div className="space-y-2 shrink-0">
            <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
              Forma de Pago
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEstado('PAGADA')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all
                  ${estado === 'PAGADA' 
                    ? 'border-green-600 bg-green-50 text-green-700 shadow-sm' 
                    : 'bg-white border-neutral-border text-neutral-textSecondary hover:bg-slate-50'
                  }`}
                disabled={isLoading}
              >
                <span>🟢</span>
                Contado
              </button>
              <button
                type="button"
                onClick={() => setEstado('FIADA')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all
                  ${estado === 'FIADA' 
                    ? 'border-primary bg-primary-light/40 text-primary shadow-sm'
                    : 'bg-white border-neutral-border text-neutral-textSecondary hover:bg-slate-50'
                  }`}
                disabled={isLoading}
              >
                <ClipboardList className="h-4 w-4 shrink-0 text-slate-500" />
                Fiado
              </button>
            </div>
          </div>

          {/* Cliente & Scheduling Selectors for Fiados */}
          {estado === 'FIADA' && (
            <div className="bg-slate-50 border border-neutral-border/40 p-4 rounded-xl space-y-4 shrink-0 animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <label htmlFor="clienteId" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                  Asociar Cliente
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {showNewClientForm ? 'Cancelar' : 'Nuevo Cliente'}
                </button>
              </div>

              {showNewClientForm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <input
                    placeholder="Nombre completo"
                    value={newClientNombre}
                    onChange={(e) => setNewClientNombre(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-neutral-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-neutral-textPrimary"
                    disabled={isCreatingCliente}
                  />
                  <div className="flex gap-2">
                    <input
                      placeholder="Teléfono"
                      value={newClientTelefono}
                      onChange={(e) => setNewClientTelefono(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-neutral-border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-neutral-textPrimary"
                      disabled={isCreatingCliente}
                    />
                    <Button
                      type="button"
                      onClick={handleCreateClient}
                      isLoading={isCreatingCliente}
                      className="!px-4 !py-2 shrink-0 h-fit"
                      variant="primary"
                    >
                      OK
                    </Button>
                  </div>
                </div>
              ) : (
                <select
                  id="clienteId"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-neutral-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                  required
                >
                  <option value="">Selecciona el cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} (Tel: {c.telefono})
                    </option>
                  ))}
                </select>
              )}

              {/* Opciones de Cobro / Billing Schedules */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="tipoCobro" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    Frecuencia de Cobro
                  </label>
                  <select
                    id="tipoCobro"
                    value={tipoCobro}
                    onChange={(e) => setTipoCobro(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-neutral-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                    disabled={isLoading}
                  >
                    <option value="DIARIO">Diario</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="QUINCENAL">Quincenal</option>
                    <option value="MENSUAL">Mensual</option>
                  </select>
                </div>

                {tipoCobro === 'SEMANAL' && (
                  <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                    <label htmlFor="diaCobro" className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                      Día de cobro
                    </label>
                    <select
                      id="diaCobro"
                      value={diaCobro}
                      onChange={(e) => setDiaCobro(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-neutral-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                      disabled={isLoading}
                    >
                      <option value="LUNES">Lunes</option>
                      <option value="MARTES">Martes</option>
                      <option value="MIERCOLES">Miércoles</option>
                      <option value="JUEVES">Jueves</option>
                      <option value="VIERNES">Viernes</option>
                      <option value="SABADO">Sábado</option>
                      <option value="DOMINGO">Domingo</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checkout submission */}
          <div className="flex gap-3 justify-end pt-4 border-t border-neutral-border shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="!px-6 !py-2.5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              variant="primary"
              className="!px-6 !py-2.5"
            >
              Registrar venta
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
