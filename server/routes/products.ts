import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/products - List all products (public)
router.get('/', async (req, res) => {
  try {
    const { sort, limit, ...query } = req.query;
    const hasQuery = Object.keys(query).length > 0;
    const products = hasQuery
      ? await db.filter('products', query, sort as string, limit as string)
      : await db.list('products', sort as string, limit as string);
    res.json(products);
  } catch (err) {
    console.error('[products] Error:', err.message);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// GET /api/products/:id - Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getById('products', req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// POST /api/products - Create product (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const product = await db.create('products', req.body, req.user.email);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await db.update('products', req.params.id, req.body);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db.delete('products', req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

export default router;
