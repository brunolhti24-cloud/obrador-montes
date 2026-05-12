import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');

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
        <h1 className="font-heading text-3xl font-bold text-foreground">¡Pago exitoso!</h1>
        <p className="text-muted-foreground font-body max-w-sm">
          Tu pedido fue confirmado. Recibirás un email de confirmación y podrás rastrear el estado en "Mis Pedidos".
        </p>
        {orderId && (
          <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full inline-block mt-2">
            Pedido #{orderId.slice(-8).toUpperCase()}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link to="/pedidos">
          <Button className="bg-primary font-body">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Ver mis pedidos
          </Button>
        </Link>
        <Link to="/catalogo">
          <Button variant="outline" className="font-body">
            Seguir comprando
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}