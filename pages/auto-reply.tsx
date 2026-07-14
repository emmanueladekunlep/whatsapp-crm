 import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface ReplyRule {
  id: number;
  trigger_keyword: string;
  reply_message: string;
  match_type: string;
  is_active: boolean;
  created_at: string;
}

export default function AutoReplyPage() {
  const router = useRouter();
  const [rules, setRules] = useState<ReplyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    trigger_keyword: '',
    reply_message: '',
    match_type: 'contains'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auto-reply', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setRules(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const token = localStorage.getItem('token');
    const res = await fetch('/api/auto-reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✅ Auto-reply rule created!');
      setFormData({ trigger_keyword: '', reply_message: '', match_type: 'contains' });
      setShowModal(false);
      fetchRules();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(data.error || 'Failed to create rule');
    }
  };

  const toggleRule = async (id: number, currentStatus: boolean) => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/auto-reply', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id,
        is_active: !currentStatus
      })
    });

    if (res.ok) {
      fetchRules();
    }
  };

  const deleteRule = async (id: number) => {
    if (!confirm('Delete this auto-reply rule?')) return;

    const token = localStorage.getItem('token');
    const res = await fetch('/api/auto-reply', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id })
    });

    if (res.ok) {
      fetchRules();
      setMessage('✅ Rule deleted');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🤖 Auto-Reply Rules</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600"
          >
            + New Rule
          </button>
        </div>

        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
            {message}
          </div>
        )}

        {rules.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">No Auto-Reply Rules</h3>
            <p className="text-gray-500">Create rules to automatically reply to customers</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reply</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-6 py-4 font-medium">{rule.trigger_keyword}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {rule.reply_message}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {rule.match_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        rule.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {rule.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-x-1">
                      <button
                        onClick={() => toggleRule(rule.id, rule.is_active)}
                        className={`px-3 py-1 rounded text-xs ${
                          rule.is_active 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {rule.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Create Auto-Reply Rule</h3>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trigger Keyword *
                  </label>
                  <input
                    type="text"
                    name="trigger_keyword"
                    value={formData.trigger_keyword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="hello, price, help"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reply Message *
                  </label>
                  <textarea
                    name="reply_message"
                    value={formData.reply_message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Hello! How can I help you today?"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Match Type
                  </label>
                  <select
                    name="match_type"
                    value={formData.match_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="contains">Contains</option>
                    <option value="exact">Exact Match</option>
                    <option value="starts_with">Starts With</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600"
                  >
                    Create Rule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
