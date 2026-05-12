import { Router } from 'express';
import { db } from '../db.js';
import { generateToken } from '../middleware/auth.js';
import nodemailer from 'nodemailer';

const router = Router();

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Función para enviar correo de forma real con un diseño Premium
async function sendVerificationEmail(email: string, code: string) {
  try {
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 12px; padding: 40px 30px;">
          <h1 style="color: #FCF6BA; font-size: 24px; margin-bottom: 10px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase;">Obrador Montes</h1>
          <p style="color: #999; font-size: 14px; margin-bottom: 30px; letter-spacing: 1px;">VERIFICACIÓN DE IDENTIDAD</p>
          
          <p style="font-size: 16px; color: #ddd; margin-bottom: 25px; line-height: 1.5;">Hemos recibido una solicitud de registro para esta dirección de correo electrónico.</p>
          
          <div style="background: linear-gradient(135deg, #2a2a2a, #1a1a1a); border: 1px solid #BF953F; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="font-size: 12px; color: #BF953F; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">TU CÓDIGO DE ACCESO</p>
            <p style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; margin: 0;">${code}</p>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.5;">Ingresa este código en la aplicación para activar tu cuenta.<br>Si no solicitaste esto, puedes ignorar este mensaje.</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px;">© ${new Date().getFullYear()} Obrador Montes. Carnes de Alta Calidad.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Obrador Montes" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `Tu código de verificación: ${code}`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de verificación enviado exitosamente a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar el correo:', error);
  }
}

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

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'No autenticado' });
  res.json(req.user);
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;
