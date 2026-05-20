import React from 'react';

export default function Refunds() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-4xl font-heading font-bold text-foreground mb-8">Política de Reembolsos y Devoluciones</h1>
      
      <div className="prose prose-slate max-w-none font-body text-muted-foreground space-y-6">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX')}</p>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl my-6">
          <p className="text-amber-800 font-bold m-0">
            Naturaleza del Producto: Al tratar con productos cárnicos frescos y perecederos, nuestras políticas de devolución son estrictas para garantizar la inocuidad y salud de todos nuestros clientes.
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">1. Cancelaciones antes del envío</h2>
          <p>
            Usted puede cancelar su pedido y recibir un reembolso completo <strong>siempre y cuando el pedido aún se encuentre en estado "Pendiente" o "Confirmado"</strong> 
            y no haya entrado a la fase de preparación o corte.
          </p>
          <p>
            Para solicitar una cancelación, debe comunicarse inmediatamente a nuestros teléfonos de atención al cliente. 
            Una vez que la carne ha sido cortada o empaquetada según sus especificaciones, la cancelación ya no será posible.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">2. Devoluciones de Producto</h2>
          <p>
            Por razones de sanidad e higiene (Regulación Sanitaria de la COFEPRIS para manejo de perecederos), <strong>no aceptamos devoluciones físicas de carne fresca o congelada</strong> una vez que ha sido entregada y aceptada por el cliente o la persona en el domicilio.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">3. Casos aplicables para Reembolso o Reposición</h2>
          <p>Procederemos a una reposición de producto o un reembolso (parcial o total) únicamente en los siguientes escenarios:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Producto Incorrecto:</strong> Si recibió un corte diferente al que solicitó en su orden.</li>
            <li><strong>Calidad Comprometida:</strong> Si el producto entregado presenta características inusuales de olor o color al momento de abrir el paquete, que indiquen pérdida de cadena de frío antes de la entrega.</li>
            <li><strong>Faltantes:</strong> Si su orden llegó incompleta.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">4. Procedimiento de Reclamación</h2>
          <p>Para hacer válido un reporte por las causas anteriores, el cliente debe cumplir con lo siguiente:</p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li><strong>Tiempo límite:</strong> El reporte debe realizarse <strong>dentro de las primeras 2 (dos) horas</strong> posteriores a la hora de recepción del pedido.</li>
            <li><strong>Evidencia:</strong> Enviar evidencia fotográfica clara del producto empacado (mostrando etiqueta) y/o el motivo de la queja a nuestro correo de soporte o número de WhatsApp.</li>
            <li><strong>Conservación:</strong> Mantener el producto refrigerado o congelado mientras se resuelve la situación.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">5. Tiempos de Reembolso</h2>
          <p>
            Si el reembolso es aprobado y se realizó mediante tarjeta de crédito/débito a través de OpenPay, 
            el tiempo para que el dinero se refleje en su cuenta depende estrictamente de su banco emisor, y 
            puede tardar de <strong>5 a 15 días hábiles</strong>.
          </p>
          <p>
            En algunos casos, podemos ofrecer "Saldo a Favor" o cupones para compras futuras, lo cual se aplica de manera inmediata.
          </p>
        </section>
      </div>
    </div>
  );
}
