import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { generateOrderTicket } from '@/lib/pdfGenerator';
import { useLanguage } from '@/lib/LanguageContext';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const { t } = useLanguage();

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderId ? base44.entities.Order.get(orderId) : null,
    enabled: !!orderId,
  });

  useEffect(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
      >
        <CheckCircle2 className="w-14 h-14 text-green-600" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h1 className="font-heading text-3xl font-bold text-foreground">{t('success.title')}</h1>
        <p className="text-muted-foreground font-body max-w-sm">
          {t('success.desc')}
        </p>
        {orderId && (
          <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full inline-block mt-2">
            {t('success.orderId')}{orderId.slice(-8).toUpperCase()}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {order && (
          <Button 
            onClick={() => generateOrderTicket(order)}
            className="bg-slate-900 text-white font-bold"
          >
            <Download className="w-4 h-4 mr-2" />
            {t('success.download')}
          </Button>
        )}
        <Link to="/pedidos">
          <Button variant="outline" className="font-body">
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t('success.viewOrders')}
          </Button>
        </Link>
        <Link to="/catalogo">
          <Button variant="ghost" className="font-body">
            {t('success.continue')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}