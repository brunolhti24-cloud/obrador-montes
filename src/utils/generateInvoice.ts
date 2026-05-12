import { jsPDF } from 'jspdf';

export function generateInvoice(order: any, user: any) {
  try {
    const doc = new jsPDF();

    // --- Encabezado ---
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(191, 149, 63);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('OBRADOR MONTES', 105, 20, { align: 'center' });

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Carnes de Alta Calidad', 105, 28, { align: 'center' });

    // --- Información de la Factura ---
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE COMPRA', 20, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    const orderId = order.id ? order.id.substring(0, 8).toUpperCase() : '0001';
    doc.text(`N\u00b0 de Factura: OM-${orderId}`, 20, 65);

    const fecha = order.created_date
      ? new Date(order.created_date).toLocaleDateString('es-MX')
      : new Date().toLocaleDateString('es-MX');
    doc.text(`Fecha: ${fecha}`, 20, 72);

    const status = order.status || 'Pendiente';
    doc.text(`Estado: ${String(status).toUpperCase()}`, 20, 79);

    // Información del Cliente
    doc.text('Datos del Cliente:', 130, 65);
    doc.setFont('helvetica', 'bold');
    doc.text(user?.name || order.customer_name || 'Cliente', 130, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(user?.email || order.created_by || '', 130, 79);

    // --- Tabla de Productos ---
    let y = 100;

    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 6, 170, 10, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CANT', 25, y);
    doc.text('DESCRIPCION', 50, y);
    doc.text('PRECIO', 140, y);
    doc.text('TOTAL', 170, y);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);

    let subtotal = 0;

    const items = order.items || [];
    items.forEach((item: any) => {
      // Support both field name formats
      const qty = item.quantity || 1;
      const name = item.product_name || item.name || 'Producto';
      const price = item.price || (item.subtotal ? item.subtotal / qty : 0);
      const itemTotal = item.subtotal || (price * qty);
      subtotal += itemTotal;

      doc.text(`${qty}`, 25, y);
      doc.text(String(name).substring(0, 40), 50, y);
      doc.text(`$${Number(price).toFixed(2)}`, 140, y);
      doc.text(`$${Number(itemTotal).toFixed(2)}`, 170, y);

      doc.setDrawColor(220, 220, 220);
      doc.line(20, y + 3, 190, y + 3);

      y += 10;
    });

    // Use order.total if available, otherwise use calculated subtotal
    const total = order.total || subtotal;

    // --- Totales ---
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('SUBTOTAL:', 140, y);
    doc.text(`$${Number(total).toFixed(2)}`, 170, y);

    y += 8;
    doc.text('TOTAL:', 140, y);
    doc.setTextColor(191, 149, 63);
    doc.text(`$${Number(total).toFixed(2)} MXN`, 170, y);

    // --- Pie de página ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(20, 20, 20);
    doc.rect(0, pageHeight - 20, 210, 20, 'F');

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Gracias por su preferencia.', 105, pageHeight - 12, { align: 'center' });
    doc.text('Obrador Montes - La Excelencia en Carnes', 105, pageHeight - 7, { align: 'center' });

    // Descargar PDF - método forzado
    const filename = `Factura_OM_${orderId}.pdf`;
    console.log('Generating PDF:', filename);
    
    const arrayBuffer = doc.output('arraybuffer');
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    
    // Small delay to ensure browser processes it
    setTimeout(() => {
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 500);
    }, 100);
    
    console.log('PDF download triggered');
  } catch (err) {
    console.error('Error generando factura:', err);
    throw err;
  }
}
