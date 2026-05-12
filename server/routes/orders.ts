import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { sort, limit, ...query } = req.query;
    const hasQuery = Object.keys(query).length > 0;
    if (req.user?.role === 'admin') {
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
    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user?.email && existing.created_by === req.user.email;
    if (!isAdmin && !isOwner) return res.status(403).json({ message: 'Sin permisos' });
    const order = await db.update('orders', req.params.id, req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar pedido' });
  }
});

export default router;
