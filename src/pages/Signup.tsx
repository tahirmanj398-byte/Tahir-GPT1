import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { localDb } from '../utils/localDb';
import { ArrowRight, Mail, Lock, ShieldCheck, UserPlus, HelpCircle } from 'lucide-react';
import Logo from '../components/Logo';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('What is your favorite color?');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      localDb.signup(email, password, securityQuestion, securityAnswer);
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 border-r border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-indigo-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[160px]" />
        
        <div className="relative z-10 flex items-center space-x-3">
          <Logo size={40} />
          <span className="text-xl font-bold tracking-tighter uppercase">Tahir GPT</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-8xl font-black tracking-tighter leading-[0.85] uppercase mb-8">
            Join The <br />
            <span className="text-emerald-500">Elite</span> <br />
            Network.
          </h1>
          <p className="max-w-md text-zinc-400 text-lg font-medium leading-relaxed">
            Create your account and unlock the full potential of next-generation 
            AI. Secure, private, and powerful.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">System Online</span>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-10 py-12">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Create Account</h2>
            <p className="text-zinc-500 font-medium">Start your journey with Tahir GPT today.</p>
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
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-700"
                  placeholder="Email address"
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-700"
                  placeholder="Create password"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 ml-4">Security Setup</label>
                <div className="relative group">
                  <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all appearance-none text-zinc-300"
                  >
                    <option>What is your favorite color?</option>
                    <option>What was your first pet's name?</option>
                    <option>What city were you born in?</option>
                    <option>What is your mother's maiden name?</option>
                  </select>
                </div>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-zinc-700"
                    placeholder="Security answer"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-500 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center group"
            >
              Create Account
              <UserPlus className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="pt-8 border-t border-white/5 flex flex-col items-center space-y-6">
            <p className="text-zinc-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-bold hover:text-emerald-500 transition-colors underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
