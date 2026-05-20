import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';
import { sendWholesaleApprovalEmail } from '../utils/mailer.js';

const router = Router();

// Only admin can manage users
router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const users = await db.list('users');
    // Remove sensitive data
    const sanitized = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || 'customer',
      created_date: u.created_date,
      verified: u.verified
    }));
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'customer', 'wholesale', 'staff'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }
    
    const existingUser = await db.getById('users', req.params.id);
    if (!existingUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = await db.update('users', req.params.id, { role });
    
    // If upgraded to wholesale and wasn't before
    if (role === 'wholesale' && existingUser.role !== 'wholesale') {
      try {
        console.log(`[users] Usuario ${user.email} ascendido a mayorista manual`);
        await sendWholesaleApprovalEmail(user.email, user.name || 'Cliente');
      } catch (emailErr: any) {
        console.error('[users] Error enviando email de aprobación:', emailErr.message);
      }
    }
    
    res.json({ message: 'Rol actualizado', role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const success = await db.delete('users', req.params.id);
    if (!success) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

export default router;
