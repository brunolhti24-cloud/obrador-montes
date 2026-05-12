import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { sort, limit, ...query } = req.query;
    if (req.user?.email) {
      const notifications = await db.filter('notifications', { ...query, user_email: req.user.email }, sort as string, limit as string);
      return res.json(notifications);
    }
    res.json([]);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const notification = await db.update('notifications', req.params.id, req.body);
    if (!notification) return res.status(404).json({ message: 'Notificación no encontrada' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar notificación' });
  }
});

export default router;
