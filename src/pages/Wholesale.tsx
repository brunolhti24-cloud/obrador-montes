import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Truck, BadgeCheck, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/LanguageContext';

export default function Wholesale() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const BENEFITS = [
    {
      icon: BadgeCheck,
      title: t('wholesale.benefit1.title'),
      desc: t('wholesale.benefit1.desc')
    },
    {
      icon: Truck,
      title: t('wholesale.benefit2.title'),
      desc: t('wholesale.benefit2.desc')
    },
    {
      icon: Building2,
      title: t('wholesale.benefit3.title'),
      desc: t('wholesale.benefit3.desc')
    }
  ];

  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: 'RESTAURANTE',
    estimatedVolume: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (response.ok) {
        setSubmitted(true);
        toast.success(t('wholesale.success.title'));
      } else {
        toast.error('Error');
      }
    } catch (error) {
      toast.error('Error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-4">{t('wholesale.success.title')}</h2>
          <p className="text-slate-500 font-body mb-8">
            {t('wholesale.success.desc')}
          </p>
          <Button onClick={() => setSubmitted(false)} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold">
            {t('wholesale.success.back')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[10px] gold-gradient-text font-bold uppercase tracking-[0.3em] mb-4 block">{t('wholesale.hero.tagline')}</span>
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 mb-6 leading-tight">
            {t('wholesale.hero.title')}
          </h1>
          <p className="text-lg text-slate-500 font-body leading-relaxed">
            {t('wholesale.hero.desc')}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Side: Info & Benefits */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 gap-8">
            {BENEFITS.map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 group"
              >
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-500 font-body text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-heading font-bold text-2xl mb-4">{t('wholesale.quickHelp.title')}</h4>
              <p className="text-slate-400 font-body mb-6 text-sm">{t('wholesale.quickHelp.desc')}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">+52 (442) 123 4567</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">mayoreo@obradormontes.com</span>
                </div>
              </div>
            </div>
            {/* Abstract Background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-slate-100"
        >
          <h3 className="font-heading font-bold text-2xl text-slate-900 mb-8">{t('wholesale.form.title')}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('wholesale.form.businessName')}</Label>
                <Input 
                  required
                  placeholder={t('wholesale.form.businessNamePlaceholder')}
                  value={form.businessName}
                  onChange={e => setForm({...form, businessName: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('wholesale.form.businessType')}</Label>
                <Select value={form.businessType} onValueChange={v => setForm({...form, businessType: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESTAURANTE">{t('wholesale.form.businessType.restaurant')}</SelectItem>
                    <SelectItem value="HOTEL">{t('wholesale.form.businessType.hotel')}</SelectItem>
                    <SelectItem value="CATERING">{t('wholesale.form.businessType.catering')}</SelectItem>
                    <SelectItem value="DISTRIBUIDOR">{t('wholesale.form.businessType.distributor')}</SelectItem>
                    <SelectItem value="OTRO">{t('wholesale.form.businessType.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('wholesale.form.contactName')}</Label>
                <Input 
                  required
                  placeholder={t('wholesale.form.contactNamePlaceholder')}
                  value={form.contactName}
                  onChange={e => setForm({...form, contactName: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('wholesale.form.phone')}</Label>
                <Input 
                  required
                  type="tel"
                  placeholder={t('wholesale.form.phonePlaceholder')}
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('wholesale.form.email')}</Label>
              <Input 
                required
                type="email"
                placeholder={t('wholesale.form.emailPlaceholder')}
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('wholesale.form.volume')}</Label>
              <Input 
                placeholder={t('wholesale.form.volumePlaceholder')}
                value={form.estimatedVolume}
                onChange={e => setForm({...form, estimatedVolume: e.target.value})}
                className="h-12 rounded-xl bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('wholesale.form.message')}</Label>
              <Textarea 
                placeholder={t('wholesale.form.messagePlaceholder')}
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                className="rounded-xl bg-slate-50 border-slate-200 resize-none"
                rows={4}
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-xl hover:scale-[1.02] transition-all flex gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" /> {t('wholesale.form.submit')}
                </>
              )}
            </Button>
            <p className="text-[9px] text-center text-slate-400 font-body uppercase tracking-wider">
              {t('wholesale.form.disclaimer')}
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
