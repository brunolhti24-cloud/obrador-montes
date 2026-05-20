import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 12px; padding: 40px 30px;">
          <h1 style="color: #FCF6BA; font-size: 24px; margin-bottom: 10px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase;">Montega</h1>
          <p style="color: #999; font-size: 14px; margin-bottom: 30px; letter-spacing: 1px;">VERIFICACIÓN DE IDENTIDAD</p>
          
          <p style="font-size: 16px; color: #ddd; margin-bottom: 25px; line-height: 1.5;">Hemos recibido una solicitud de registro para esta dirección de correo electrónico.</p>
          
          <div style="background: linear-gradient(135deg, #2a2a2a, #1a1a1a); border: 1px solid #BF953F; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="font-size: 12px; color: #BF953F; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">TU CÓDIGO DE ACCESO</p>
            <p style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; margin: 0;">${code}</p>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.5;">Ingresa este código en la aplicación para activar tu cuenta.<br>Si no solicitaste esto, puedes ignorar este mensaje.</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px;">© ${new Date().getFullYear()} Montega. Carnes de Alta Calidad.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `Tu código de verificación: ${code}`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de verificación enviado a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar correo de verificación:', error);
  }
}

export async function sendOrderConfirmationEmail(email: string, order: any) {
  try {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #ddd;">${item.quantity}x ${item.product_name}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #FCF6BA; text-align: right;">$${item.subtotal.toFixed(0)}</td>
      </tr>
    `).join('');

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #FCF6BA; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">Montega</h1>
            <p style="color: #999; font-size: 12px; margin-top: 10px; letter-spacing: 2px;">COMPRA EXITOSA</p>
          </div>
          
          <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 20px; font-weight: bold;">¡Gracias por tu pedido, ${order.customer_name}!</h2>
          <p style="font-size: 16px; color: #bbb; line-height: 1.6; margin-bottom: 30px;">
            Tu pedido ha sido recibido y está siendo procesado por nuestro equipo de expertos carniceros. 
            A continuación encontrarás los detalles de tu compra:
          </p>
          
          <div style="background-color: #1a1a1a; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #2a2a2a;">
            <p style="font-size: 12px; color: #BF953F; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">Resumen del Pedido #${order.id.slice(-6).toUpperCase()}</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 20px 0 0 0; font-size: 18px; font-weight: bold; color: #ffffff;">TOTAL</td>
                <td style="padding: 20px 0 0 0; font-size: 24px; font-weight: bold; color: #FCF6BA; text-align: right;">$${order.total.toFixed(0)} <span style="font-size: 12px; color: #999;">MXN</span></td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/pedidos" style="background: linear-gradient(135deg, #FCF6BA, #B38728); color: #000; padding: 18px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(179, 135, 40, 0.3);">
              Ver mis pedidos y descargar PDF
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            Te notificaremos cuando tu pedido esté listo para ser entregado. <br>
            Si tienes alguna duda, puedes contactarnos por WhatsApp al <strong>+52 (442) 123 4567</strong>.
          </p>
          
          <div style="border-top: 1px solid #333; padding-top: 25px; text-align: center;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 0;">© ${new Date().getFullYear()} Montega. Carnes de Alta Calidad.</p>
            <p style="font-size: 9px; color: #444; margin-top: 5px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `¡Confirmación de tu pedido #${order.id.slice(-6).toUpperCase()}!`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de confirmación enviado a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar correo de confirmación:', error);
  }
}

export async function sendWholesaleInquiryEmail(adminEmail: string, inquiry: any) {
  try {
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; padding: 10px 20px; background-color: #000; border-radius: 8px; color: #FCF6BA; font-weight: bold; letter-spacing: 2px;">
              MAYOREO MONTEGA
            </div>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 10px;">Nueva Solicitud de Cotización</h2>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 25px;">Se ha recibido un nuevo interés por parte de un negocio para compra por volumen.</p>
          
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #64748b; width: 150px;">Negocio:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${inquiry.businessName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Giro:</td>
                <td style="padding: 8px 0; color: #0f172a;">${inquiry.businessType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Contacto:</td>
                <td style="padding: 8px 0; color: #0f172a;">${inquiry.contactName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Teléfono:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${inquiry.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Email:</td>
                <td style="padding: 8px 0; color: #0f172a;">${inquiry.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Volumen Est.:</td>
                <td style="padding: 8px 0; color: #0f172a;">${inquiry.estimatedVolume || 'No especificado'}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Mensaje del Cliente:</p>
            <div style="background-color: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; color: #334155; font-style: italic;">
              ${inquiry.message || 'Sin mensaje adicional.'}
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}" style="background-color: #25D366; color: #fff; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Contactar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega System" <' + process.env.SMTP_USER + '>',
      to: adminEmail,
      subject: `🏢 Interés de Mayoreo: ${inquiry.businessName}`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Notificación de mayoreo enviada al admin`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar notificación de mayoreo:', error);
  }
}

export async function sendPasswordResetEmail(email: string, code: string) {
  try {
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 12px; padding: 40px 30px;">
          <h1 style="color: #FCF6BA; font-size: 24px; margin-bottom: 10px; font-weight: normal; letter-spacing: 2px; text-transform: uppercase;">Montega</h1>
          <p style="color: #999; font-size: 14px; margin-bottom: 30px; letter-spacing: 1px;">RECUPERACIÓN DE CONTRASEÑA</p>
          
          <p style="font-size: 16px; color: #ddd; margin-bottom: 25px; line-height: 1.5;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
          
          <div style="background: linear-gradient(135deg, #2a2a2a, #1a1a1a); border: 1px solid #BF953F; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <p style="font-size: 12px; color: #BF953F; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">CÓDIGO DE RESTABLECIMIENTO</p>
            <p style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px; margin: 0;">${code}</p>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.5;">Ingresa este código en la aplicación para crear una nueva contraseña.<br>Si no solicitaste esto, puedes ignorar este mensaje.</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px;">© ${new Date().getFullYear()} Montega. Carnes de Alta Calidad.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `Código de recuperación: ${code}`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de recuperación enviado a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar correo de recuperación:', error);
  }
}

export async function sendWholesaleApprovalEmail(email: string, businessName: string) {
  try {
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #BF953F; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(191, 149, 63, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FCF6BA; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">Montega</h1>
            <p style="color: #BF953F; font-size: 12px; margin-top: 10px; letter-spacing: 4px;">SOCIOS MAYORISTAS</p>
          </div>
          
          <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 20px; font-weight: bold;">¡Felicidades, ${businessName}!</h2>
          
          <p style="font-size: 16px; color: #bbb; line-height: 1.6; margin-bottom: 25px;">
            Tu solicitud para convertirte en cliente mayorista ha sido <strong>APROBADA</strong>. 
            A partir de este momento, formas parte de nuestra red exclusiva de socios comerciales.
          </p>
          
          <div style="background-color: #1a1a1a; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #333;">
            <p style="font-size: 14px; color: #FCF6BA; margin: 0 0 10px 0; font-weight: bold;">Beneficios Activados:</p>
            <ul style="text-align: left; color: #ddd; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Precios preferenciales automáticos en todo el catálogo.</li>
              <li>Acceso prioritario a cortes premium y stock limitado.</li>
              <li>Atención personalizada y logística de envío optimizada.</li>
            </ul>
          </div>

          <p style="font-size: 15px; color: #ffffff; font-weight: bold; margin-bottom: 30px;">
            ¡Ya puedes empezar a comprar! Solo inicia sesión con tu cuenta y verás los descuentos aplicados automáticamente en tu carrito.
          </p>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/login" style="background: linear-gradient(135deg, #FCF6BA, #B38728); color: #000; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(179, 135, 40, 0.4);">
              Ir a la Tienda
            </a>
          </div>
          
          <div style="border-top: 1px solid #333; padding-top: 25px; text-align: center;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 0;">© ${new Date().getFullYear()} Montega. Carnes de Alta Calidad.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega Socios" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `¡Bienvenido al programa de Mayoreo, ${businessName}!`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de aprobación de mayoreo enviado a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar correo de aprobación:', error);
  }
}

export async function sendOrderInPreparationEmail(email: string, order: any) {
  try {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #ddd;">${item.quantity}x ${item.product_name}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #FCF6BA; text-align: right;">$${item.subtotal.toFixed(0)}</td>
      </tr>
    `).join('');

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #FCF6BA; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">Montega</h1>
            <p style="color: #BF953F; font-size: 12px; margin-top: 10px; letter-spacing: 2px;">PEDIDO EN PREPARACIÓN</p>
          </div>
          
          <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 20px; font-weight: bold;">¡Buenas noticias, ${order.customer_name || 'Cliente'}!</h2>
          <p style="font-size: 16px; color: #bbb; line-height: 1.6; margin-bottom: 30px;">
            Nuestro equipo de maestros carniceros ya está seleccionando y preparando los mejores cortes para tu pedido. 
            Estamos cuidando cada detalle para asegurar que recibas la máxima calidad y frescura.
          </p>
          
          <div style="background-color: #1a1a1a; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #2a2a2a;">
            <p style="font-size: 12px; color: #BF953F; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">Preparando Pedido #${order.id.slice(-6).toUpperCase()}</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 20px 0 0 0; font-size: 18px; font-weight: bold; color: #ffffff;">TOTAL</td>
                <td style="padding: 20px 0 0 0; font-size: 24px; font-weight: bold; color: #FCF6BA; text-align: right;">$${order.total.toFixed(0)} <span style="font-size: 12px; color: #999;">MXN</span></td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/pedidos" style="background: linear-gradient(135deg, #FCF6BA, #B38728); color: #000; padding: 18px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(179, 135, 40, 0.3);">
              Ver Estado de mi Pedido
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            Te enviaremos otra notificación en cuanto tu pedido esté listo para ser recogido. <br>
            Si tienes alguna duda o deseas agregar algo más, contáctanos por WhatsApp al <strong>+52 (442) 123 4567</strong>.
          </p>
          
          <div style="border-top: 1px solid #333; padding-top: 25px; text-align: center;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 0;">© ${new Date().getFullYear()} Montega. Carnes de Alta Calidad.</p>
            <p style="font-size: 9px; color: #444; margin-top: 5px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `🥩 ¡Tu pedido #${order.id.slice(-6).toUpperCase()} está en preparación!`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de preparación enviado a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar correo de preparación:', error);
  }
}

export async function sendOrderReadyEmail(email: string, order: any) {
  try {
    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #ddd;">${item.quantity}x ${item.product_name}</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #333; color: #FCF6BA; text-align: right;">$${item.subtotal.toFixed(0)}</td>
      </tr>
    `).join('');

    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #FCF6BA; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">Montega</h1>
            <p style="color: #BF953F; font-size: 12px; margin-top: 10px; letter-spacing: 2px;">PEDIDO LISTO PARA RECOGER</p>
          </div>
          
          <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 20px; font-weight: bold;">¡Tu pedido está listo, ${order.customer_name || 'Cliente'}! 🥩🎉</h2>
          <p style="font-size: 16px; color: #bbb; line-height: 1.6; margin-bottom: 30px;">
            ¡Excelentes noticias! Nuestro equipo de maestros carniceros ha terminado de preparar tu pedido. 
            Todos tus productos han sido empacados cuidadosamente y se encuentran refrigerados a la temperatura ideal, listos para que pases por ellos.
          </p>
          
          <div style="background-color: #1a1a1a; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #2a2a2a;">
            <p style="font-size: 12px; color: #BF953F; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">Resumen del Pedido #${order.id.slice(-6).toUpperCase()}</p>
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
              <tr>
                <td style="padding: 20px 0 0 0; font-size: 18px; font-weight: bold; color: #ffffff;">TOTAL</td>
                <td style="padding: 20px 0 0 0; font-size: 24px; font-weight: bold; color: #FCF6BA; text-align: right;">$${order.total.toFixed(0)} <span style="font-size: 12px; color: #999;">MXN</span></td>
              </tr>
            </table>
          </div>

          <div style="background-color: #211c12; border: 1px solid #BF953F; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #FCF6BA; font-weight: bold;">📍 ¿Dónde recoger?</p>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #ddd; line-height: 1.5;">
              Visítanos en nuestra sucursal de Montega. Recuerda traer tu número de pedido o tu ticket en PDF descargado para agilizar la entrega.
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/pedidos" style="background: linear-gradient(135deg, #FCF6BA, #B38728); color: #000; padding: 18px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(179, 135, 40, 0.3);">
              Ver Recibo y Detalles
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; line-height: 1.6; text-align: center; margin-bottom: 30px;">
            ¡Te esperamos! Si tienes cualquier duda sobre la ubicación o el horario, escríbenos por WhatsApp al <strong>+52 (442) 123 4567</strong>.
          </p>
          
          <div style="border-top: 1px solid #333; padding-top: 25px; text-align: center;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 0;">© ${new Date().getFullYear()} Montega. Carnes de Alta Calidad.</p>
            <p style="font-size: 9px; color: #444; margin-top: 5px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `🛒 ¡Tu pedido #${order.id.slice(-6).toUpperCase()} está listo para recoger!`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de pedido listo enviado a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar correo de pedido listo:', error);
  }
}

export async function sendOrderDeliveredEmail(email: string, order: any) {
  try {
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #FCF6BA; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">Montega</h1>
            <p style="color: #10b981; font-size: 12px; margin-top: 10px; letter-spacing: 2px;">PEDIDO ENTREGADO CON ÉXITO</p>
          </div>
          
          <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 20px; font-weight: bold;">¡Gracias por tu compra, ${order.customer_name || 'Cliente'}! 🍖</h2>
          <p style="font-size: 16px; color: #bbb; line-height: 1.6; margin-bottom: 30px;">
            Tu pedido con folio <strong>#${order.id.slice(-6).toUpperCase()}</strong> ha sido entregado exitosamente. 
            Esperamos de todo corazón que disfrutes nuestros cortes premium y que la calidad de nuestros productos haya cumplido con tus expectativas más altas.
          </p>
          
          <div style="background-color: #1a1a1a; border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #2a2a2a; text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #FCF6BA; font-weight: bold;">¿Qué te pareció nuestro servicio?</p>
            <p style="margin: 10px 0 20px 0; font-size: 13px; color: #888;">Tu opinión es de gran valor para nosotros. Nos ayuda a seguir seleccionando la mejor calidad.</p>
            <a href="${process.env.APP_URL || 'http://localhost:5173'}/catalogo" style="background: transparent; color: #FCF6BA; border: 1px solid #FCF6BA; padding: 12px 25px; border-radius: 30px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; transition: all 0.3s;">
              Dejar una opinión / Comprar de nuevo
            </a>
          </div>

          <p style="font-size: 14px; color: #888; line-height: 1.6; text-align: center;">
            Siempre es un honor servirte. Nos vemos pronto en tu próxima compra.<br>
            Cualquier duda o comentario, estamos a tus órdenes vía WhatsApp al <strong>+52 (442) 123 4567</strong>.
          </p>
          
          <div style="border-top: 1px solid #333; padding-top: 25px; text-align: center; margin-top: 40px;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 0;">© ${new Date().getFullYear()} Montega. Carnes de Alta Calidad.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `✅ ¡Tu pedido #${order.id.slice(-6).toUpperCase()} ha sido entregado!`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de pedido entregado enviado a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar correo de pedido entregado:', error);
  }
}

export async function sendOrderCancelledEmail(email: string, order: any) {
  try {
    const htmlTemplate = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #141414; border: 1px solid #333; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #FCF6BA; font-size: 28px; margin: 0; font-weight: normal; letter-spacing: 3px; text-transform: uppercase;">Montega</h1>
            <p style="color: #ef4444; font-size: 12px; margin-top: 10px; letter-spacing: 2px;">PEDIDO CANCELADO</p>
          </div>
          
          <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 20px; font-weight: bold;">Notificación de tu Pedido #${order.id.slice(-6).toUpperCase()}</h2>
          <p style="font-size: 16px; color: #bbb; line-height: 1.6; margin-bottom: 30px;">
            Te informamos que tu pedido ha sido **cancelado**. Si esta acción no fue solicitada por ti, o si ocurrió un problema imprevisto con la pasarela de pago, por favor contáctanos de inmediato para dar seguimiento personal.
          </p>
          
          <div style="background-color: #211212; border: 1px solid #ef4444; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0; font-size: 14px; color: #fca5a5; font-weight: bold;">💳 Información sobre Reembolsos:</p>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #ddd; line-height: 1.5;">
              Si realizaste el pago mediante tarjeta bancaria y el cargo fue exitoso en OpenPay, el proceso de reembolso se gestionará de forma manual. Esto suele verse reflejado en tu cuenta de 3 a 5 días hábiles.
            </p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="https://wa.me/524421234567" style="background: #ef4444; color: #fff; padding: 18px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
              Contactar Soporte vía WhatsApp
            </a>
          </div>
          
          <p style="font-size: 13px; color: #666; line-height: 1.6; text-align: center;">
            Lamentamos el inconveniente. Estamos a tu disposición para ayudarte a solucionar cualquier problema técnico con tu compra.
          </p>
          
          <div style="border-top: 1px solid #333; padding-top: 25px; text-align: center; margin-top: 40px;">
            <p style="font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin: 0;">© ${new Date().getFullYear()} Montega. Carnes de Alta Calidad.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: '"Montega" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `❌ Tu pedido #${order.id.slice(-6).toUpperCase()} ha sido cancelado`,
      html: htmlTemplate,
    });
    
    console.log(`✅ [Nodemailer] Correo de pedido cancelado enviado a: ${email}`);
  } catch (error) {
    console.error('❌ [Nodemailer] Error al enviar correo de pedido cancelado:', error);
  }
}

