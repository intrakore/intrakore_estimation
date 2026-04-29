import { useState } from 'react';
import { Card, Button, FormLabel, TextInput, Alert, FeatherIcon, useAuth } from 'intrakore-ui';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
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
            <h2 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Welcome Back</h2>
            <p className="mt-2" style={{ color: 'var(--ink-gray-5)' }}>Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <FormLabel label="Username" required />
              <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your username" size="md" block />
            </div>
            <div>
              <FormLabel label="Password" required />
              <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" size="md" block />
            </div>
            <Button type="submit" variant="solid" theme="primary" block loading={loading}>
              <FeatherIcon name="log-in" className="w-4 h-4 mr-2" />Sign In
            </Button>
          </form>
          {error && (
            <div className="mt-4">
              <Alert theme="error" size="sm">{error}</Alert>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
