import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-4xl font-heading font-bold text-foreground mb-8">Términos y Condiciones</h1>
      
      <div className="prose prose-slate max-w-none font-body text-muted-foreground space-y-6">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX')}</p>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar el sitio web de Montega, usted acepta estar sujeto a los siguientes Términos y Condiciones de Uso. 
            Si no está de acuerdo con alguna parte de estos términos, no podrá acceder al servicio ni realizar compras.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">2. Productos y Precios</h2>
          <p>
            Montega se dedica a la venta de cortes de carne fresca y productos relacionados. 
            Debido a la naturaleza de nuestros productos, <strong>los precios se calculan por kilogramo o por pieza</strong> según se especifique en la descripción del producto.
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Los precios mostrados están en Pesos Mexicanos (MXN) e incluyen los impuestos aplicables.</li>
            <li>El peso final del producto puede tener una ligera variación inherente al proceso de corte artesanal. Nos comprometemos a entregar un peso igual o ligeramente superior al pagado, nunca inferior al límite de tolerancia permitido.</li>
            <li>Los precios y la disponibilidad están sujetos a cambios sin previo aviso.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">3. Procesamiento de Pedidos y Entregas</h2>
          <p>
            Los pedidos se procesarán una vez que el pago haya sido confirmado por nuestro procesador (OpenPay).
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Zonas de Cobertura:</strong> Actualmente entregamos solo dentro de nuestra zona de cobertura local. Nos reservamos el derecho de cancelar pedidos fuera de esta zona.</li>
            <li><strong>Horarios de Entrega:</strong> Los pedidos se entregan en las franjas horarias seleccionadas o acordadas con el cliente. En caso de fuerza mayor (tráfico extremo, clima), la entrega puede retrasarse, lo cual será notificado al cliente.</li>
            <li><strong>Recepción:</strong> Al ser un producto perecedero, es indispensable que haya alguien en el domicilio para recibir el paquete en el horario establecido. Montega no se hace responsable por el estado del producto si no hay quien lo reciba.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">4. Política de Pagos</h2>
          <p>
            Aceptamos pagos a través de tarjetas de crédito y débito procesadas por OpenPay. 
            Al proporcionar una tarjeta de crédito, usted garantiza que está autorizado a usarla y autoriza a OpenPay a cargar el importe total de la compra.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">5. Propiedad Intelectual</h2>
          <p>
            Todo el contenido presente en este sitio (logos, textos, imágenes de productos, diseño) es propiedad de Montega y está protegido por las leyes de propiedad intelectual. 
            Queda estrictamente prohibida su reproducción sin autorización.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">6. Modificaciones al Servicio</h2>
          <p>
            Nos reservamos el derecho de modificar o discontinuar el Servicio (o cualquier parte del contenido) en cualquier momento y sin previo aviso. 
            No seremos responsables ante usted ni ante ningún tercero por ninguna modificación, cambio de precio, suspensión o discontinuidad del Servicio.
          </p>
        </section>
      </div>
    </div>
  );
}
