import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, User, UserPlus, KeyRound, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { language, setLanguage, t } = useLanguage();
  const [mode, setMode] = useState('login'); // 'login', 'register', or 'verify'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await base44.auth.login(email, password);
        if (res.requiresVerification) {
          setMode('verify');
          setSuccessMsg(res.message);
          setLoading(false);
          return;
        }
      } else if (mode === 'register') {
        const res = await base44.auth.register(name, email, password);
        if (res.requiresVerification) {
          setMode('verify');
          setSuccessMsg(res.message);
          setLoading(false);
          return;
        }
      } else if (mode === 'verify') {
        await base44.auth.verify(email, code);
      } else if (mode === 'forgot') {
        const res = await base44.auth.forgotPassword(email);
        setSuccessMsg(res.message);
        setMode('reset');
        setLoading(false);
        return;
      } else if (mode === 'reset') {
        await base44.auth.resetPassword(email, code, newPassword);
        setSuccessMsg('Contraseña actualizada. Ya puedes iniciar sesión.');
        setMode('login');
        setLoading(false);
        return;
      }

      await checkUserAuth();
      const loggedUser = await base44.auth.me();
      
      const returnUrl = localStorage.getItem('auth_return_url');
      localStorage.removeItem('auth_return_url');
      
      // If it's a staff or admin, send them to admin panel unless they have a returnUrl
      if (!returnUrl && loggedUser.role === 'staff') {
        navigate('/admin/pedidos');
      } else if (!returnUrl && loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(returnUrl || '/');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;
    try {
      setLoading(true);
      await base44.auth.resendVerification(email);
      setSuccessMsg('Nuevo código enviado.');
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    if (newMode !== 'verify') {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCode('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      
      {/* Floating Premium Language Switcher */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md border border-border px-2 py-1 rounded-full shadow-lg">
        <button
          type="button"
          onClick={() => setLanguage('es')}
          className={`flex items-center gap-1 text-[9px] font-body font-bold uppercase tracking-wider px-2 py-1 rounded-full transition-all ${
            language === 'es'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🇲🇽 Esp
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1 text-[9px] font-body font-bold uppercase tracking-wider px-2 py-1 rounded-full transition-all ${
            language === 'en'
              ? 'bg-primary text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          🇺🇸 Eng
        </button>
      </div>

      {/* Background Image & Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2000&auto=format&fit=crop" 
          alt="Steak background" 
          className="w-full h-full object-cover opacity-10 scale-105 blur-sm"
          style={{ filter: 'brightness(1.2) contrast(1.1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Gold stripe top */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-border">
          {/* Subtle glow inside card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

          {/* Logo */}
          <div className="text-center mb-8 relative z-10">
            <div className="flex justify-center mb-5">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-border bg-white shadow-md">
                <img
                  src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png"
                  alt="Logo"
                  className="relative w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-1 tracking-wide">{t('app.title')}</h1>
            <p className="text-primary text-[10px] font-body tracking-[0.2em] uppercase font-bold">
              {mode === 'login' ? t('login.title.login') : 
               mode === 'register' ? t('login.title.register') : 
               mode === 'verify' ? t('login.title.verify') :
               mode === 'forgot' ? t('login.title.forgot') : t('login.title.reset')}
            </p>
          </div>

          {/* Mode toggle tabs (Hide if verify) */}
          {['login', 'register'].includes(mode) && (
            <div className="flex bg-secondary border border-border rounded-full p-1 mb-8 relative z-10">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-body font-bold uppercase tracking-wider transition-all duration-300 ${
                  mode === 'login'
                    ? 'bg-white text-primary shadow-md border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('login.button.loginTab')}
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-body font-bold uppercase tracking-wider transition-all duration-300 ${
                  mode === 'register'
                    ? 'bg-white text-primary shadow-md border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {t('login.button.registerTab')}
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="relative z-10 mb-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-body shadow-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs font-body shadow-sm mt-3"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-500" />
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            {mode === 'verify' ? (
              <motion.div
                key="verify-field"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-muted-foreground text-xs font-body mb-5 text-center px-4">
                  {t('login.desc.verify')} <span className="text-foreground font-bold">{email}</span>
                </p>
                <div>
                  <label className="text-foreground/60 text-[10px] font-body uppercase tracking-widest font-bold mb-2 block">{t('login.label.code')}</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      required
                      className="w-full pl-11 pr-4 h-12 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/30 font-body text-center text-lg tracking-[0.5em] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="text-[10px] font-body text-primary hover:text-red-700 uppercase tracking-widest disabled:opacity-50 transition-colors"
                  >
                    {resendCooldown > 0 ? `${t('login.resend.cooldown')}${resendCooldown}s` : t('login.resend.button')}
                  </button>
                </div>
              </motion.div>
            ) : mode === 'forgot' ? (
              <motion.div key="forgot-field" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-muted-foreground text-xs font-body mb-5 text-center px-4">
                  {t('login.desc.forgot')}
                </p>
                <div>
                  <label className="text-foreground/60 text-[10px] font-body uppercase tracking-widest font-bold mb-2 block">{t('login.label.email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('login.placeholder.email')}
                      required
                      className="w-full pl-11 pr-4 h-12 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/30 font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </motion.div>
            ) : mode === 'reset' ? (
              <motion.div key="reset-fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <p className="text-muted-foreground text-xs font-body mb-5 text-center px-4">
                  {t('login.desc.reset')}
                </p>
                <div>
                  <label className="text-foreground/60 text-[10px] font-body uppercase tracking-widest font-bold mb-2 block">{t('login.label.recoveryCode')}</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      required
                      className="w-full pl-11 pr-4 h-12 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/30 font-body text-center text-lg tracking-[0.5em] focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-foreground/60 text-[10px] font-body uppercase tracking-widest font-bold mb-2 block">{t('login.label.newPassword')}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-11 pr-4 h-12 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/30 font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm tracking-widest"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key="auth-fields" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                  {mode === 'register' && (
                    <motion.div
                      key="name-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-foreground/60 text-[10px] font-body uppercase tracking-widest font-bold mb-2 block">{t('login.label.name')}</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder={t('login.placeholder.name')}
                          required={mode === 'register'}
                          className="w-full pl-11 pr-4 h-12 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/30 font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="text-foreground/60 text-[10px] font-body uppercase tracking-widest font-bold mb-2 block">{t('login.label.email')}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={t('login.placeholder.email')}
                        required
                        className="w-full pl-11 pr-4 h-12 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/30 font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-foreground/60 text-[10px] font-body uppercase tracking-widest font-bold mb-2 block">{t('login.label.password')}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-11 pr-4 h-12 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/30 font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm tracking-widest"
                      />
                    </div>
                    {mode === 'login' && (
                      <div className="text-right mt-1">
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-[10px] font-body text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors"
                        >
                          {t('login.button.forgotPassword')}
                        </button>
                      </div>
                    )}
                  </div>

                  {mode === 'register' && (
                    <motion.div
                      key="confirm-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-foreground/60 text-[10px] font-body uppercase tracking-widest font-bold mb-2 block">{t('login.label.confirmPassword')}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required={mode === 'register'}
                          minLength={6}
                          className="w-full pl-11 pr-4 h-12 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/30 font-body text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-sm tracking-widest"
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 flex items-center justify-center gap-3 rounded-full font-body font-bold text-sm text-white bg-primary shadow-xl hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'verify' ? (
                <>
                  <KeyRound className="w-4 h-4" />
                  {t('login.button.submit.verify')}
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  {t('login.button.submit.login')}
                </>
              ) : mode === 'forgot' ? (
                <>
                  <Mail className="w-4 h-4" />
                  {t('login.button.submit.forgot')}
                </>
              ) : mode === 'reset' ? (
                <>
                  <Lock className="w-4 h-4" />
                  {t('login.button.submit.reset')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {t('login.button.submit.register')}
                </>
              )}
            </button>
            
            {['verify', 'forgot', 'reset'].includes(mode) && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-[10px] font-body text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors mt-4"
              >
                {t('login.button.backToLogin')}
              </button>
            )}
          </form>

        </div>

        {/* Switch mode text */}
        {['login', 'register'].includes(mode) && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-xs font-body">
              {mode === 'login' ? t('login.text.notMember') : t('login.text.alreadyMember')}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-primary hover:text-red-700 font-bold transition-colors uppercase tracking-wider ml-1"
              >
                {mode === 'login' ? t('login.text.join') : t('login.text.signIn')}
              </button>
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-muted-foreground/30 text-[10px] font-body mt-8 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} {t('app.title')}
        </p>
      </motion.div>
    </div>
  );
}
