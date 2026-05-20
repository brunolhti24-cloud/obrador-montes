import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardList, Clock, CheckCircle2, Truck, ChefHat, CreditCard, AlertCircle, Package, XCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { generateInvoice } from '../utils/generateInvoice';
import { useLanguage } from '@/lib/LanguageContext';

const statusConfig = {
  pendiente: {
    icon: CreditCard,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border border-amber-200',
    dot: 'bg-amber-400',
    pulse: true,
  },
  confirmado: {
    icon: CheckCircle2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    pulse: false,
  },
  pagado: {
    icon: CheckCircle2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700 border border-blue-200',
    dot: 'bg-blue-500',
    pulse: false,
  },
  en_preparacion: {
    icon: ChefHat,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700 border border-orange-200',
    dot: 'bg-orange-400',
    pulse: true,
  },
  listo: {
    icon: Package,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700 border border-green-200',
    dot: 'bg-green-500',
    pulse: false,
  },
  entregado: {
    icon: Truck,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  cancelado: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-600 border border-red-200',
    dot: 'bg-red-400',
    pulse: false,
  },
};

const steps = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado'];

function OrderTimeline({ status, t }) {
  if (status === 'cancelado') return null;
  const current = steps.indexOf(status === 'pagado' ? 'confirmado' : status);
  return (
    <div className="flex items-center gap-1 mt-4">
      {steps.map((step, i) => {
        const done = i <= current;
        const localizedLabel = t(`orders.status.${step}`);
        return (
          <React.Fragment key={step}>
            <div className={`flex flex-col items-center gap-1`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                done ? 'bg-primary shadow-md' : 'bg-gray-200'
              }`}>
                {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-[9px] font-body hidden sm:block text-center leading-tight w-14 ${
                done ? 'text-primary font-semibold' : 'text-gray-400'
              }`}>
                {localizedLabel.split(' ')[0]}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 rounded transition-all ${
                i < current ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function Orders() {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState(null);
  const { t, language } = useLanguage();
  const dateLocale = language === 'es' ? es : enUS;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const all = await base44.entities.Order.filter({ created_by: user.email }, '-created_date', 50);
      return all.filter((o: any) => o.status?.toLowerCase() !== 'cancelado');
    },
  });

  const handleDownloadInvoice = async (order: any) => {
    try {
      const user = await base44.auth.me();
      console.log('ORDER DATA:', JSON.stringify(order, null, 2));
      console.log('USER DATA:', JSON.stringify(user, null, 2));
      generateInvoice(order, user);
      toast.success(t('orders.downloadSuccess'));
    } catch (err) {
      console.error('INVOICE ERROR:', err);
      toast.error(t('orders.downloadError') + (err as any)?.message);
    }
  };

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Order.update(id, { status: 'cancelado' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      setConfirmingId(null);
      toast.success(t('orders.cancelSuccess'));
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-10 w-48" />
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner"
          style={{ background: 'linear-gradient(135deg, #7f0000 0%, #1a237e 100%)' }}>
          <ClipboardList className="w-10 h-10 text-white" />
        </div>
        <h2 className="font-heading text-2xl font-bold">{t('orders.noOrders')}</h2>
        <p className="text-muted-foreground text-sm font-body">{t('orders.noOrdersDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow"
          style={{ background: 'linear-gradient(135deg, #b71c1c, #1a237e)' }}>
          <ClipboardList className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold">{t('orders.title')}</h1>
          <p className="text-muted-foreground text-xs font-body">
            {orders.length} {orders.length === 1 ? t('orders.countSuffix') : t('orders.countSuffixPlural')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order, idx) => {
          const status = order.status?.toLowerCase().trim() || 'pendiente';
          const isCancelable = status.includes('pendiente') || status.includes('confirmado') || status === 'pagado';
          const isConfirmed = status.includes('confirmado') || status === 'pagado';
          const cfg = statusConfig[status] || statusConfig.pendiente;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={`rounded-2xl border-2 ${cfg.border} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}
            >
              {/* Header */}
              <div className={`${cfg.bg} px-5 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm">
                      {t('orders.orderNumber')} #{order.id?.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.created_date && format(new Date(order.created_date), language === 'es' ? "d 'de' MMM, yyyy · HH:mm" : "MMM d, yyyy · hh:mm a", { locale: dateLocale })}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-full font-body flex items-center gap-1.5 ${cfg.badge}`}>
                    {cfg.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.dot}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${cfg.dot}`} />
                      </span>
                    )}
                    {t(`orders.status.${status}`)}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white px-5 py-4">
                <div className="space-y-1.5 mb-4">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs font-body">
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{item.quantity}x</span> {item.product_name}
                      </span>
                      <span className="font-medium">${item.subtotal?.toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-3 border-t border-border/60">
                  <span className="text-sm font-body font-medium text-muted-foreground">{t('orders.totalOrder')}</span>
                  <span className="text-xl font-heading font-bold" style={{ color: '#b71c1c' }}>
                    ${order.total?.toFixed(0)} <span className="text-sm font-body font-normal text-muted-foreground">MXN</span>
                  </span>
                </div>

                {/* Payment warning for pending */}
                {status.includes('pendiente') && (
                  <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs font-body text-amber-700">
                      <strong>{t('orders.paymentPending')}</strong> {t('orders.paymentPendingDesc')}
                    </p>
                  </div>
                )}

                {/* Cancel button */}
                {isCancelable && (
                  <div className="mt-3">
                    {confirmingId === order.id ? (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                        <div className="flex flex-col gap-2 flex-1">
                          <p className="text-xs font-body text-red-700">{t('orders.cancelConfirm')}</p>
                          {isConfirmed && (
                            <p className="text-[10px] text-red-600 bg-red-100 p-1.5 rounded border border-red-200">
                              {t('orders.refundWarning')}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs"
                          onClick={() => cancelMutation.mutate(order.id)}
                          disabled={cancelMutation.isPending}
                        >
                          {t('orders.cancelYes')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => setConfirmingId(null)}
                        >
                          {t('orders.cancelNo')}
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(order.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-body underline underline-offset-2 transition-colors"
                      >
                        {t('orders.cancelOrder')}
                      </button>
                    )}
                  </div>
                )}

                {/* Download Invoice Button */}
                {status !== 'cancelado' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-4 py-2.5 rounded-xl transition-all duration-300 text-xs font-bold"
                    >
                      <Download className="w-4 h-4" />
                      {t('orders.downloadReceipt')}
                    </button>
                  </div>
                )}

                {/* Timeline */}
                <OrderTimeline status={status} t={t} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}