import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Ensure we navigate after successful login, role will be updated by AuthContext
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
    setLoading(false);
  }

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
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">System Access</h2>
            <p className="text-[#E0E0E0]">Enter credentials to establish connection</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-6 text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

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

              <div>
                <label className="block text-[#E0E0E0] text-xs font-semibold mb-2 uppercase tracking-wider pl-1">
                  Security Key
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-zinc-500 h-5 w-5 group-focus-within:text-[#00FF41] transition-colors duration-300" />
                  <input
                    type="password"
                    required
                    className="w-full bg-[#0A0A0A] border border-zinc-800 text-white rounded-lg pl-12 pr-4 py-3 
                      focus:outline-none focus:border-[#00FF41] focus:ring-1 focus:ring-[#00FF41] focus:shadow-[0_0_15px_rgba(0,255,65,0.15)]
                      transition-all duration-300 placeholder:text-zinc-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-gradient-to-r from-[#00FF41] to-[#00E5FF] hover:scale-[1.02] active:scale-[0.98] 
                text-black font-bold py-3.5 rounded-lg transition-all duration-300 
                shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_30px_rgba(0,255,65,0.4)]
                flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 text-black" />
              ) : (
                <>
                  Initialize Session <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#E0E0E0]">
            <Link
              to="/signup"
              className="group inline-flex items-center gap-1 hover:text-[#00FF41] transition-colors duration-300"
            >
              <span>Initialize New Protocol</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#00FF41]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}