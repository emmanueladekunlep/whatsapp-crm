import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminContact, setShowAdminContact] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowAdminContact(false);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } else {
      setError(data.error || 'Login failed');
      // Show admin contact if account is inactive
      if (data.inactive) {
        setShowAdminContact(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          {/* WhatsApp SVG Icon */}
          <svg 
            className="w-16 h-16 mx-auto mb-3"
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 2C6.48 2 2 6.48 2 12C2 14.39 2.88 16.6 4.32 18.32L3.29 21.71C3.14 22.06 3.52 22.39 3.85 22.23L7.29 20.76C8.9 21.57 10.7 22 12.57 22C18.07 22 22 17.93 22 12C22 6.48 17.52 2 12 2Z" 
              fill="#25D366"
            />
            <path 
              d="M17.07 14.33C16.77 14.22 15.67 13.7 15.4 13.6C15.12 13.5 14.92 13.45 14.72 13.75C14.52 14.05 13.98 14.57 13.8 14.77C13.62 14.97 13.44 15 13.14 14.89C12.84 14.78 11.94 14.43 10.85 13.55C9.98 12.86 9.4 12.03 9.22 11.73C9.04 11.43 9.2 11.24 9.36 11.1C9.5 10.97 9.67 10.78 9.83 10.61C9.99 10.44 10.05 10.32 10.16 10.13C10.27 9.94 10.22 9.77 10.14 9.66C10.06 9.55 9.44 8.3 9.16 7.82C8.89 7.35 8.6 7.38 8.39 7.38C8.18 7.38 7.96 7.38 7.75 7.38C7.54 7.38 7.2 7.46 6.92 7.78C6.64 8.1 5.94 8.8 5.94 10.2C5.94 11.6 6.98 13.05 7.15 13.28C7.32 13.51 9.38 16.72 12.56 17.96C13.62 18.4 14.44 18.65 15.08 18.84C16.01 19.1 16.85 19.07 17.52 19.01C18.27 18.94 19.85 18.46 20.16 17.82C20.47 17.18 20.47 16.63 20.39 16.52C20.31 16.41 20.05 16.3 17.07 14.33Z" 
              fill="white"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-800">WhatsApp CRM</h1>
          <p className="text-gray-500 mt-1">Manage your customers like a pro</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {showAdminContact && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg mb-4">
            <p className="text-sm text-yellow-800 font-semibold">
              📱 Contact admin to activate your account:
            </p>
            <p className="text-lg font-bold text-yellow-900 mt-1">07032977572</p>
            <p className="text-xs text-yellow-700 mt-1">WhatsApp or Call</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="text-right mb-4">
            <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <Link href="/signup" className="text-green-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}