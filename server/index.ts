import express from 'express';
import cors from 'cors';
import { authenticateToken } from './middleware/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import favoritesRouter from './routes/favorites.js';
import reviewsRouter from './routes/reviews.js';
import notificationsRouter from './routes/notifications.js';
import authRouter from './routes/auth.js';
import checkoutRouter from './routes/checkout.js';

// Load .env manually for the server (simple approach)
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
try {
  const envPath = join(__dirname, '..', '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch {
  console.warn('[server] No .env file found, using defaults');
}

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(authenticateToken); // Parse JWT on every request (but don't block)

// Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/checkout', checkoutRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`\n🥩 Servidor Obrador Montes corriendo en http://localhost:${PORT}`);
  console.log(`   Admin: ${process.env.ADMIN_EMAIL || '(no configurado)'}`);
  console.log(`   OpenPay: ${process.env.OPENPAY_MERCHANT_ID ? 'Configurado' : 'No configurado (pedidos directos)'}\n`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
