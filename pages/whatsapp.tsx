 import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function WhatsAppPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [connected, setConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/whatsapp/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setConnected(data.connected);
      setPhoneNumber(data.phoneNumber || '');
    }
  };

  const connectWhatsApp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const token = localStorage.getItem('token');
    const res = await fetch('/api/whatsapp/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok) {
      setQrCode(data.qrCode);
      setMessage('✅ Scan QR code with WhatsApp mobile app');
      // Poll for connection status
      pollStatus();
    } else {
      setError(data.error || 'Failed to connect');
    }
    setLoading(false);
  };

  const disconnectWhatsApp = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/whatsapp/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      setConnected(false);
      setPhoneNumber('');
      setQrCode('');
      setMessage('✅ Disconnected successfully');
    }
  };

  const pollStatus = () => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/whatsapp/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.connected) {
          setConnected(true);
          setPhoneNumber(data.phoneNumber || '');
          setQrCode('');
          setMessage('✅ WhatsApp connected successfully!');
          clearInterval(interval);
        }
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 60000);
  };

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

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">📱 WhatsApp Integration</h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
              {message}
            </div>
          )}

          {connected ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp Connected</h3>
              <p className="text-gray-600 mb-2">Phone: <strong>{phoneNumber}</strong></p>
              <button
                onClick={disconnectWhatsApp}
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              {qrCode ? (
                <div>
                  <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}`}
                      alt="QR Code"
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Scan with WhatsApp mobile app → Settings → Linked Devices
                  </p>
                  <button
                    onClick={() => setQrCode('')}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold mb-2">Connect WhatsApp</h3>
                  <p className="text-gray-600 mb-6">
                    Connect your WhatsApp account to send messages to customers
                  </p>
                  <button
                    onClick={connectWhatsApp}
                    disabled={loading}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Connect WhatsApp'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Send messages to customers directly</li>
              <li>• Auto-reply to incoming messages</li>
              <li>• Track conversation history</li>
              <li>• Send reminders and proposals via WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
