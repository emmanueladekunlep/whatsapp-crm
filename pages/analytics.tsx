 import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/analytics', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setData(data);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">No data available</div>;
  }

  const { summary, last7Days } = data;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">📱 WhatsApp CRM</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-600 text-sm">
              ← Dashboard
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">📊 Analytics Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Customers</p>
            <p className="text-2xl font-bold">{summary.totalCustomers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Messages</p>
            <p className="text-2xl font-bold">{summary.totalMessages}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Quotes</p>
            <p className="text-2xl font-bold">{summary.totalQuotes}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Pending Reminders</p>
            <p className="text-2xl font-bold">{summary.pendingReminders}</p>
          </div>
        </div>

        {/* Message Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Message Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Incoming</span>
                <span className="font-bold text-blue-500">{summary.incomingMessages}</span>
              </div>
              <div className="flex justify-between">
                <span>Outgoing</span>
                <span className="font-bold text-green-500">{summary.outgoingMessages}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total</span>
                <span className="font-bold">{summary.totalMessages}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Last 7 Days Activity</h3>
            <div className="space-y-1">
              {last7Days.map((day: any) => (
                <div key={day.date} className="flex justify-between text-sm">
                  <span>{day.date}</span>
                  <span className="font-medium">{day.messages} messages</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/customers">
              <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                Manage Customers
              </button>
            </Link>
            <Link href="/quotes">
              <button className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600">
                View Quotes
              </button>
            </Link>
            <Link href="/reminders">
              <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
                View Reminders
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
