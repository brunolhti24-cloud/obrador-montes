import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Stats
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pending = orders.filter(o => o.status === 'pendiente').length;
  const inPrep = orders.filter(o => o.status === 'en_preparacion').length;
  const cancelled = orders.filter(o => o.status === 'cancelado').length;
  const delivered = orders.filter(o => o.status === 'entregado').length;

  // Last 7 days chart
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const start = startOfDay(day).getTime();
    const end = start + 86400000;
    const dayOrders = orders.filter(o => {
      const t = new Date(o.created_date).getTime();
      return t >= start && t < end && o.status !== 'cancelado';
    });
    return {
      day: format(day, 'EEE', { locale: es }),
      ventas: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
      pedidos: dayOrders.length,
    };
  });

  // Top products
  const productCounts = {};
  orders.forEach(o => {
    if (o.status === 'cancelado') return;
    o.items?.forEach(item => {
      productCounts[item.product_name] = (productCounts[item.product_name] || 0) + (item.quantity || 1);
    });
  });
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = [
    { label: 'Ingresos totales', value: `$${totalRevenue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`, sub: 'MXN', icon: DollarSign, color: '#b71c1c' },
    { label: 'Total pedidos', value: orders.length, sub: 'pedidos', icon: ShoppingBag, color: '#1a237e' },
    { label: 'Pendientes', value: pending, sub: 'sin pagar', icon: Clock, color: '#d97706' },
    { label: 'En preparación', value: inPrep, sub: 'en proceso', icon: CheckCircle2, color: '#ea580c' },
    { label: 'Entregados', value: delivered, sub: 'completados', icon: CheckCircle2, color: '#16a34a' },
    { label: 'Cancelados', value: cancelled, sub: 'cancelados', icon: XCircle, color: '#dc2626' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard Admin</h1>
          <p className="text-xs text-muted-foreground font-body uppercase tracking-widest mt-1">Resumen Ejecutivo</p>
        </div>
        <Link to="/admin/pedidos">
          <Button size="sm" className="font-body font-bold text-black" style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
            Administrar Pedidos
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl bg-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="glass-panel rounded-2xl border border-white/5 p-5 shadow-lg hover:border-white/20 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-bold font-heading mt-2" style={{ color: s.color === '#b71c1c' ? '#FCF6BA' : s.color === '#1a237e' ? '#B38728' : s.color }}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-1 uppercase tracking-widest">{s.sub}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: s.color === '#b71c1c' ? 'rgba(252, 246, 186, 0.1)' : s.color === '#1a237e' ? 'rgba(179, 135, 40, 0.1)' : s.color + '18', borderColor: s.color === '#b71c1c' ? 'rgba(252, 246, 186, 0.2)' : s.color === '#1a237e' ? 'rgba(179, 135, 40, 0.2)' : s.color + '30' }}>
                    <Icon className="w-5 h-5" style={{ color: s.color === '#b71c1c' ? '#FCF6BA' : s.color === '#1a237e' ? '#B38728' : s.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart + Top products */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sales chart */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 shadow-lg">
          <h2 className="font-heading font-semibold text-lg mb-6 flex items-center gold-gradient-text">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ventas 7 Días (MXN)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={last7} barSize={32}>
              <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 11, fontFamily: 'var(--font-body)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                formatter={(v) => [`$${v.toLocaleString('es-MX')}`, 'Ventas']}
                contentStyle={{ borderRadius: 12, fontSize: 12, fontFamily: 'var(--font-body)', backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <Bar dataKey="ventas" radius={[6, 6, 0, 0]}>
                {last7.map((_, i) => (
                  <Cell key={i} fill={i === last7.length - 1 ? '#FCF6BA' : '#B38728'} opacity={i === last7.length - 1 ? 1 : 0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 shadow-lg">
          <h2 className="font-heading font-semibold text-lg mb-6 text-foreground">Top Cortes</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-8">Sin información disponible</p>
          ) : (
            <div className="space-y-5">
              {topProducts.map(([name, qty], i) => {
                const max = topProducts[0][1];
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs font-body mb-2 uppercase tracking-wide">
                      <span className="font-semibold truncate max-w-[180px] text-foreground">{name}</span>
                      <span className="text-accent">{qty} kg</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(qty / max) * 100}%`,
                          background: i === 0 ? 'linear-gradient(90deg, #B38728, #FCF6BA)' : 'rgba(252, 246, 186, 0.4)',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="glass-panel rounded-2xl border border-white/5 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg text-foreground">Órdenes Recientes</h2>
          <Link to="/admin/pedidos" className="text-[10px] uppercase tracking-widest text-accent font-body hover:text-white transition-colors">Historial Completo →</Link>
        </div>
        <div className="space-y-1">
          {orders.slice(0, 5).map(order => {
            const cfg = {
              pendiente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
              confirmado: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              en_preparacion: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
              listo: 'bg-green-500/10 text-green-400 border-green-500/20',
              entregado: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              cancelado: 'bg-red-500/10 text-red-400 border-red-500/20',
            }[order.status] || 'bg-white/5 text-white/50 border-white/10';
            return (
              <div key={order.id} className="flex items-center justify-between text-sm py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-heading font-bold text-sm text-foreground">#{order.id?.slice(-6).toUpperCase()}</span>
                  <span className={`text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border ${cfg}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-body text-muted-foreground">
                  <span className="uppercase tracking-widest">{order.created_date && format(new Date(order.created_date), "dd MMM", { locale: es })}</span>
                  <span className="font-bold font-heading text-base text-accent">${order.total?.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}