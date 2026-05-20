import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Clock, Receipt, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { generateInvoice } from '../utils/generateInvoice';
import { useLanguage } from '@/lib/LanguageContext';

export default function Invoices() {
  const { t, language } = useLanguage();
  const dateLocale = language === 'es' ? es : enUS;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const all = await base44.entities.Order.filter({ created_by: user.email }, '-created_date', 50);
      // Only show orders that are not cancelled
      return all.filter((o: any) => o.status?.toLowerCase() !== 'cancelado');
    },
  });

  const handleDownloadInvoice = async (order: any) => {
    try {
      const user = await base44.auth.me();
      generateInvoice(order, user);
      toast.success(t('invoices.downloadSuccess'));
    } catch (err) {
      console.error('INVOICE ERROR:', err);
      toast.error(t('invoices.downloadError'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto px-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center px-6">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-2">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-2xl font-bold">{t('invoices.noInvoices')}</h2>
        <p className="text-muted-foreground text-sm font-body max-w-xs">
          {t('invoices.noInvoicesDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">{t('invoices.title')}</h1>
            <p className="text-muted-foreground text-sm font-body">{t('invoices.desc')}</p>
          </div>
        </div>
      </div>

      {/* Desktop Table View / Mobile List View */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('invoices.th.date')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('invoices.th.folio')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('invoices.th.status')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('invoices.th.total')}</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">{t('invoices.th.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order, idx) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-secondary/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {order.created_date && format(new Date(order.created_date), "dd/MM/yyyy", { locale: dateLocale })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                      #{order.id?.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                      order.status === 'entregado' || order.status === 'listo'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {order.status || 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-foreground">
                      ${order.total?.toLocaleString()} <span className="text-[10px] text-muted-foreground">MXN</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Helpful info box */}
      <div className="bg-secondary/30 rounded-2xl p-6 border border-border flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-border">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-heading font-bold text-sm mb-1">{t('invoices.about.title')}</h4>
          <p className="text-xs text-muted-foreground font-body leading-relaxed">
            {t('invoices.about.desc')}
          </p>
        </div>
      </div>
    </div>
  );
}
