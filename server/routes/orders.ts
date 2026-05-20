import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { 
  sendOrderConfirmationEmail,
  sendOrderInPreparationEmail,
  sendOrderReadyEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail 
} from '../utils/mailer.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { sort, limit, ...query } = req.query;
    const hasQuery = Object.keys(query).length > 0;
    if (req.user?.role === 'admin' || req.user?.role === 'staff') {
      const orders = hasQuery
        ? await db.filter('orders', query, sort as string, limit as string)
        : await db.list('orders', sort as string, limit as string);
      return res.json(orders);
    }
    if (req.user?.email) {
      const orders = await db.filter('orders', { ...query, created_by: req.user.email }, sort as string, limit as string);
      return res.json(orders);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const createdBy = req.user?.email || 'guest';
    const order = await db.create('orders', { ...req.body, status: req.body.status || 'pendiente' }, createdBy);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear pedido' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await db.getById('orders', req.params.id);
    if (!existing) return res.status(404).json({ message: 'Pedido no encontrado' });
    const isStaff = req.user?.role === 'admin' || req.user?.role === 'staff';
    const isOwner = req.user?.email && existing.created_by === req.user.email;
    if (!isStaff && !isOwner) return res.status(403).json({ message: 'Sin permisos' });
    // Logic to restore stock if status changes to 'cancelado'
    if (req.body.status === 'cancelado' && existing.status !== 'cancelado') {
      console.log(`[orders] Restaurando stock para pedido cancelado: ${req.params.id}`);
      const items = existing.items || [];
      for (const item of items) {
        try {
          const product = await db.getById('products', item.product_id);
          if (product) {
            const currentStock = product.stock || 0;
            const newStock = currentStock + (item.quantity || 0);
            await db.update('products', item.product_id, { 
              stock: newStock,
              in_stock: newStock > 0
            });
            console.log(`[orders] Stock restaurado para ${item.product_id}: +${item.quantity}`);
          }
        } catch (stockErr: any) {
          console.error(`⚠️ Error al restaurar stock para ${item.product_id}:`, stockErr.message);
        }
      }
    }

    // Send email notifications on status change
    if (req.body.status && req.body.status !== existing.status) {
      const email = existing.customer_email || (existing.created_by && existing.created_by !== 'guest' ? existing.created_by : null);
      if (email && email.includes('@')) {
        const orderData = { ...existing, ...req.body };
        const status = req.body.status;
        console.log(`[orders] Enviando correo de actualización de estado (${status}) para pedido ${req.params.id} a ${email}`);
        
        switch (status) {
          case 'confirmado':
          case 'pagado':
            sendOrderConfirmationEmail(email, orderData);
            break;
          case 'en_preparacion':
            sendOrderInPreparationEmail(email, orderData);
            break;
          case 'listo':
            sendOrderReadyEmail(email, orderData);
            break;
          case 'entregado':
            sendOrderDeliveredEmail(email, orderData);
            break;
          case 'cancelado':
            sendOrderCancelledEmail(email, orderData);
            break;
          default:
            break;
        }
      }
    }

    const order = await db.update('orders', req.params.id, req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar pedido' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const isStaff = req.user?.role === 'admin' || req.user?.role === 'staff';
    if (!isStaff) return res.status(403).json({ message: 'Sin permisos' });
    const success = await db.delete('orders', req.params.id);
    if (!success) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json({ message: 'Pedido eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar pedido' });
  }
});

export default router;
