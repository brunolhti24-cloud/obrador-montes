import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CartItem from '@/components/cart/CartItem';

export default function Cart() {
  const { items, totalPrice, clearCart } = useCart();
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // OpenPay Card Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('');
  const [cardExpYear, setCardExpYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const handleOrder = async () => {
    if (items.length === 0) return;
    if (!window.OpenPay) {
      toast.error('Error: OpenPay no está cargado. Recarga la página.');
      return;
    }

    // Inicializar OpenPay
    window.OpenPay.setId('mrjlulyspa4a4yrehfk7');
    window.OpenPay.setApiKey('pk_90b7ab550ec24f44a68d6dbebe682c1a');
    window.OpenPay.setSandboxMode(true);

    if (!cardName || !cardNumber || !cardExpMonth || !cardExpYear || !cardCvv) {
      toast.error('Por favor completa todos los datos de la tarjeta.');
      return;
    }

    setLoading(true);
    toast.info("1/3 Iniciando conexión segura...");

    try {
      // 1. Generar Device Session ID
      const deviceSessionId = window.OpenPay.deviceData.setup();
      toast.info("2/3 Dispositivo validado, creando token...");

      // 2. Crear Token de Tarjeta
      window.OpenPay.token.create({
        "holder_name": cardName,
        "card_number": cardNumber.replace(/\s/g, ''),
        "expiration_month": cardExpMonth,
        "expiration_year": cardExpYear,
        "cvv2": cardCvv
      }, async (response: any) => {
        // Exito: Token Creado
        toast.success("3/3 Token generado, procesando cobro...");
        const tokenId = response.data.id;
        
        try {
          const origin = window.location.origin;
          const res = await base44.functions.invoke('createCheckout', {
            items,
            notes,
            phone,
            token_id: tokenId,
            device_session_id: deviceSessionId,
            customer_name: cardName,
            successUrl: origin + '/pedidos/exito',
            cancelUrl: origin + '/carrito',
          });

          setLoading(false);
          if (res.data?.url) {
            toast.success("¡Pago exitoso!");
            clearCart();
            window.location.href = res.data.url;
          } else {
            toast.error('Error al procesar el pago en el servidor.');
          }
        } catch (err) {
          console.error(err);
          setLoading(false);
          toast.error('Hubo un error en el servidor procesando el cobro.');
        }

      }, (error: any) => {
        // Error: Tarjeta declinada o inválida
        setLoading(false);
        console.error("OpenPay Error:", error);
        toast.error(`Error en tarjeta: ${error.data ? error.data.description : 'Datos inválidos'}`);
      });
    } catch (err: any) {
      setLoading(false);
      console.error("Error sincronizando OpenPay:", err);
      toast.error("Error validando dispositivo. Intenta de nuevo.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl font-bold">Tu carrito está vacío</h2>
        <p className="text-muted-foreground text-sm font-body">Agrega productos para comenzar</p>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ver Catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h1 className="font-heading text-3xl font-bold">Mi Pedido</h1>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:bg-destructive/10 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4 mr-2" />
            Vaciar Carrito
          </Button>
        </div>

        <Card className="glass-panel border-white/5 shadow-2xl">
          <CardContent className="p-2 sm:p-4 divide-y divide-white/5">
            {items.map(item => (
              <CartItem key={item.product_id} item={item} />
            ))}
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/5 shadow-2xl">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-lg font-heading text-foreground">Detalles de Envío</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div>
              <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-2 block">Teléfono de contacto</Label>
              <Input
                placeholder="Ej: 55 1234 5678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-foreground h-12 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-2 block">Notas Especiales</Label>
              <Textarea
                placeholder="Instrucciones de corte, preferencias, etc."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="bg-black/50 border-white/10 focus-visible:ring-accent font-body resize-none rounded-xl"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Section */}
      <div className="space-y-6">
        <Card className="glass-panel border-accent/30 shadow-[0_0_30px_rgba(252,246,186,0.05)] overflow-hidden" id="payment-form">
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728)' }} />
          <CardHeader className="bg-black/40 border-b border-white/5 pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-heading flex items-center gold-gradient-text">
                <CreditCard className="w-6 h-6 mr-3 text-accent" />
                Pago Seguro
              </CardTitle>
              <Lock className="w-5 h-5 text-accent/50" />
            </div>
            <p className="text-xs text-muted-foreground font-body mt-2">Tus datos están protegidos con encriptación de grado bancario.</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6 bg-black/20">
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-2 block">Nombre en la Tarjeta</Label>
                <Input placeholder="Ej. Juan Pérez" value={cardName} onChange={e => setCardName(e.target.value)} 
                  className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-foreground h-12 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-2 block">Número de Tarjeta</Label>
                <Input placeholder="0000 0000 0000 0000" maxLength={19} value={cardNumber} onChange={e => setCardNumber(e.target.value)} 
                  className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-foreground tracking-widest h-12 rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-2 block">Mes</Label>
                  <Input placeholder="MM" maxLength={2} value={cardExpMonth} onChange={e => setCardExpMonth(e.target.value)} 
                    className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-center h-12 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-2 block">Año</Label>
                  <Input placeholder="AA" maxLength={2} value={cardExpYear} onChange={e => setCardExpYear(e.target.value)} 
                    className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-center h-12 rounded-xl" />
                </div>
                <div>
                  <Label className="text-xs font-body uppercase tracking-widest text-muted-foreground mb-2 block">CVV</Label>
                  <Input placeholder="•••" maxLength={4} type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value)} 
                    className="bg-black/50 border-white/10 focus-visible:ring-accent font-body text-center tracking-widest h-12 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 mt-8">
              <div className="flex justify-between items-end mb-6">
                <span className="text-sm text-muted-foreground font-body uppercase tracking-widest">Total a pagar</span>
                <div className="text-right">
                  <span className="font-bold font-heading text-4xl text-foreground">${totalPrice.toFixed(0)}</span>
                  <span className="text-sm text-muted-foreground ml-2">MXN</span>
                </div>
              </div>
              
              <Button
                className="w-full h-16 font-body font-bold text-black text-lg rounded-full shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-3" />
                    Autorizar Pago
                  </>
                )}
              </Button>
              
              <div className="mt-6 flex flex-col items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="text-[10px] font-body uppercase tracking-widest">Plataforma Asegurada Por</span>
                <img src="https://www.openpay.mx/docs/img/OpenPay-logo-d.png" alt="OpenPay" className="h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}