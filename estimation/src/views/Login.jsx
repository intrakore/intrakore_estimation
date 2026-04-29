import React, { useState } from 'react';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Card, Button, Alert } from '@rtcamp/frappe-ui-react';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login, currentUser } = useFrappeAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (currentUser) {
      window.location.href = '/bids';
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--surface-gray-1)' }}>
      <Card className="w-full max-w-md">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              IK
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--ink-gray-9)' }}>Welcome Back</h2>
            <p className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-gray-7)' }}>Username / Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--surface-white)',
                  borderColor: 'var(--outline-gray-1)',
                  color: 'var(--ink-gray-8)',
                }}
                placeholder="Enter your username or email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-gray-7)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:border-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--surface-white)',
                  borderColor: 'var(--outline-gray-1)',
                  color: 'var(--ink-gray-8)',
                }}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <Alert theme="error" size="sm">
                {error}
              </Alert>
            )}

            <Button 
              type="submit" 
              variant="solid" 
              theme="primary" 
              block 
              loading={loading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs" style={{ color: 'var(--ink-gray-5)' }}>
            Don't have an account? Contact your system administrator
          </div>
        </div>
      </Card>
    </div>
  );
}
