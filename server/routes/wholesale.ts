import { Router } from 'express';
import { db } from '../db.js';
import { sendWholesaleInquiryEmail, sendWholesaleApprovalEmail } from '../utils/mailer.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const inquiry = req.body;
    
    // 1. Save inquiry to database (Try to, but don't crash if table missing)
    let savedInquiry = inquiry;
    try {
      savedInquiry = await db.create('wholesale_inquiries', {
        ...inquiry,
        status: 'pendiente'
      }, inquiry.email || 'guest');
      console.log('✅ Solicitud de mayoreo guardada en DB');
    } catch (dbError) {
      console.error('⚠️ Error al guardar en DB (¿Falta la tabla?):', dbError.message);
      // We continue because the email is more important
    }

    // 2. Notify Admin via email
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendWholesaleInquiryEmail(adminEmail, savedInquiry);
    }

    // 3. Create notification for admin in dashboard (Optional)
    try {
      if (adminEmail) {
        await db.create('notifications', {
          user_email: adminEmail,
          title: '🏢 Nueva solicitud de Mayoreo',
          message: `${inquiry.businessName} está interesado en comprar por volumen.`,
          type: 'info',
          read: false,
        }, 'system');
      }
    } catch (notifError) {
      console.error('⚠️ No se pudo crear la notificación en el dashboard');
    }

    res.status(201).json({ message: 'Solicitud recibida' });
  } catch (error) {
    console.error('[wholesale] Error:', error);
    res.status(500).json({ message: 'Error al procesar solicitud' });
  }
});

// Admin routes
router.get('/', requireAdmin, async (req, res) => {
  try {
    const inquiries = await db.list('wholesale_inquiries', '-created_date');
    res.json(inquiries);
  } catch (error) {
    console.error('[wholesale] GET Error:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const inquiry = await db.update('wholesale_inquiries', req.params.id, req.body);
    if (!inquiry) return res.status(404).json({ message: 'Solicitud no encontrada' });

    // logic for wholesale approval
    if (req.body.status === 'aprobada') {
      console.log(`[wholesale] Aprobando solicitud para: ${inquiry.email}`);
      
      // 1. Update user role to 'wholesaler'
      try {
        const users = await db.list('users');
        const user = users.find(u => u.email === inquiry.email);
        if (user) {
          await db.update('users', user.id, { role: 'wholesale' });
          console.log(`[wholesale] Rol de usuario actualizado a 'wholesale' para: ${inquiry.email}`);
        } else {
          console.warn(`[wholesale] Usuario no encontrado para el correo: ${inquiry.email}. No se pudo cambiar el rol.`);
        }
      } catch (userErr: any) {
        console.error('[wholesale] Error al actualizar rol de usuario:', userErr.message);
      }

      // 2. Send approval email
      try {
        await sendWholesaleApprovalEmail(inquiry.email, inquiry.businessName || inquiry.contactName);
      } catch (emailErr: any) {
        console.error('[wholesale] Error al enviar email de aprobación:', emailErr.message);
      }
    }

    res.json(inquiry);
  } catch (error) {
    console.error('[wholesale] PUT Error:', error);
    res.status(500).json({ message: 'Error al actualizar solicitud' });
  }
});

export default router;
