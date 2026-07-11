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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchCounts(token);
    setLoading(false);
  }, []);

  const fetchCounts = async (token: string) => {
    try {
      // Get customers count
      const customersRes = await fetch('/api/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (customersRes.ok) {
        const data = await customersRes.json();
        setCustomerCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
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
      {/* Navigation */}
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">📱 WhatsApp CRM</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.business_name}</span>
            <Link href="/profile" className="text-blue-500 hover:text-blue-600 text-sm">
              👤 Profile
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user?.business_name}! 👋</h2>
          <div className="flex flex-wrap gap-4 mt-2">
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
          </div>
          {!user?.is_active && (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-lg">
              ⚠️ Your account is inactive. Contact admin to activate.
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        </div>

        {/* Quick Actions - ALL WORKING BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Link href="/customers">
            <button className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2">
              <span className="text-xl">➕</span> Add Customer
            </button>
          </Link>

          <Link href="/customers">
            <button className="w-full bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 transition flex items-center justify-center gap-2">
              <span className="text-xl">📋</span> View Customers
            </button>
          </Link>

          <Link href="/reminders">
            <button className="w-full bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2">
              <span className="text-xl">⏰</span> Add Reminder
            </button>
          </Link>

          <Link href="/quotes">
            <button className="w-full bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition flex items-center justify-center gap-2">
              <span className="text-xl">💰</span> Add Quote
            </button>
          </Link>
        </div>

        {/* Quick Action Buttons for Tags and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link href="/customers">
            <button className="w-full bg-pink-500 text-white px-4 py-3 rounded-lg hover:bg-pink-600 transition flex items-center justify-center gap-2">
              <span className="text-xl">🏷️</span> Manage Tags
            </button>
          </Link>

          <Link href="/customers">
            <button className="w-full bg-teal-500 text-white px-4 py-3 rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-2">
              <span className="text-xl">📝</span> Add Notes
            </button>
          </Link>
        </div>

        {/* Recent Activity / Help Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-3">💡 Quick Tips</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Click <strong>"Add Customer"</strong> to save a new customer</li>
            <li>• Click <strong>"View Customers"</strong> to see all your customers</li>
            <li>• Click <strong>"Add Reminder"</strong> to set follow-up reminders</li>
            <li>• Click <strong>"Add Quote"</strong> to save quotes for customers</li>
            <li>• Go to <strong>Profile</strong> to change your password</li>
          </ul>
        </div>

        {/* Admin Link */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔑 Admin Panel: <Link href="/admin" className="text-blue-500 hover:underline">/admin</Link></p>
        </div>
      </div>
    </div>
  );
}