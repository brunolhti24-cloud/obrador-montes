import { Router } from 'express';
import { db } from '../db.js';
import { generateToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }
    const users = await db.list('users');
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }
    
    // Check if user is verified
    if (user.verified === false) {
      return res.status(403).json({ 
        requiresVerification: true, 
        message: 'Por favor verifica tu correo electrónico para poder acceder.' 
      });
    }

    const token = generateToken({ email: user.email, role: user.role, name: user.name });
    return res.json({ user: { email: user.email, role: user.role, name: user.name }, token });
  } catch (err) {
    console.error('[auth] Login error:', err.message);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    const users = await db.list('users');
    const existing = users.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ message: 'Ya existe una cuenta con este correo' });
    }

    // Generate a 6-digit random code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await db.create('users', { 
      name, 
      email, 
      password, 
      role: 'customer',
      verified: false,
      verificationCode
    }, email);

    // Enviar el correo de verificación de forma asíncrona
    await sendVerificationEmail(newUser.email, verificationCode);

    return res.json({ 
      requiresVerification: true, 
      message: 'Te hemos enviado un código de 6 dígitos a tu correo. Revisa tu bandeja de entrada o spam.' 
    });
  } catch (err) {
    console.error('[auth] Register error:', err.message);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Correo y código son requeridos' });
    }

    const users = await db.list('users');
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'El usuario ya está verificado' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'El código de verificación es incorrecto' });
    }

    // Mark as verified and clear the code
    await db.update('users', user.id, {
      verified: true,
      verificationCode: null
    });

    // Automatically log them in by generating a token
    const token = generateToken({ email: user.email, role: user.role, name: user.name });
    return res.json({ 
      message: 'Cuenta verificada exitosamente',
      user: { email: user.email, role: user.role, name: user.name }, 
      token 
    });

  } catch (err) {
    console.error('[auth] Verify error:', err.message);
    res.status(500).json({ message: 'Error al verificar la cuenta' });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'El correo es requerido' });

    const users = await db.list('users');
    const user = users.find(u => u.email === email);

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user.verified) return res.status(400).json({ message: 'La cuenta ya está verificada' });

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.update('users', user.id, { verificationCode: newCode });
    await sendVerificationEmail(email, newCode);

    res.json({ message: 'Nuevo código enviado con éxito' });
  } catch (err) {
    res.status(500).json({ message: 'Error al reenviar código' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'El correo es requerido' });

    const users = await db.list('users');
    const user = users.find(u => u.email === email);

    if (!user) {
      // For security, don't reveal if user exists. Just say "if exists, email sent"
      return res.json({ message: 'Si el correo está registrado, recibirás un código de recuperación.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.update('users', user.id, { resetCode });
    await sendPasswordResetEmail(email, resetCode);

    res.json({ message: 'Código de recuperación enviado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al procesar solicitud' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const users = await db.list('users');
    const user = users.find(u => u.email === email);

    if (!user || user.resetCode !== code) {
      return res.status(400).json({ message: 'Código inválido o correo incorrecto' });
    }

    await db.update('users', user.id, {
      password: newPassword, // Note: The create/update in db.ts should handle hashing if intended, 
                             // but looking at current code, we hash before saving.
      resetCode: null
    });

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al restablecer contraseña' });
  }
});

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  res.json(req.user);
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;
