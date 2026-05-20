import { Router } from 'express';
import { db } from '../db.js';
import Openpay from 'openpay';
import { sendOrderConfirmationEmail } from '../utils/mailer.js';

const router = Router();

// Configure Openpay using env vars
// Note: We leave merchant ID empty if not provided yet. It will fail gracefully if missing.
const isProductionMode = process.env.OPENPAY_SANDBOX === 'false';
const openpay = new Openpay(
  process.env.OPENPAY_MERCHANT_ID || 'PENDING_MERCHANT_ID',
  process.env.OPENPAY_PRIVATE_KEY || 'sk_2e484f45d0914eec970e0d6bbc91fce0',
  isProductionMode
);

router.post('/', async (req, res) => {
  try {
    const { items, notes, phone, successUrl, cancelUrl, token_id, device_session_id, customer_name, customer_email } = req.body;
    console.log(`[checkout] Iniciando procesamiento para ${customer_email || 'guest'}. Items: ${items?.length}`);
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No hay productos en el carrito' });
    }
    
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const finalCustomerName = req.user?.name || customer_name || 'Cliente';
    const finalCustomerEmail = req.user?.email || customer_email || 'correo@ejemplo.com';

    // 1. Process OpenPay Charge if a token is provided
    if (token_id && device_session_id) {
      if (process.env.OPENPAY_MERCHANT_ID === undefined) {
        return res.status(400).json({ message: 'El Merchant ID de OpenPay no está configurado en el servidor.' });
      }

      const chargeRequest = {
        source_id: token_id,
        method: 'card',
        amount: total,
        currency: 'MXN',
        description: `Compra en Montega - ${items.length} productos`,
        device_session_id: device_session_id,
        customer: {
          name: finalCustomerName,
          last_name: '',
          phone_number: phone || '4420000000',
          email: finalCustomerEmail,
        }
      };

      try {
        await new Promise((resolve, reject) => {
          openpay.charges.create(chargeRequest, (error, charge) => {
            if (error) reject(error);
            else resolve(charge);
          });
        });
        console.log('[checkout] Cargo en OpenPay exitoso');
      } catch (opError: any) {
        console.error('[checkout] Error de OpenPay:', opError);
        return res.status(400).json({ 
          message: 'Pago rechazado por OpenPay', 
          details: opError.description || opError.message 
        });
      }
    } else {
      // Direct order logic (no payment processor) 
      console.log('[checkout] Procesando pedido directo sin OpenPay');
    }

    console.log('[checkout] Guardando pedido en DynamoDB...');

    // 2. Save order to DynamoDB
    let order: any = null;
    try {
      order = await db.create('orders', {
        items: items.map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name || item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        total,
        status: token_id ? 'pagado' : 'confirmado', // If paid via OpenPay, set to 'pagado'
        notes: notes || '',
        customer_phone: phone || '',
        customer_name: finalCustomerName,
        customer_email: finalCustomerEmail,
      }, req.user?.email || 'guest');
      console.log('✅ Pedido guardado en DB');

      // 2.1 Update stock for each item
      console.log('[checkout] Actualizando inventario...');
      for (const item of items) {
        try {
          const product = await db.getById('products', item.product_id);
          if (product) {
            const currentStock = product.stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            await db.update('products', item.product_id, { 
              stock: newStock,
              in_stock: newStock > 0
            });
          }
        } catch (stockErr: any) {
          console.error(`⚠️ Error actualizando stock para ${item.product_id}:`, stockErr.message);
        }
      }
    } catch (dbError: any) {
      console.error('⚠️ Error al guardar pedido en DB (¿Falta tabla?):', dbError.message);
      // Create a dummy order object for the rest of the flow
      order = { id: 'temp-' + Date.now(), total, items, status: 'confirmado' };
    }

    // 3. Create notification for admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await db.create('notifications', {
          user_email: adminEmail,
          title: token_id ? '🛒 Nuevo pedido pagado' : '🛒 Nuevo pedido',
          message: `Pedido de $${total.toFixed(0)} MXN con ${items.length} producto(s)`,
          type: 'order_status',
          order_id: order.id,
          read: false,
        }, 'system');
      }
    } catch (notifError: any) {
      console.error('⚠️ Error al crear notificación:', notifError.message);
    }

    // 4. Send confirmation email to customer
    try {
      await sendOrderConfirmationEmail(finalCustomerEmail, order);
    } catch (emailError: any) {
      console.error('⚠️ Error al enviar correo:', emailError.message);
    }

    const redirectUrl = successUrl || '/pedidos/exito';
    console.log('✅ Checkout finalizado con éxito');
    res.json({ data: { url: redirectUrl, orderId: order.id, paid: !!token_id } });
  } catch (error: any) {
    console.error('[checkout] Error general:', error);
    res.status(500).json({ message: 'Error al procesar el pedido', details: error.message });
  }
});

export default router;
