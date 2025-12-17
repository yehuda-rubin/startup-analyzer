import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Rocket, Briefcase, Mail, Lock, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export default function SignUp() {
  const [role, setRole] = useState(null); // 'entrepreneur' | 'investor'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    // Main Container: Forces full height and true centering
    <div className="min-h-screen w-full flex items-center justify-center p-4">

      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Content Card - Relative to sit above background */}
      <div className="relative z-10 w-full max-w-md bg-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Join the innovative ecosystem</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('entrepreneur')}
                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-center gap-3
                  ${isEntrepreneur
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Rocket size={24} className={isEntrepreneur ? 'text-indigo-400' : 'text-slate-500'} />
                <span className="text-sm font-semibold">Founder</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('investor')}
                className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-center gap-3
                  ${isInvestor
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <Briefcase size={24} className={isInvestor ? 'text-emerald-400' : 'text-slate-500'} />
                <span className="text-sm font-semibold">Investor</span>
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-500 h-5 w-5 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-500 h-5 w-5 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-500 h-5 w-5 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full bg-[#0f172a] border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2
                ${isInvestor
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20'
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Create Account <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <div className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
