import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  email: string;
  business_name: string;
  phone: string;
  is_active: number;
  created_at: string;
  expiry_date: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is admin (only your email)
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.email === 'emmanueladekunlep@gmail.com') {
        setIsAuthorized(true);
        fetchUsers();
      } else {
        // Not admin - redirect to dashboard
        router.push('/dashboard');
      }
    } else {
      router.push('/login');
    }
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  const activateUser = async (userId: number, months: number) => {
    setMessage('Processing...');
    const res = await fetch('/api/admin/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, months })
    });
    
    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ ${data.message}`);
      fetchUsers();
    } else {
      setMessage(`❌ ${data.error}`);
    }
    setTimeout(() => setMessage(''), 5000);
  };

  const resetPassword = async (userId: number) => {
    const newPassword = prompt('Enter new temporary password for this user (min 6 characters):');
    
    if (!newPassword) return;
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setMessage('Processing...');
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword })
    });
    
    const data = await res.json();
    if (res.ok) {
      setMessage(`✅ Password reset successfully!`);
      alert(`✅ Password reset successful!\n\nNew password: ${newPassword}\n\nSend this to the user.`);
      fetchUsers();
    } else {
      setMessage(`❌ ${data.error}`);
    }
    setTimeout(() => setMessage(''), 5000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!isAuthorized) {
    return <div className="p-8 text-center">Access denied. Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">👋 Admin Dashboard</h1>
          <div className="text-sm text-gray-600">
            Total Users: {users.length} | Active: {users.filter(u => u.is_active).length}
          </div>
        </div>

        {message && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm">#{user.id}</td>
                  <td className="px-6 py-4 font-medium">{user.business_name}</td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(user.expiry_date)}</td>
                  <td className="px-6 py-4 space-x-1">
                    {!user.is_active ? (
                      <>
                        <button 
                          onClick={() => activateUser(user.id, 1)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          1M
                        </button>
                        <button 
                          onClick={() => activateUser(user.id, 3)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                        >
                          3M
                        </button>
                        <button 
                          onClick={() => activateUser(user.id, 12)}
                          className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600"
                        >
                          1Y
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => activateUser(user.id, 0)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Deactivate
                      </button>
                    )}
                    <button 
                      onClick={() => resetPassword(user.id)}
                      className="bg-orange-500 text-white px-3 py-1 rounded text-xs hover:bg-orange-600"
                    >
                      Reset PW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>🔑 Admin: emmanueladekunlep@gmail.com</p>
          <p className="mt-1">💡 To activate a user: They pay → You click 1M/3M/1Y → They get access</p>
          <p className="mt-1">📱 Admin Contact: 07032977572</p>
        </div>
      </div>
    </div>
  );
}