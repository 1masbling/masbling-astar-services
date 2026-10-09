import { useState } from 'react';
import { Lock, Mail, AlertCircle, Loader2, Wrench } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { COMPANY } from '@/lib/constants';

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await signIn(email.trim(), password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-400/15 border border-gold-600/30 mb-3">
            <Wrench className="w-7 h-7 text-gold-400" />
          </div>
          <h1 className="text-lg font-bold text-navy-50 font-display">{COMPANY.name}</h1>
          <p className="text-xs text-navy-400 mt-0.5">{COMPANY.tagline}</p>
        </div>

        <div className="card p-6">
          <h2 className="text-base font-bold text-navy-50 mb-1">Staff Sign In</h2>
          <p className="text-xs text-navy-400 mb-4">Access the operations dashboard</p>

          {error && (
            <div className="rounded-lg bg-error-900/40 border border-error-700/40 p-3 mb-3 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-error-400 mt-0.5 shrink-0" />
              <p className="text-xs text-error-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="input pl-9"
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-9"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-navy-500 mt-4 text-center">
            Accounts are created by your administrator. Contact us if you need access.
          </p>

          <div className="mt-4 pt-4 border-t border-navy-800 text-center">
            <a
              href="#data-deletion"
              className="text-[11px] text-navy-500 hover:text-navy-300 transition-colors"
            >
              Request deletion of your account and data
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
