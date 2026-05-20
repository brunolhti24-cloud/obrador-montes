import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, DollarSign, Clock, 
  CheckCircle2, XCircle, Filter, Calendar, 
  Users as UsersIcon, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState(7); // Default 7 days

  if (user && user.role === 'staff') {
    return <Navigate to="/admin/pedidos" replace />;
  }

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 1000),
    refetchInterval: 10000, // Update every 10 seconds
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.api.get('/users').then(res => res),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  // Filter orders by range
  const filteredOrders = orders.filter(o => {
    const date = new Date(o.created_date);
    return date >= subDays(new Date(), dateRange);
  });

  // Stats calculation
  const totalRevenue = filteredOrders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const prevRevenue = orders
    .filter(o => {
      const date = new Date(o.created_date);
      return isWithinInterval(date, { 
        start: subDays(new Date(), dateRange * 2), 
        end: subDays(new Date(), dateRange) 
      }) && o.status !== 'cancelado';
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const growth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  // Chart Data (Last X days)
  const chartData = Array.from({ length: dateRange }, (_, i) => {
    const day = subDays(new Date(), (dateRange - 1) - i);
    const start = startOfDay(day).getTime();
    const end = start + 86400000;
    const dayOrders = orders.filter(o => {
      const t = new Date(o.created_date).getTime();
      return t >= start && t < end && o.status !== 'cancelado';
    });
    return {
      date: format(day, 'dd MMM', { locale: es }),
      ventas: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
      pedidos: dayOrders.length,
    };
  });

  // Status Distribution
  const statusCounts = [
    { name: 'Entregados', value: filteredOrders.filter(o => o.status === 'entregado').length, color: '#16a34a' },
    { name: 'Pendientes', value: filteredOrders.filter(o => o.status === 'pendiente' || o.status === 'confirmado' || o.status === 'pagado').length, color: '#d97706' },
    { name: 'Proceso', value: filteredOrders.filter(o => o.status === 'en_preparacion' || o.status === 'listo').length, color: '#ea580c' },
    { name: 'Cancelados', value: filteredOrders.filter(o => o.status === 'cancelado').length, color: '#dc2626' },
  ].filter(s => s.value > 0);

  // Top Customers
  const customerSpending: Record<string, number> = {};
  filteredOrders.forEach(o => {
    if (o.status === 'cancelado') return;
    const name = o.customer_name || o.created_by || 'Anonimo';
    customerSpending[name] = (customerSpending[name] || 0) + (o.total || 0);
  });
  const topCustomers = Object.entries(customerSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const statsCards = [
    { label: 'Ingresos', value: `$${totalRevenue.toLocaleString()}`, trend: growth, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pedidos', value: filteredOrders.length, trend: null, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clientes', value: users.length, trend: null, icon: UsersIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-slate-900 tracking-tight">Análisis de Negocio</h1>
          <p className="text-sm text-slate-500 font-body mt-1">Monitorea el rendimiento de Montega en tiempo real.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-fit">
          {[1, 7, 30].map(days => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                dateRange === days 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {days === 1 ? 'Hoy' : `${days} Días`}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl bg-slate-100" />)
        ) : (
          statsCards.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/50 flex items-center justify-between group hover:border-primary/20 transition-all"
            >
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                <h3 className="text-3xl font-bold font-heading text-slate-900">{s.value}</h3>
                {s.trend !== null && (
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${s.trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {s.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(s.trend).toFixed(1)}% vs anterior
                  </div>
                )}
              </div>
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-7 h-7 ${s.color}`} />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-xl text-slate-900">Rendimiento de Ventas</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-3 h-3 rounded-full bg-primary/20" />
              Ingresos diarios
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b71c1c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#b71c1c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '600' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '600' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontFamily: 'var(--font-body)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#b71c1c" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50 flex flex-col items-center">
          <h2 className="font-heading font-bold text-xl text-slate-900 mb-6 self-start">Estados de Pedido</h2>
          <div className="h-[240px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-heading">{filteredOrders.length}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 w-full">
            {statusCounts.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
          <h2 className="font-heading font-bold text-xl text-slate-900 mb-6">Top Clientes (Mayoristas)</h2>
          <div className="space-y-6">
            {topCustomers.map(([name, amount], i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {String(name).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Cliente Frecuente</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">${Number(amount).toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Total Invertido</p>
                </div>
              </div>
            ))}
            {topCustomers.length === 0 && <p className="text-center text-slate-400 py-10 font-body">Sin datos de clientes</p>}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-xl text-slate-900">Alertas de Inventario</h2>
            <Link to="/admin/productos" className="text-[10px] uppercase tracking-widest text-primary font-bold hover:underline">Surtir Todo →</Link>
          </div>
          <div className="space-y-4">
             {(() => {
               const lowStock = (products as any[]).filter(p => (p.stock || 0) <= (p.min_stock || 10));
               if (lowStock.length === 0) return <p className="text-center text-slate-400 py-10 font-body text-xs">Inventario saludable ✓</p>;
               return lowStock.slice(0, 4).map(p => (
                 <div key={p.id} className="flex items-center justify-between p-3 rounded-2xl bg-red-50/50 border border-red-100/50">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     <span className="text-sm font-bold text-slate-900">{p.name}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-xs font-bold text-red-600">{p.stock || 0}kg restantes</span>
                   </div>
                 </div>
               ));
             })()}
          </div>
        </div>

        {/* Quick Actions / Alerts */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl md:col-span-2 lg:col-span-1">
          <div className="relative z-10 space-y-6">
            <h2 className="font-heading font-bold text-xl">Resumen Operativo</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] text-white/50 uppercase font-bold mb-1">Por Atender</p>
                <p className="text-2xl font-bold font-heading">
                  {orders.filter(o => o.status === 'pendiente' || o.status === 'confirmado' || o.status === 'pagado').length}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] text-white/50 uppercase font-bold mb-1">En Cocina</p>
                <p className="text-2xl font-bold font-heading">{orders.filter(o => o.status === 'en_preparacion').length}</p>
              </div>
            </div>
            <Link to="/admin/pedidos">
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-2xl h-12 mt-4">
                Gestionar Pedidos Pendientes
              </Button>
            </Link>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}