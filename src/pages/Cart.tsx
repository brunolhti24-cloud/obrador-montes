import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, Lock, BadgeCheck, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import CartItem from '@/components/cart/CartItem';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';

export default function Cart() {
  const { items, totalPrice, clearCart, totalWeight, isWholesaleEligible } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();
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

  const openpaySandbox = import.meta.env.VITE_OPENPAY_SANDBOX !== 'false';

  const handleOrder = async () => {
    if (items.length === 0) return;
    if (!window.OpenPay) {
      toast.error('Error: OpenPay no está cargado. Recarga la página.');
      return;
    }

    // 1. VERIFICAR STOCK ANTES DE PAGAR
    setLoading(true);
    try {
      toast.info("Verificando disponibilidad de inventario...");
      for (const item of items) {
        let p;
        try {
          p = await base44.entities.Product.get(item.product_id);
        } catch (e) {
          console.error("Product not found:", item.product_id);
          toast.error(`No se encontró el producto: ${item.product_name}. Por favor quítalo del carrito.`);
          setLoading(false);
          return;
        }

        const currentStock = p?.stock ?? 0;
        if (currentStock < item.quantity) {
          toast.error(`Stock insuficiente para ${p?.name || 'producto'}. Solo quedan ${currentStock}kg.`);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Error verificando stock:", err);
      toast.error("Error de conexión al verificar inventario. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    // Inicializar OpenPay
    const openpayMerchantId = import.meta.env.VITE_OPENPAY_MERCHANT_ID || 'mrjlulyspa4a4yrehfk7';
    const openpayPublicKey = import.meta.env.VITE_OPENPAY_PUBLIC_KEY || 'pk_90b7ab550ec24f44a68d6dbebe682c1a';

    window.OpenPay.setId(openpayMerchantId);
    window.OpenPay.setApiKey(openpayPublicKey);
    window.OpenPay.setSandboxMode(openpaySandbox);

    if (!cardName || !cardNumber || !cardExpMonth || !cardExpYear || !cardCvv) {
      toast.error('Por favor completa todos los datos de la tarjeta.');
      setLoading(false);
      return;
    }

    toast.info("Iniciando conexión segura con OpenPay...");

    try {
      const deviceSessionId = window.OpenPay.deviceData.setup();
      
      window.OpenPay.token.create({
        "holder_name": cardName,
        "card_number": cardNumber.replace(/\s/g, ''),
        "expiration_month": cardExpMonth,
        "expiration_year": cardExpYear,
        "cvv2": cardCvv
      }, async (response: any) => {
        const tokenId = response.data.id;
        
        try {
          const origin = window.location.origin;
          const mappedItems = items.map(i => ({
            ...i,
            price: isWholesaleEligible ? i.wholesale_price : i.base_price
          }));

          const res = await base44.functions.invoke('createCheckout', {
            items: mappedItems,
            notes,
            phone,
            token_id: tokenId,
            device_session_id: deviceSessionId,
            customer_name: cardName,
            successUrl: origin + '/pedidos/exito',
            cancelUrl: origin + '/carrito',
          });

          if (res.data?.url) {
            toast.success("¡Pago exitoso!");
            clearCart();
            window.location.href = res.data.url;
          } else {
            setLoading(false);
            toast.error('Error al procesar el pago en el servidor.');
          }
        } catch (err: any) {
          console.error("Checkout error:", err);
          setLoading(false);
          const errorMsg = err.data?.message || err.message || 'Error procesando el cobro.';
          const details = err.data?.details ? `: ${err.data.details}` : '';
          toast.error(`${errorMsg}${details}`);
        }

      }, (error: any) => {
        setLoading(false);
        toast.error(`Error en tarjeta: ${error.data ? error.data.description : 'Datos inválidos'}`);
      });
    } catch (err: any) {
      setLoading(false);
      toast.error("Error validando dispositivo.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-xl font-bold">{t('cart.empty')}</h2>
        <p className="text-muted-foreground text-sm font-body">{t('cart.emptyDesc')}</p>
        <Link to="/">
          <Button className="bg-primary text-primary-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('cart.viewCatalog')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pb-20 px-4">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">{t('cart.title')}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-all rounded-full">
            <Trash2 className="w-4 h-4 mr-2" />
            {t('cart.clear')}
          </Button>
        </div>

        {isWholesaleEligible ? (
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-3xl mb-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-heading font-bold text-amber-900 text-sm">{t('cart.wholesale.benefitTitle')}</p>
              <p className="text-xs text-amber-700 font-body">{t('cart.wholesale.benefitDesc')}</p>
            </div>
          </div>
        ) : (user?.role === 'wholesale' && items.length > 0) && (
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl mb-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-heading font-bold text-slate-700 text-sm">{t('cart.wholesale.goalTitle')}</p>
              <p className="text-xs text-slate-500 font-body">{t('cart.wholesale.goalDesc1')}<span className="font-bold text-slate-900">{(40 - totalWeight).toFixed(1)} kilos</span>{t('cart.wholesale.goalDesc2')}</p>
              <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (totalWeight / 40) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="p-4 sm:p-6 divide-y divide-border">
            {items.map(item => (
              <CartItem key={item.product_id} item={item} />
            ))}
          </div>
        </div>

        <Card className="bg-white border-border shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 border-b border-border bg-secondary/30">
            <CardTitle className="text-lg font-heading text-foreground font-bold">{t('cart.delivery.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <Label className="text-[10px] font-body uppercase tracking-[0.2em] text-foreground/60 font-bold mb-2.5 block">{t('cart.delivery.phone')}</Label>
              <Input
                placeholder={t('cart.delivery.phonePlaceholder')}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="bg-secondary/50 border-border focus-visible:ring-primary font-body text-foreground h-12 rounded-xl shadow-sm"
              />
            </div>
            <div>
              <Label className="text-[10px] font-body uppercase tracking-[0.2em] text-foreground/60 font-bold mb-2.5 block">{t('cart.delivery.notes')}</Label>
              <Textarea
                placeholder={t('cart.delivery.notesPlaceholder')}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="bg-secondary/50 border-border focus-visible:ring-primary font-body resize-none rounded-xl shadow-sm"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Section */}
      <div className="space-y-8">
        <Card className="bg-white border-primary/20 shadow-2xl rounded-3xl overflow-hidden relative" id="payment-form">
          <div className="h-1.5 w-full bg-primary" />
          
          <CardHeader className="bg-secondary/30 border-b border-border pb-8 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-heading flex items-center text-foreground font-bold">
                  <CreditCard className="w-6 h-6 mr-3 text-primary" />
                  {t('cart.payment.title')}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-body mt-2">{t('cart.payment.desc')}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
                <Lock className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8 space-y-8">
            {/* Sandbox Mode Alert & Auto-fill */}
            {openpaySandbox && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-xs font-bold font-body uppercase tracking-wider">{t('cart.payment.sandbox')}</p>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">
                  {t('cart.payment.sandboxDesc')}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCardName("Juan Pérez");
                      setCardNumber("4111 1111 1111 1111");
                      setCardExpMonth("12");
                      setCardExpYear("29");
                      setCardCvv("123");
                      toast.success("Tarjeta Visa de pruebas cargada");
                    }}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                  >
                    💳 Visa (Aprobado)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCardName("Juan Pérez");
                      setCardNumber("5123 4567 8901 2346");
                      setCardExpMonth("12");
                      setCardExpYear("29");
                      setCardCvv("123");
                      toast.success("Tarjeta Mastercard de pruebas cargada");
                    }}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                  >
                    💳 Mastercard (Aprobado)
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <Label className="text-[10px] font-body uppercase tracking-[0.2em] text-foreground/60 font-bold mb-2.5 block">{t('cart.payment.cardName')}</Label>
                <Input 
                  placeholder={t('cart.payment.cardNamePlaceholder')}
                  value={cardName} 
                  onChange={e => setCardName(e.target.value)} 
                  className="bg-secondary/50 border-border focus-visible:ring-primary font-body text-foreground h-12 rounded-xl shadow-sm" 
                />
              </div>
              <div>
                <Label className="text-[10px] font-body uppercase tracking-[0.2em] text-foreground/60 font-bold mb-2.5 block">{t('cart.payment.cardNumber')}</Label>
                <Input 
                  placeholder="0000 0000 0000 0000" 
                  maxLength={19} 
                  value={cardNumber} 
                  onChange={e => setCardNumber(e.target.value)} 
                  className="bg-secondary/50 border-border focus-visible:ring-primary font-body text-foreground tracking-[0.1em] h-12 rounded-xl shadow-sm" 
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-[10px] font-body uppercase tracking-[0.2em] text-foreground/60 font-bold mb-2.5 block">{t('cart.payment.cardMonth')}</Label>
                  <Input 
                    placeholder="MM" 
                    maxLength={2} 
                    value={cardExpMonth} 
                    onChange={e => setCardExpMonth(e.target.value)} 
                    className="bg-secondary/50 border-border focus-visible:ring-primary font-body text-center h-12 rounded-xl shadow-sm" 
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-body uppercase tracking-[0.2em] text-foreground/60 font-bold mb-2.5 block">{t('cart.payment.cardYear')}</Label>
                  <Input 
                    placeholder="AA" 
                    maxLength={2} 
                    value={cardExpYear} 
                    onChange={e => setCardExpYear(e.target.value)} 
                    className="bg-secondary/50 border-border focus-visible:ring-primary font-body text-center h-12 rounded-xl shadow-sm" 
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-body uppercase tracking-[0.2em] text-foreground/60 font-bold mb-2.5 block">{t('cart.payment.cardCvv')}</Label>
                  <Input 
                    placeholder="123" 
                    maxLength={4} 
                    type="password" 
                    value={cardCvv} 
                    onChange={e => setCardCvv(e.target.value)} 
                    className="bg-secondary/50 border-border focus-visible:ring-primary font-body text-center tracking-[0.2em] h-12 rounded-xl shadow-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border mt-8">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-[10px] text-muted-foreground font-body uppercase tracking-[0.2em] mb-1">{t('cart.payment.total')}</p>
                  <span className="text-sm text-muted-foreground font-body">{t('cart.payment.taxIncluded')}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold font-heading text-5xl text-primary leading-none">${totalPrice.toFixed(0)}</span>
                  <span className="text-sm text-muted-foreground font-body ml-2 uppercase font-bold tracking-widest">MXN</span>
                </div>
              </div>
              
              <Button
                className="w-full h-16 font-body font-bold text-white text-lg rounded-full shadow-2xl transition-all hover:scale-[1.02] active:scale-95 bg-primary hover:bg-red-800"
                onClick={handleOrder}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('cart.payment.buttonProcessing')}
                  </div>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-3" />
                    {t('cart.payment.buttonPay')}
                  </>
                )}
              </Button>
              
              <div className="mt-8 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-6 grayscale opacity-40">
                  <img src="https://www.openpay.mx/docs/img/OpenPay-logo-d.png" alt="OpenPay" className="h-5" />
                </div>
                <p className="text-[9px] font-body text-muted-foreground uppercase tracking-[0.2em] text-center">
                  {t('cart.payment.securityInfo')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}