import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { sort, limit, ...query } = req.query;
    const hasQuery = Object.keys(query).length > 0;
    const reviews = hasQuery
      ? await db.filter('reviews', query, sort as string, limit as string)
      : await db.list('reviews', sort as string, limit as string);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
});

router.post('/', async (req, res) => {
  try {
    const createdBy = req.user?.email || 'guest';
    const review = await db.create('reviews', req.body, createdBy);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear reseña' });
  }
});

export default router;
