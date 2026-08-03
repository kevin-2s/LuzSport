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
  const [detalles, setDetalles] = useState<{ articuloId: string; talla: string; cantidad: string; precioUnitario: number }[]>([
    { articuloId: '', talla: '', cantidad: '1', precioUnitario: 0 },
  ]);

  const [estado, setEstado] = useState<'PAGADA' | 'FIADA'>('PAGADA');
  const [clienteId, setClienteId] = useState('');
  
  // New Client quick form state
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientNombre, setNewClientNombre] = useState('');
  const [newClientTelefono, setNewClientTelefono] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddLine = () => {
    setDetalles([...detalles, { articuloId: '', talla: '', cantidad: '1', precioUnitario: 0 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (detalles.length === 1) return;
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const handleLineChange = (
    index: number,
    field: 'articuloId' | 'talla' | 'cantidad',
    value: string
  ) => {
    const newDetalles = [...detalles];
    
    if (field === 'articuloId') {
      const selectedArt = articulos.find((a) => a.id === value);
      newDetalles[index] = {
        ...newDetalles[index],
        articuloId: value,
        talla: '', // reset talla
        precioUnitario: selectedArt ? selectedArt.precio : 0,
      };
    } else if (field === 'talla') {
      newDetalles[index] = { ...newDetalles[index], talla: value };
    } else if (field === 'cantidad') {
      newDetalles[index] = { ...newDetalles[index], cantidad: value };
    }

    setDetalles(newDetalles);
  };

  // Calculate dynamic sale total
  const calculatedTotal = useMemo(() => {
    return detalles.reduce((sum, d) => {
      const qty = parseInt(d.cantidad, 10) || 0;
      return sum + qty * d.precioUnitario;
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
        precioUnitario: d.precioUnitario,
      }));

      await onSubmit({
        total: calculatedTotal,
        estado,
        detalles: formattedLines,
        clienteId: estado === 'FIADA' ? clienteId : undefined,
      });

      // Clear checkout state
      setDetalles([{ articuloId: '', talla: '', cantidad: '1', precioUnitario: 0 }]);
      setEstado('PAGADA');
      setClienteId('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar la venta. Verifica el stock.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-neutral-border flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-border flex justify-between items-center shrink-0 bg-white">
          <h3 className="text-xl font-bold text-neutral-textPrimary tracking-tight">Registrar nueva venta</h3>
          <button
            onClick={onClose}
            className="text-neutral-textSecondary hover:text-neutral-textPrimary rounded-lg p-1.5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[75vh]">
          {error && (
            <div className="bg-red-50 border border-semantic-danger/20 text-semantic-danger p-3 rounded-xl flex items-start gap-2 text-sm shrink-0">
              <AlertCircle className="h-5 w-5 text-semantic-danger shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Sales Lines Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-neutral-textSecondary">Artículos</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors"
                disabled={isLoading}
              >
                + Agregar
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((line, index) => {
                const selectedArt = articulos.find((a) => a.id === line.articuloId);
                const availableTallas = selectedArt ? selectedArt.tallas : [];

                return (
                  <div 
                    key={index} 
                    className="bg-[#FCFAF7] border border-neutral-border/60 p-4 rounded-2xl space-y-3 relative group"
                  >
                    {/* Trash button absolute top right */}
                    {detalles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-semantic-danger rounded-lg transition-colors"
                        title="Eliminar línea"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    {/* Article selector */}
                    <div className="flex flex-col gap-1">
                      <select
                        value={line.articuloId}
                        onChange={(e) => handleLineChange(index, 'articuloId', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                        required
                        disabled={isLoading}
                      >
                        <option value="">Seleccionar artículo...</option>
                        {articulos.map((art) => {
                          const totalStock = art.tallas.reduce((s, t) => s + t.cantidad, 0);
                          return (
                            <option key={art.id} value={art.id} disabled={totalStock === 0}>
                              {art.nombre} (${new Intl.NumberFormat('es-CO').format(art.precio)})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Talla & Quantity side by side */}
                    {line.articuloId && (
                      <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Talla</label>
                          <select
                            value={line.talla}
                            onChange={(e) => handleLineChange(index, 'talla', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-neutral-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                            required
                            disabled={isLoading}
                          >
                            <option value="">Talla...</option>
                            {availableTallas.map((t) => (
                              <option key={t.id} value={t.talla} disabled={t.cantidad === 0}>
                                T{t.talla} ({t.cantidad} disp)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Cantidad</label>
                          <input
                            type="number"
                            value={line.cantidad}
                            onChange={(e) => handleLineChange(index, 'cantidad', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-neutral-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-neutral-textPrimary"
                            required
                            min="1"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic total checkout block */}
          <div className="bg-[#FCFAF7] border border-neutral-border/60 rounded-2xl p-4.5 flex justify-between items-center shrink-0">
            <span className="text-sm font-semibold text-neutral-textSecondary">Total</span>
            <span className="text-xl font-bold text-neutral-textPrimary">{formatCurrency(calculatedTotal)}</span>
          </div>

          {/* Forma de pago Section */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Forma de pago</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setEstado('PAGADA'); setClienteId(''); }}
                className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all
                  ${estado === 'PAGADA'
                    ? 'border-primary bg-primary-light/40 text-primary font-bold shadow-sm'
                    : 'bg-white border-neutral-border text-neutral-textSecondary hover:bg-slate-50'
                  }`}
                disabled={isLoading}
              >
                <span className="text-base">💵</span>
                Contado
              </button>
              <button
                type="button"
                onClick={() => setEstado('FIADA')}
                className={`py-3.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all
                  ${estado === 'FIADA'
                    ? 'border-primary bg-primary-light/40 text-primary font-bold shadow-sm'
                    : 'bg-white border-neutral-border text-neutral-textSecondary hover:bg-slate-50'
                  }`}
                disabled={isLoading}
              >
                <ClipboardList className="h-4 w-4 shrink-0 text-slate-500" />
                Fiado
              </button>
            </div>
          </div>

          {/* Cliente selector for Fiados */}
          {estado === 'FIADA' && (
            <div className="bg-slate-50 border border-neutral-border/40 p-4 rounded-xl space-y-3 shrink-0 animate-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center">
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
