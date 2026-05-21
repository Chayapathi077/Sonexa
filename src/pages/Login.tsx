import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Baby, AlertCircle, Mail, MessageCircle, Info, Zap, Phone, X, ShieldCheck, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const animationDelays = {
    logoTransform: 4.2,
    iconFadeIn: 2.0,
    textFadeOut: 2.0,
    sonexaText: 4.5,
    formFade: 5.0,
  };
  
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill both email and password.'); return;
    }
    setError(''); setMsg(''); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Removed navigate('/') to let AuthProvider handle redirection on state change
    } catch(err: any) {
      setError(err.message || 'Error signing in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setError('Please fill all fields.');
      return;
    }
    
    setError(''); setMsg(''); setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      try {
        await updateProfile(user, { displayName: username });
        await sendEmailVerification(user);
      } catch (e: any) {
        console.warn("Could not update profile details completely", e);
      }
      
      // Removed navigate('/') to let AuthProvider handle redirection on state change
    } catch(err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(err.message || 'Error signing up.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    setError(''); setMsg(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Password reset email sent! Check your inbox.');
    } catch(err: any) {
      setError(err.message || 'Error sending reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-fuchsia-700 to-pink-500 bg-fixed flex flex-col justify-center items-center p-4 sm:p-8 relative overflow-hidden font-sans">
      
      {/* Animated Header/Logo - Starts centered, moves left */}
      <motion.div
        initial={{ top: '50%', left: '50%', x: '-50%', y: '-50%', scale: 1.5 }}
        animate={{ top: '32px', left: '32px', x: '0%', y: '0%', scale: 1 }}
        transition={{ duration: 1.0, ease: [0.25, 1, 0.5, 1], delay: animationDelays.logoTransform }}
        className="fixed z-50 flex items-center"
      >
        <div className="relative flex items-center justify-center w-12 h-12 bg-white/20 border border-white/30 backdrop-blur-md rounded-[1.1rem] shadow-xl overflow-hidden shrink-0">
           <motion.div
             initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
             animate={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
             transition={{ duration: 1.2, delay: animationDelays.iconFadeIn, ease: 'easeInOut' }}
             className="absolute inset-0 flex items-center justify-center"
           >
             <Flame className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] fill-current" />
           </motion.div>
           <motion.div
             initial={{ opacity: 0, scale: 1.4, filter: 'blur(8px)' }}
             animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
             transition={{ duration: 1.2, delay: animationDelays.iconFadeIn, ease: 'easeInOut' }}
             className="absolute inset-0 flex items-center justify-center"
           >
             <Baby className="w-6 h-6 text-white drop-shadow-md" />
           </motion.div>
        </div>
        
        {/* Spirit Services Intro Text */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ delay: animationDelays.textFadeOut, duration: 1.0, ease: 'easeIn' }}
          className="absolute top-[calc(100%+1rem)] left-[1.5rem] -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="text-2xl font-bold text-white tracking-wide drop-shadow-md flex whitespace-nowrap">
            {"Spirit Services".split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: 'blur(5px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, letterSpacing: '0em', y: -2 }}
            animate={{ opacity: 1, letterSpacing: '0.3em', y: 0 }}
            transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
            className="text-[0.65rem] font-light text-white/70 uppercase mt-0.5 text-center"
          >
            presents
          </motion.div>
        </motion.div>

        {/* Sonexa Text Logo */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 'auto', opacity: 1 }}
          transition={{ delay: animationDelays.sonexaText, duration: 0.6, ease: 'easeOut' }}
          className="overflow-hidden whitespace-nowrap ml-3"
        >
          <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">
            Sonexa
          </h1>
        </motion.div>
      </motion.div>

      {/* Main Glassmorphic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: animationDelays.formFade, duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-[1000px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 md:p-14 flex flex-col md:flex-row gap-12 relative z-10"
      >
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] drop-shadow-sm tracking-tight">
            Streamline Your<br className="hidden md:block"/> Medical Reporting.
          </h2>
        </div>

        {/* Right Section / Form */}
        <div className="flex-1 max-w-sm w-full mx-auto md:mx-0 md:ml-auto flex flex-col justify-center">
          <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-sm tracking-tight">
             {isLogin ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-white/80 text-sm mb-8 font-medium">
             {isLogin ? 'Sign in with your email' : 'Join Sonexa to manage smarter'}
          </p>

          <form className="space-y-4" onSubmit={isLogin ? handleSignIn : handleSignUp}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl flex items-start gap-2 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 text-red-200 shrink-0 mt-0.5" />
                <p className="text-xs text-red-100 leading-relaxed font-medium">{error}</p>
              </div>
            )}
            
            {msg && (
              <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-xl flex items-start gap-2 backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-green-200 shrink-0 mt-0.5" />
                <p className="text-xs text-green-100 leading-relaxed font-medium">{msg}</p>
              </div>
            )}

            {isLogin ? (
              <>
                {/* LOGIN VIEW */}
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/60 outline-none focus:bg-white/20 focus:border-white/50 transition-all font-medium text-sm shadow-inner"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/60 outline-none focus:bg-white/20 focus:border-white/50 transition-all font-medium text-sm shadow-inner"
                  />
                </div>

                <div className="flex justify-end pt-1 pb-3">
                  <button type="button" onClick={handleForgotPassword} className="text-xs text-white/70 hover:text-white transition-colors font-medium">
                    Forgot password?
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl py-4 px-4 flex items-center justify-center gap-2 transition-all font-medium text-sm disabled:opacity-50 active:scale-[0.98] shadow-sm backdrop-blur-md"
                  >
                    <Zap className="w-4 h-4" />
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setError(''); setMsg(''); }}
                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl py-4 px-4 flex items-center justify-center gap-2 transition-all font-medium text-sm disabled:opacity-50 active:scale-[0.98] shadow-sm backdrop-blur-md"
                  >
                    <Zap className="w-4 h-4" />
                    Sign Up
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* SIGN UP VIEW */}
                <div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-white/60 outline-none focus:bg-white/20 focus:border-white/50 transition-all font-medium text-sm shadow-inner"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-white/60 outline-none focus:bg-white/20 focus:border-white/50 transition-all font-medium text-sm shadow-inner"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder-white/60 outline-none focus:bg-white/20 focus:border-white/50 transition-all font-medium text-sm shadow-inner"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 transition-all font-medium text-sm disabled:opacity-50 active:scale-[0.98] shadow-sm backdrop-blur-md mt-4"
                >
                  <Zap className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Sign Up'}
                </button>
                
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setError(''); setMsg(''); }}
                    className="text-white/70 hover:text-white text-sm font-medium transition-colors pt-3"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </motion.div>

      {/* Footer Links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 w-full px-8 flex flex-col justify-between sm:flex-row items-center gap-4 text-white/70 text-xs font-medium z-10"
      >
        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-6">
          <button onClick={() => setShowContact(true)} className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone className="w-4 h-4" /> Contact
          </button>
          <button onClick={() => setShowPrivacy(true)} className="flex items-center gap-2 hover:text-white transition-colors">
            <Info className="w-4 h-4" /> Privacy Policy
          </button>
        </div>
        <div className="text-center sm:text-right">
          &copy; {new Date().getFullYear()} Sonexa. All rights reserved.
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {(showPrivacy || showContact) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowPrivacy(false); setShowContact(false); }}
          >
            {showPrivacy && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 md:p-8 shadow-2xl relative"
              >
                <button onClick={() => setShowPrivacy(false)} className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2">
                   <X className="w-5 h-5"/>
                </button>
                <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-md">Privacy Policy</h3>
                <div className="text-white/80 space-y-4 text-sm font-medium h-[40vh] overflow-y-auto pr-2">
                  <p>Welcome to Sonexa. Your privacy is critically important to us. This policy outlines how we handle your data.</p>
                  <p><strong>1. Data Encryption:</strong> All medical reports are encrypted to ensure maximum security. We do not have access to the raw data you store.</p>
                  <p><strong>2. Authentication:</strong> We use industry-standard security to manage your login credentials.</p>
                  <p><strong>3. Use of Data:</strong> Your data is solely used to provide the reporting and templating features of this application.</p>
                  <p><strong>4. Local Storage:</strong> Certain data may be cached on your device to improve performance. This is also secured and bound to your authentication scope.</p>
                </div>
              </motion.div>
            )}

            {showContact && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-6 md:p-8 shadow-2xl relative"
              >
                 <button onClick={() => setShowContact(false)} className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2">
                   <X className="w-5 h-5"/>
                </button>
                <h3 className="text-2xl font-bold text-white mb-6 drop-shadow-md">Get in Touch</h3>
                <div className="space-y-4">
                  <a
                    href="https://wa.me/918310260713"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-[1.25rem] py-4 px-5 transition-all outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md group"
                  >
                    <div className="bg-[#25D366] p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-wide">WhatsApp</span>
                      <span className="text-xs text-white/70 font-medium">+91 8310260713</span>
                    </div>
                  </a>

                  <a
                    href="mailto:prajwaltex@gmail.com"
                    className="flex items-center gap-4 w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white rounded-[1.25rem] py-4 px-5 transition-all outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-md group"
                  >
                    <div className="bg-[#EA4335] p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-wide">Email Support</span>
                      <span className="text-xs text-white/70 font-medium">prajwaltex@gmail.com</span>
                    </div>
                  </a>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
