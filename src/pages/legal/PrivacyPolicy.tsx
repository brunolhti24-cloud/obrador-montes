import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <h1 className="text-4xl font-heading font-bold text-foreground mb-8">Aviso de Privacidad</h1>
      
      <div className="prose prose-slate max-w-none font-body text-muted-foreground space-y-6">
        <p><strong>Última actualización:</strong> {new Date().toLocaleDateString('es-MX')}</p>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">1. Identidad y domicilio del responsable</h2>
          <p>
            Montega (en adelante "nosotros" o "la Empresa"), es responsable del uso y protección de sus datos personales. 
            Este Aviso de Privacidad detalla la forma en que recopilamos, utilizamos y protegemos la información que nos proporciona a través de nuestro sitio web.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">2. Datos personales que recabamos</h2>
          <p>Para llevar a cabo las finalidades descritas en el presente aviso, utilizaremos los siguientes datos personales:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico</li>
            <li>Número telefónico de contacto</li>
            <li>Dirección de entrega</li>
            <li>Datos de facturación (RFC, Razón Social) en caso de solicitar factura</li>
          </ul>
          <p className="mt-4">
            <strong>Importante:</strong> Nosotros <strong>no almacenamos los datos de su tarjeta de crédito o débito</strong>. 
            Toda la información de pago es procesada de forma encriptada y segura a través de nuestro proveedor de pagos autorizado (OpenPay de BBVA), 
            quien cumple con los más altos estándares de seguridad (PCI DSS).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">3. Finalidades del tratamiento de datos</h2>
          <p>Los datos personales que recabamos de usted, los utilizaremos para las siguientes finalidades primarias, que son necesarias para el servicio que solicita:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Creación y gestión de su cuenta de usuario.</li>
            <li>Procesamiento, envío y entrega de sus pedidos de productos cárnicos.</li>
            <li>Contacto para confirmaciones, actualizaciones o incidencias con su pedido.</li>
            <li>Generación de comprobantes fiscales (Facturación electrónica).</li>
            <li>Atención al cliente y soporte.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">4. Transferencia de datos</h2>
          <p>
            Sus datos personales no serán compartidos, vendidos ni transferidos a terceros sin su consentimiento, 
            salvo a los proveedores estrictamente necesarios para la operación, como servicios de paquetería para la entrega de su pedido 
            o pasarelas de pago para el procesamiento de transacciones.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">5. Derechos ARCO</h2>
          <p>
            Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). 
            Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); 
            que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); 
            así como oponerse al uso de sus datos personales para fines específicos (Oposición).
          </p>
          <p className="mt-2">
            Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva enviando un correo a nuestro departamento de atención al cliente.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-heading font-bold text-foreground mt-8 mb-4">6. Cambios al Aviso de Privacidad</h2>
          <p>
            El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones derivadas de nuevos requerimientos legales; 
            de nuestras propias necesidades por los productos o servicios que ofrecemos; de nuestras prácticas de privacidad; 
            de cambios en nuestro modelo de negocio, o por otras causas.
          </p>
          <p className="mt-2">
            Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir el presente aviso de privacidad, a través de nuestro sitio web.
          </p>
        </section>
      </div>
    </div>
  );
}
