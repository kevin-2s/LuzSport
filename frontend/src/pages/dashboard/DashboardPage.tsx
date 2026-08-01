import React from 'react';
import { useSessionStore } from '../../store/sessionStore';
import { useDashboard } from '../../hooks/useDashboard';
import { 
  LayoutDashboard, 
  Layers, 
  ShoppingBag, 
  Users, 
  LogOut, 
  AlertTriangle, 
  ClipboardList, 
  ArrowRight,
  HelpCircle,
  TrendingUp,
  PackagePlus,
  Info
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, clearSession } = useSessionStore();
  const { data, isLoading, error } = useDashboard();

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('COP', '$');
  };

  // Get active branch details
  const sucursalNombre = 'Calzado & Moda';

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col md:flex-row text-neutral-textPrimary font-sans">
      
      {/* 1. Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col justify-between border-r border-slate-800 shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-slate-800">
            <p className="text-[10px] tracking-wider uppercase font-semibold text-slate-500">Tienda</p>
            <h2 className="text-xl font-bold text-white tracking-wide mt-0.5">{sucursalNombre}</h2>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <a 
              href="#resumen" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white font-medium bg-primary transition-all"
            >
              <LayoutDashboard className="h-5 w-5" />
              Resumen
            </a>
            <a 
              href="#inventario" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium transition-all"
            >
              <Layers className="h-5 w-5" />
              Inventario
            </a>
            <a 
              href="#ventas" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium transition-all"
            >
              <ShoppingBag className="h-5 w-5" />
              Ventas
            </a>
            <a 
              href="#fiados" 
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium transition-all"
            >
              <Users className="h-5 w-5" />
              Fiados
            </a>
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center font-bold text-white text-sm shadow-inner uppercase">
              {user?.email ? user.email[0] : 'D'}
            </div>
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[140px]">
                {user?.email ? user.email.split('@')[0] : 'Encargado'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {user?.rol === 'SUPERADMIN' ? 'Administrador' : 'Encargado'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={clearSession}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Top Header */}
        <header className="flex md:hidden justify-between items-center bg-slate-900 text-white px-5 py-3.5 border-b border-slate-800 sticky top-0 z-30 shadow-sm shrink-0">
          <div>
            <p className="text-[9px] tracking-wider uppercase font-semibold text-slate-500">Tienda</p>
            <h2 className="text-sm font-bold text-white tracking-wide">{sucursalNombre}</h2>
          </div>
          <button 
            onClick={clearSession}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          
          {/* Header section */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-neutral-textSecondary">
              Hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            <h1 className="text-3xl font-extrabold text-neutral-textPrimary tracking-tight animate-in fade-in duration-300">
              Resumen del día
            </h1>
          </div>

          {isLoading ? (
            /* SKELETON LOADING STATE */
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white border border-neutral-border h-28 rounded-2xl p-5 space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-neutral-border h-64 rounded-2xl"></div>
                <div className="bg-white border border-neutral-border h-64 rounded-2xl"></div>
              </div>
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="bg-red-50 border border-semantic-danger/20 text-semantic-danger p-6 rounded-2xl flex items-start gap-3">
              <Info className="h-6 w-6 text-semantic-danger shrink-0" />
              <div>
                <h3 className="font-bold text-base">Error al cargar el panel de control</h3>
                <p className="text-sm mt-1">No pudimos conectar con el servidor para obtener los datos de la sucursal. Por favor, asegúrate de que el backend esté corriendo correctamente.</p>
              </div>
            </div>
          ) : (
            /* MAIN DYNAMIC DASHBOARD DATA */
            <>
              {/* 3. Summary Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Card 1: Total vendido (Primary highlighted) */}
                <div className="bg-primary text-white p-5 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between min-h-[120px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-primary-light font-medium tracking-wide uppercase">Total vendido hoy</p>
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(data?.summary.totalVendidoHoy || 0)}</p>
                    <p className="text-xs text-primary-light/80 mt-0.5">{data?.summary.ventasHoyCount || 0} ventas</p>
                  </div>
                </div>

                {/* Card 2: Ventas hoy */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-border shadow-sm space-y-3 flex flex-col justify-between min-h-[120px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-neutral-textSecondary font-semibold tracking-wide uppercase">Ventas hoy</p>
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-textPrimary">{data?.summary.ventasHoyCount || 0}</p>
                    <p className="text-xs text-neutral-textSecondary mt-0.5">transacciones</p>
                  </div>
                </div>

                {/* Card 3: Tallas con alerta */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-border shadow-sm space-y-3 flex flex-col justify-between min-h-[120px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-neutral-textSecondary font-semibold tracking-wide uppercase">Tallas con alerta</p>
                    <div className="p-1.5 bg-yellow-50 text-semantic-warning rounded-lg">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-textPrimary">{data?.summary.tallasAlertaCount || 0}</p>
                    <p className="text-xs text-neutral-textSecondary mt-0.5">bajo el mínimo</p>
                  </div>
                </div>

                {/* Card 4: Fiados pendientes */}
                <div className="bg-white p-5 rounded-2xl border border-neutral-border shadow-sm space-y-3 flex flex-col justify-between min-h-[120px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-neutral-textSecondary font-semibold tracking-wide uppercase">Fiados pendientes</p>
                    <div className="p-1.5 bg-orange-50 text-primary rounded-lg">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neutral-textPrimary">{formatCurrency(data?.summary.fiadosPendientesMonto || 0)}</p>
                    <p className="text-xs text-neutral-textSecondary mt-0.5">{data?.summary.fiadosClientesCount || 0} clientes</p>
                  </div>
                </div>

              </div>

              {/* 4. Main Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left 2/3: Últimas ventas list */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-border shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-neutral-border flex justify-between items-center bg-white">
                    <h3 className="font-bold text-neutral-textPrimary text-base">Últimas ventas</h3>
                    <a href="#ventas" className="text-xs font-semibold text-neutral-textSecondary hover:text-primary transition-colors flex items-center gap-1">
                      Ver todo
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  {data?.recentSales && data.recentSales.length > 0 ? (
                    <div className="divide-y divide-neutral-border">
                      {data.recentSales.map((venta) => (
                        <div key={venta.id} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-bg/30 transition-colors">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-sm text-neutral-textPrimary">{venta.articulo}</p>
                            <p className="text-[11px] text-neutral-textSecondary">
                              {venta.fecha} {venta.cliente ? `• ${venta.cliente}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-neutral-textPrimary">
                              {formatCurrency(venta.monto)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider
                              ${venta.estado === 'pagada' 
                                ? 'bg-green-100 text-semantic-success' 
                                : 'bg-orange-100 text-primary'
                              }`}
                            >
                              {venta.estado}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-textSecondary">
                      <ShoppingBag className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-sm">No hay ventas registradas todavía.</p>
                    </div>
                  )}
                </div>

                {/* Right 1/3: Stock bajo por talla */}
                <div className="bg-white rounded-2xl border border-neutral-border shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="px-6 py-5 border-b border-neutral-border bg-white">
                      <h3 className="font-bold text-neutral-textPrimary text-base">Stock bajo por talla</h3>
                    </div>
                    {data?.lowStock && data.lowStock.length > 0 ? (
                      <div className="divide-y divide-neutral-border">
                        {data.lowStock.map((item) => (
                          <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-bg/30 transition-colors">
                            <div>
                              <p className="font-semibold text-sm text-neutral-textPrimary">{item.articulo}</p>
                              <p className="text-[11px] text-neutral-textSecondary">{item.descripcion}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md
                              ${item.stock === 0 
                                ? 'bg-red-100 text-semantic-danger' 
                                : 'bg-yellow-100 text-semantic-warning'
                              }`}
                            >
                              {item.stock} uds
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-neutral-textSecondary">
                        <Layers className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm">No hay alertas de stock bajo. ¡Todo al día!</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-neutral-border bg-slate-50/50">
                    <a href="#inventario" className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-neutral-textSecondary hover:text-primary transition-colors">
                      Ver inventario
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* 5. Bottom Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Action 1: Registrar venta */}
            <button className="bg-white p-5 rounded-2xl border border-neutral-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left flex items-start gap-4">
              <div className="p-3 bg-neutral-bg text-primary rounded-xl shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-neutral-textPrimary">Registrar venta</p>
                <p className="text-xs text-neutral-textSecondary">Nueva transacción</p>
              </div>
            </button>

            {/* Action 2: Agregar artículo */}
            <button className="bg-white p-5 rounded-2xl border border-neutral-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left flex items-start gap-4">
              <div className="p-3 bg-neutral-bg text-primary rounded-xl shrink-0">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-neutral-textPrimary">Agregar artículo</p>
                <p className="text-xs text-neutral-textSecondary">Al inventario</p>
              </div>
            </button>

            {/* Action 3: Ver fiados */}
            <button className="bg-white p-5 rounded-2xl border border-neutral-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all text-left flex items-start gap-4">
              <div className="p-3 bg-neutral-bg text-primary rounded-xl shrink-0">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-neutral-textPrimary">Ver fiados</p>
                <p className="text-xs text-neutral-textSecondary">Créditos activos</p>
              </div>
            </button>

          </div>

        </main>

        {/* 6. Bottom Right Help Button */}
        <button className="absolute bottom-6 right-6 p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all z-10">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-400 flex md:hidden items-center justify-around py-2.5 z-40 shadow-lg">
          <a 
            href="#resumen" 
            className="flex flex-col items-center gap-1 text-[10px] font-semibold text-primary"
          >
            <LayoutDashboard className="h-5 w-5" />
            Resumen
          </a>
          <a 
            href="#inventario" 
            className="flex flex-col items-center gap-1 text-[10px] font-semibold hover:text-white transition-colors"
          >
            <Layers className="h-5 w-5" />
            Inventario
          </a>
          <a 
            href="#ventas" 
            className="flex flex-col items-center gap-1 text-[10px] font-semibold hover:text-white transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            Ventas
          </a>
          <a 
            href="#fiados" 
            className="flex flex-col items-center gap-1 text-[10px] font-semibold hover:text-white transition-colors"
          >
            <Users className="h-5 w-5" />
            Fiados
          </a>
        </nav>
      </div>

    </div>
  );
};
