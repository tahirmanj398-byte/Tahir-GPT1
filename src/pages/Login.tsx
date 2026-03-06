import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { localDb } from '../utils/localDb';
import { ArrowRight, Mail, Lock, ShieldCheck, Zap, Globe } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = localDb.login(email, password);
      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      {/* Left Pane - Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
        
        <div className="relative z-10 flex items-center space-x-3">
          <Logo size={40} />
          <span className="text-xl font-bold tracking-tighter uppercase">Tahir GPT</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-8xl font-black tracking-tighter leading-[0.85] uppercase mb-8">
            The <br />
            <span className="text-indigo-500">Future</span> <br />
            Is Here.
          </h1>
          <p className="max-w-md text-zinc-400 text-lg font-medium leading-relaxed">
            Experience the most advanced AI platform ever built. Self-evolving, 
            ultra-fast, and designed for the next generation of creators.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-8">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">200M+</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Capacity</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">0.1s</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Latency</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">∞</span>
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Evolution</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 relative">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-zinc-500 font-medium">Enter your credentials to access your workspace.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-medium flex items-center animate-shake">
              <ShieldCheck className="w-4 h-4 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-700"
                  placeholder="Email address"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-700"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" title="Recover Password" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-indigo-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center group"
            >
              Sign In
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="pt-8 border-t border-white/5 flex flex-col items-center space-y-6">
            <p className="text-zinc-500 text-sm">
              New to Tahir GPT?{' '}
              <Link to="/signup" className="text-white font-bold hover:text-indigo-500 transition-colors underline underline-offset-4">
                Create an account
              </Link>
            </p>
            
            <div className="flex items-center space-x-6 text-[10px] uppercase tracking-widest font-bold text-zinc-600">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <span className="flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                Global
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
