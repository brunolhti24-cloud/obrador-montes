import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, User, UserPlus, KeyRound, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login', 'register', or 'verify'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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
      }

      await checkUserAuth();
      const returnUrl = localStorage.getItem('auth_return_url');
      localStorage.removeItem('auth_return_url');
      navigate(returnUrl || '/');
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-black relative overflow-hidden">

      {/* Background Image & Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=2000&auto=format&fit=crop" 
          alt="Steak background" 
          className="w-full h-full object-cover opacity-20 scale-105 blur-sm"
          style={{ filter: 'brightness(0.5) contrast(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent" />
      </div>

      {/* Gold stripe top */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, #BF953F, #FCF6BA, #B38728)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-panel rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-white/10">
          {/* Subtle glow inside card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-accent/5 rounded-full blur-[60px] pointer-events-none" />

          {/* Logo */}
          <div className="text-center mb-8 relative z-10">
            <div className="flex justify-center mb-5">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-white/10 bg-black/40 shadow-inner">
                <img
                  src="https://media.base44.com/images/public/69fa176f04a4100a804d3357/f2ccd0164_image.png"
                  alt="Logo"
                  className="relative w-12 h-12 object-contain drop-shadow-md"
                />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-1 tracking-wide">Obrador Montes</h1>
            <p className="gold-gradient-text text-[10px] font-body tracking-[0.2em] uppercase font-semibold">
              {mode === 'login' ? 'Acceso Exclusivo' : mode === 'register' ? 'Solicitud de Membresía' : 'Verificación de Identidad'}
            </p>
          </div>

          {/* Mode toggle tabs (Hide if verify) */}
          {mode !== 'verify' && (
            <div className="flex bg-black/40 border border-white/5 rounded-full p-1 mb-8 relative z-10">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-body font-bold uppercase tracking-wider transition-all duration-300 ${
                  mode === 'login'
                    ? 'bg-white/10 text-white shadow-sm border border-white/10'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-body font-bold uppercase tracking-wider transition-all duration-300 ${
                  mode === 'register'
                    ? 'bg-white/10 text-white shadow-sm border border-white/10'
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Registrar
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
                  className="flex items-center gap-3 bg-red-950/40 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-xs font-body tracking-wide"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  {error}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 bg-green-950/40 border border-green-500/30 text-green-200 px-4 py-3 rounded-xl text-xs font-body tracking-wide mt-3"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
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
                <p className="text-white/60 text-xs font-body mb-5 text-center px-4">
                  Ingresa el código de 6 dígitos que enviamos a <span className="text-white font-bold">{email}</span>
                </p>
                <div>
                  <label className="text-white/50 text-[10px] font-body uppercase tracking-widest font-semibold mb-2 block">Código de Verificación</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
                    <input
                      type="text"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      required
                      className="w-full pl-11 pr-4 h-12 rounded-xl bg-black/50 border border-white/10 text-foreground placeholder:text-white/20 font-body text-center text-lg tracking-[0.5em] focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
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
                      <label className="text-white/50 text-[10px] font-body uppercase tracking-widest font-semibold mb-2 block">Nombre completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Ej. Juan Pérez"
                          required={mode === 'register'}
                          className="w-full pl-11 pr-4 h-12 rounded-xl bg-black/50 border border-white/10 text-foreground placeholder:text-white/20 font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="text-white/50 text-[10px] font-body uppercase tracking-widest font-semibold mb-2 block">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        required
                        className="w-full pl-11 pr-4 h-12 rounded-xl bg-black/50 border border-white/10 text-foreground placeholder:text-white/20 font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/50 text-[10px] font-body uppercase tracking-widest font-semibold mb-2 block">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-11 pr-4 h-12 rounded-xl bg-black/50 border border-white/10 text-foreground placeholder:text-white/20 font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all tracking-widest"
                      />
                    </div>
                  </div>

                  {mode === 'register' && (
                    <motion.div
                      key="confirm-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-white/50 text-[10px] font-body uppercase tracking-widest font-semibold mb-2 block">Confirmar contraseña</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required={mode === 'register'}
                          minLength={6}
                          className="w-full pl-11 pr-4 h-12 rounded-xl bg-black/50 border border-white/10 text-foreground placeholder:text-white/20 font-body text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all tracking-widest"
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
              className="w-full h-14 flex items-center justify-center gap-3 rounded-full font-body font-bold text-sm text-black shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 mt-6"
              style={{ background: 'linear-gradient(135deg, #FCF6BA, #B38728)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : mode === 'verify' ? (
                <>
                  <KeyRound className="w-4 h-4" />
                  Verificar y Entrar
                </>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Acceder al Catálogo
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Solicitar Acceso
                </>
              )}
            </button>
            
            {mode === 'verify' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full text-center text-[10px] font-body text-white/40 hover:text-white uppercase tracking-widest transition-colors mt-4"
              >
                Volver al inicio de sesión
              </button>
            )}
          </form>

        </div>

        {/* Switch mode text */}
        {mode !== 'verify' && (
          <div className="mt-8 text-center">
            <p className="text-white/40 text-xs font-body">
              {mode === 'login' ? '¿Aún no eres miembro? ' : '¿Ya tienes membresía? '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-accent hover:text-yellow-300 font-semibold transition-colors uppercase tracking-wider ml-1"
              >
                {mode === 'login' ? 'Únete aquí' : 'Inicia Sesión'}
              </button>
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-white/20 text-[10px] font-body mt-8 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Obrador Montes
        </p>
      </motion.div>
    </div>
  );
}
