import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const userEmail = req.user?.email || 'guest';
    const favorites = await db.filter('favorites', { created_by: userEmail });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener favoritos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const userEmail = req.user?.email || 'guest';
    const favorite = await db.create('favorites', req.body, userEmail);
    res.status(201).json(favorite);
  } catch (err) {
    res.status(500).json({ message: 'Error al agregar favorito' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await db.delete('favorites', req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Favorito no encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar favorito' });
  }
});

export default router;
