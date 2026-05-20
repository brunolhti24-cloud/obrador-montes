import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ClipboardList, Search, RefreshCw, Clock, User, Phone, StickyNote, Mail, AlertCircle, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { generateOrderTicket } from '@/lib/pdfGenerator';

const statusConfig = {
  pendiente:      { label: 'Pendiente de Pago', color: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400' },
  confirmado:     { label: 'Pago Confirmado',   color: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500' },
  pagado:         { label: 'Pago Confirmado',   color: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500' },
  en_preparacion: { label: 'En Preparación',    color: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400' },
  listo:          { label: 'Listo para Recoger', color: 'bg-green-50 text-green-600 border-green-200', dot: 'bg-green-500' },
  entregado:      { label: 'Entregado',          color: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  cancelado:      { label: 'Cancelado',          color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
};

const allStatuses = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

export default function AdminOrders() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Estado actualizado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Order.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Pedido eliminado');
    },
  });

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus || (filterStatus === 'confirmado' && o.status === 'pagado');
    const matchSearch =
      !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone?.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200"
            style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}>
            <ClipboardList className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-slate-900">Pedidos</h1>
            <p className="text-xs text-slate-400 font-body uppercase tracking-widest mt-1">{orders.length} órdenes en total</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="font-body gap-2 bg-white border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por ID, nombre o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 font-body h-12 bg-white border-slate-200 focus-visible:ring-primary rounded-xl text-slate-900"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 font-body h-12 bg-white border-slate-200 focus:ring-primary rounded-xl text-slate-900">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200 text-slate-900">
            <SelectItem value="all">Todos los estados</SelectItem>
            {allStatuses.map(s => (
              <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {allStatuses.map(s => {
          const count = orders.filter(o => o.status === s || (s === 'confirmado' && o.status === 'pagado')).length;
          const cfg = statusConfig[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
              className={`rounded-xl border p-4 text-center transition-all duration-300 hover:shadow-md ${
                filterStatus === s ? cfg.color + ' shadow-lg scale-105' : 'bg-white border-slate-100 hover:border-slate-300'
              }`}
            >
              <p className="text-2xl font-bold font-heading">{count}</p>
              <p className="text-[9px] font-body text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                {cfg.label.split(' ')[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-slate-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-body uppercase tracking-widest text-sm">No hay pedidos registrados</div>
      ) : (
        <div className="space-y-5">
          {filtered.map((order, idx) => {
            const cfg = statusConfig[order.status] || statusConfig.pendiente;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Top bar */}
                <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 ${cfg.color.split(' ')[0]}`}>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-heading font-bold text-base text-slate-900">
                      #{order.id?.slice(-6).toUpperCase()}
                    </span>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-slate-500 font-body flex items-center gap-1.5 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      {order.created_date && format(new Date(order.created_date), "d MMM, HH:mm", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => generateOrderTicket(order)}
                      className="h-9 text-[10px] font-bold gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Ticket PDF
                    </Button>
                    <span className="font-heading font-bold text-2xl text-slate-900">
                      ${order.total?.toFixed(0)} <span className="text-xs font-body font-normal text-slate-400 uppercase tracking-widest ml-1">MXN</span>
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 flex flex-wrap gap-8 items-start">
                  {/* Items */}
                  <div className="flex-1 min-w-[240px]">
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-bold">Artículos</h4>
                    <div className="space-y-2.5">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm font-body text-slate-700">
                          <span><span className="font-bold text-primary mr-2">{item.quantity}x</span> {item.product_name}</span>
                          <span className="font-bold text-slate-900">${item.subtotal?.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="text-xs font-body space-y-2.5 text-slate-500 min-w-[220px]">
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-bold">Cliente</h4>
                    {order.created_by && (
                      <p className="flex items-center gap-2 text-slate-700"><Mail className="w-3.5 h-3.5 text-slate-400" /> {order.created_by}</p>
                    )}
                    {order.customer_name && (
                      <p className="flex items-center gap-2 text-slate-700"><User className="w-3.5 h-3.5 text-slate-400" /> {order.customer_name}</p>
                    )}
                    {order.customer_phone && (
                      <p className="flex items-center gap-2 text-slate-700"><Phone className="w-3.5 h-3.5 text-slate-400" /> {order.customer_phone}</p>
                    )}
                    {order.notes && (
                      <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <p className="flex items-start gap-2 text-slate-600"><StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" /> {order.notes}</p>
                      </div>
                    )}
                    {order.status === 'cancelado' && order.payment_method !== 'efectivo' && (
                      <div className="mt-2 p-3 rounded-xl bg-red-50 border border-red-100 flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-700 text-[10px] leading-tight font-medium">
                          Reembolso Manual Requerido: Si el cliente ya pagó por tarjeta, ingresa a OpenPay.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status control */}
                  <div className="min-w-[220px]">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 font-bold">Cambiar Estado</p>
                    <Select
                      value={order.status === 'pagado' ? 'confirmado' : order.status}
                      onValueChange={val => updateMutation.mutate({ id: order.id, status: val })}
                      disabled={updateMutation.isPending}
                    >
                      <SelectTrigger className="h-11 text-xs font-body w-full bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-primary shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
                        {allStatuses.map(s => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {statusConfig[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Delete button for cancelled orders */}
                    {order.status?.toLowerCase() === 'cancelado' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3 w-full text-xs gap-2 font-bold shadow-sm"
                        onClick={() => {
                          if (confirm('¿Eliminar este pedido cancelado permanentemente?')) {
                            deleteMutation.mutate(order.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar Registro
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}