import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const generateOrderTicket = (order) => {
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, 200] // Thermal printer format (80mm)
  });

  const margin = 5;
  const width = 70;
  let y = 10;

  // Header - Logo Placeholder/Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(183, 28, 28); // #b71c1c
  doc.text('MONTEGA', 40, y, { align: 'center' });
  
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('CARNICERÍA PREMIUM', 40, y, { align: 'center' });
  
  y += 10;
  doc.setDrawColor(200);
  doc.line(margin, y, margin + width, y);
  
  // Order Info
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0);
  doc.text(`TICKET DE COMPRA #${order.id?.slice(-6).toUpperCase()}`, margin, y);
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Fecha: ${format(new Date(order.created_date), "dd/MM/yyyy HH:mm", { locale: es })}`, margin, y);
  
  y += 4;
  doc.text(`Cliente: ${order.customer_name || 'Anonimo'}`, margin, y);
  
  y += 8;
  doc.line(margin, y, margin + width, y);
  
  // Items Header
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTO', margin, y);
  doc.text('CANT', 45, y, { align: 'right' });
  doc.text('TOTAL', margin + width, y, { align: 'right' });
  
  y += 4;
  doc.line(margin, y, margin + width, y);
  
  // Items List
  y += 6;
  doc.setFont('helvetica', 'normal');
  order.items?.forEach(item => {
    // Wrap text if product name is too long
    const name = item.product_name || 'Producto';
    const splitName = doc.splitTextToSize(name, 35);
    
    doc.text(splitName, margin, y);
    doc.text(`${item.quantity} kg`, 45, y, { align: 'right' });
    doc.text(`$${(item.price * item.quantity).toFixed(0)}`, margin + width, y, { align: 'right' });
    
    y += (splitName.length * 4) + 2;
    
    if (y > 180) { // Add new page if needed
      doc.addPage();
      y = 10;
    }
  });
  
  // Totals
  y += 2;
  doc.line(margin, y, margin + width, y);
  
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', margin, y);
  doc.setFontSize(14);
  doc.text(`$${order.total?.toFixed(0)} MXN`, margin + width, y, { align: 'right' });
  
  // Footer
  y += 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  doc.text('¡Gracias por su preferencia!', 40, y, { align: 'center' });
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('Montega - Calidad que se nota', 40, y, { align: 'center' });

  // Save the PDF
  doc.save(`Ticket_ObradorMontes_${order.id?.slice(-6).toUpperCase()}.pdf`);
};
