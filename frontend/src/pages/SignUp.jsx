import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, Briefcase, Mail, Lock, CheckCircle2, ArrowRight, Loader2, Zap, AlertCircle } from 'lucide-react';

export default function SignUp() {
  const [role, setRole] = useState(null); // 'entrepreneur' | 'investor'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!role) {
      return setError('Please select a role');
    }

    if (!acceptedTerms) {
      return setError('You must accept the terms and conditions to continue');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }
    setLoading(false);
  }

  const isEntrepreneur = role === 'entrepreneur';
  const isInvestor = role === 'investor';

  return (
    // Primary Background: Deep Void (Black)
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black relative overflow-hidden">

      {/* Electric Flow Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#00FF41]/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00E5FF]/5 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Glass Component Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl transition-all duration-300 hover:border-[#00FF41]/30 hover:shadow-[0_0_30px_rgba(0,255,65,0.1)] group/card">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Access Grant</h2>
            <p className="text-[#E0E0E0]">Initialize new user protocol</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('entrepreneur')}
                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 group relative overflow-hidden
                  ${isEntrepreneur
                    ? 'bg-[#00FF41]/10 border-[#00FF41] text-white shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                    : 'bg-[#0A0A0A] border-zinc-800 text-[#E0E0E0] hover:border-[#00FF41]/50 hover:bg-[#00FF41]/5'
                  }`}
              >
                <div className={`p-2 rounded-full transition-colors duration-300 ${isEntrepreneur ? 'bg-[#00FF41]/20' : 'bg-white/5'}`}>
                  <Zap size={20} className={isEntrepreneur ? 'text-[#00FF41]' : 'text-zinc-500 group-hover:text-[#00FF41]'} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Founder</span>
                {isEntrepreneur && <div className="absolute inset-0 border-2 border-[#00FF41] rounded-xl animate-pulse opacity-20" />}
              </button>

              <button
                type="button"
                onClick={() => setRole('investor')}
                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-center gap-3 group relative overflow-hidden
                  ${isInvestor
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white shadow-[0_0_20px_rgba(0,229,255,0.2)]'
                    : 'bg-[#0A0A0A] border-zinc-800 text-[#E0E0E0] hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/5'
                  }`}
              >
                <div className={`p-2 rounded-full transition-colors duration-300 ${isInvestor ? 'bg-[#00E5FF]/20' : 'bg-white/5'}`}>
                  <Briefcase size={20} className={isInvestor ? 'text-[#00E5FF]' : 'text-zinc-500 group-hover:text-[#00E5FF]'} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Investor</span>
                {isInvestor && <div className="absolute inset-0 border-2 border-[#00E5FF] rounded-xl animate-pulse opacity-20" />}
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
              <div>
                <label className="block text-[#E0E0E0] text-xs font-semibold mb-2 uppercase tracking-wider pl-1">
                  Identity
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-zinc-500 h-5 w-5 group-focus-within:text-[#00FF41] transition-colors duration-300" />
                  <input
                    type="email"
                    required
                    className="w-full bg-[#0A0A0A] border border-zinc-800 text-white rounded-lg pl-12 pr-4 py-3 
                      focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] focus:shadow-[0_0_15px_rgba(0,255,65,0.15)]
                      transition-all duration-300 placeholder:text-zinc-600"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#E0E0E0] text-xs font-semibold mb-2 uppercase tracking-wider pl-1">
                    Key
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-zinc-500 h-5 w-5 group-focus-within:text-[#00FF41] transition-colors duration-300" />
                    <input
                      type="password"
                      required
                      className="w-full bg-[#0A0A0A] border border-zinc-800 text-white rounded-lg pl-12 pr-4 py-3 
                        focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] focus:shadow-[0_0_15px_rgba(0,255,65,0.15)]
                        transition-all duration-300 placeholder:text-zinc-600"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#E0E0E0] text-xs font-semibold mb-2 uppercase tracking-wider pl-1">
                    Verify
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-zinc-500 h-5 w-5 group-focus-within:text-[#00FF41] transition-colors duration-300" />
                    <input
                      type="password"
                      required
                      className="w-full bg-[#0A0A0A] border border-zinc-800 text-white rounded-lg pl-12 pr-4 py-3 
                        focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] focus:shadow-[0_0_15px_rgba(0,255,65,0.15)]
                        transition-all duration-300 placeholder:text-zinc-600"
                      placeholder="Confirm"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ LEGAL DISCLAIMER CHECKBOX - NEW SECTION */}
            <div className="border-t border-white/10 pt-5">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-zinc-700 rounded bg-[#0A0A0A] 
                    peer-checked:bg-[#00FF41] peer-checked:border-[#00FF41] 
                    transition-all duration-300 
                    peer-checked:shadow-[0_0_10px_rgba(0,255,65,0.3)]
                    flex items-center justify-center">
                    {acceptedTerms && <CheckCircle2 size={14} className="text-black" />}
                  </div>
                </div>
                <span className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                  I accept the{' '}
                  <a 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#00FF41] hover:text-[#00E5FF] underline underline-offset-2 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Use
                  </a>
                  {' '}and acknowledge that this AI-powered system may contain errors. 
                  The information provided does not constitute investment advice or a recommendation for any action. 
                  All investment decisions are solely my responsibility. 
                  The system is provided as-is without warranty for data quality.
                </span>
              </label>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full font-bold py-3.5 rounded-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide text-sm
                hover:scale-[1.02] active:scale-[0.98]
                ${isInvestor
                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#00FF41] text-black shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:shadow-[0_0_30px_rgba(0,229,255,0.4)]'
                  : 'bg-gradient-to-r from-[#00FF41] to-[#00E5FF] text-black shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_30px_rgba(0,255,65,0.4)]'
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 text-black" />
              ) : (
                <>
                  Initialize Protocol <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#E0E0E0]">
            Already linked?{' '}
            <Link
              to="/login"
              className="text-[#00FF41] hover:text-[#00E5FF] transition-colors duration-300 font-semibold"
            >
              Access System
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}