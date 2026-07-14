import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customerCount, setCustomerCount] = useState(0);
  const [reminderCount, setReminderCount] = useState(0);
  const [quoteCount, setQuoteCount] = useState(0);
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    fetchCounts(token);
    checkWhatsAppStatus(token);
    setLoading(false);
  }, []);

  const fetchCounts = async (token: string) => {
    try {
      const res = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerCount(data.length);
      }

      const reminderRes = await fetch('/api/reminders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (reminderRes.ok) {
        const data = await reminderRes.json();
        setReminderCount(data.length);
      }

      const quoteRes = await fetch('/api/quotes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (quoteRes.ok) {
        const data = await quoteRes.json();
        setQuoteCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const checkWhatsAppStatus = async (token: string) => {
    try {
      const res = await fetch('/api/whatsapp/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWhatsappConnected(data.connected);
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">📱 WhatsApp CRM</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.isTeamMember ? `${user?.name} (${user?.role})` : user?.business_name}
            </span>
            <Link href="/profile" className="text-blue-500 hover:text-blue-600 text-sm">
              👤 Profile
            </Link>
            <Link href="/whatsapp" className="text-green-500 hover:text-green-600 text-sm">
              📱 WhatsApp
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome, {user?.isTeamMember ? user?.name : user?.business_name}! 👋
              </h2>
              <div className="flex flex-wrap gap-4 mt-2">
                {user?.isTeamMember ? (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                    👥 Team Member: {user?.role}
                  </span>
                ) : (
                  <>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.is_active ? '✅ Account Active' : '❌ Account Inactive'}
                    </span>
                    {user?.expiry_date && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                        Expires: {new Date(user.expiry_date).toLocaleDateString()}
                      </span>
                    )}
                  </>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  whatsappConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {whatsappConnected ? '📱 WhatsApp Connected' : '📱 WhatsApp Disconnected'}
                </span>
              </div>
            </div>
            {!whatsappConnected && !user?.isTeamMember && (
              <Link href="/whatsapp">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                  Connect WhatsApp
                </button>
              </Link>
            )}
          </div>
          {!user?.is_active && !user?.isTeamMember && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg">
              ⚠️ Your account is inactive. Contact admin to activate.
              <br />
              <span className="text-sm font-semibold">📱 Admin: 07032977572</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Customers</h3>
                <p className="text-3xl font-bold text-gray-800">{customerCount}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Reminders</h3>
                <p className="text-3xl font-bold text-gray-800">{reminderCount}</p>
              </div>
              <div className="text-4xl">⏰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Quotes</h3>
                <p className="text-3xl font-bold text-gray-800">{quoteCount}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">WhatsApp</h3>
                <p className="text-xl font-bold text-gray-800">
                  {whatsappConnected ? '✅ Online' : '❌ Offline'}
                </p>
              </div>
              <div className="text-4xl">📱</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Link href="/customers">
            <button className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition">
              👥 Customers
            </button>
          </Link>
          <Link href="/reminders">
            <button className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition">
              ⏰ Reminders
            </button>
          </Link>
          <Link href="/quotes">
            <button className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition">
              💰 Quotes
            </button>
          </Link>
          <Link href="/analytics">
            <button className="w-full bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 transition">
              📊 Analytics
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Link href="/whatsapp">
            <button className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition">
              📱 WhatsApp
            </button>
          </Link>
          <Link href="/auto-reply">
            <button className="w-full bg-teal-500 text-white px-4 py-3 rounded-lg hover:bg-teal-600 transition">
              🤖 Auto-Reply
            </button>
          </Link>
          {!user?.isTeamMember && (
            <Link href="/team">
              <button className="w-full bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 transition">
                👥 Team
              </button>
            </Link>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-3">💡 Quick Tips</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• <strong>Connect WhatsApp</strong> to send messages to customers</li>
            <li>• <strong>Auto-Reply</strong> sets automatic responses to keywords</li>
            <li>• <strong>Analytics</strong> tracks your message activity</li>
            {!user?.isTeamMember && <li>• <strong>Team</strong> allows collaboration with staff</li>}
          </ul>
        </div>

        {user?.email === 'emmanueladekunlep@gmail.com' && !user?.isTeamMember && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>🔑 Admin Panel: <Link href="/admin" className="text-blue-500 hover:underline">/admin</Link></p>
          </div>
        )}
      </div>
    </div>
  );
}