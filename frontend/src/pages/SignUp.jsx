import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Join our community of innovators and backers</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div
                onClick={() => setRole('entrepreneur')}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center group
                  ${role === 'entrepreneur'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800'
                  }`}
              >
                <span className="text-4xl mb-4">🚀</span>
                <h3 className={`text-lg font-semibold mb-2 ${role === 'entrepreneur' ? 'text-indigo-400' : 'text-slate-200'}`}>Entrepreneur</h3>
                <p className="text-sm text-slate-400">I want to analyze my startup and get funding.</p>
              </div>

              <div
                onClick={() => setRole('investor')}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center group
                  ${role === 'investor'
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800'
                  }`}
              >
                <span className="text-4xl mb-4">💼</span>
                <h3 className={`text-lg font-semibold mb-2 ${role === 'investor' ? 'text-emerald-400' : 'text-slate-200'}`}>Investor</h3>
                <p className="text-sm text-slate-400">I want to find promising startups to invest in.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full font-semibold py-3 rounded-lg transition-colors flex items-center justify-center
                ${role === 'investor'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}