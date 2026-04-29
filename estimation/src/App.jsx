import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Button, Card, Alert } from '@rtcamp/frappe-ui-react';
import { LogOut } from 'lucide-react';
import './index.css';

import BidList from './screens/BidList';
import BidWizard from './screens/BidWizard';
import BidPathSelector from './screens/BidPathSelector';
import BOQUpload from './screens/BOQUpload';
import ReviewImport from './screens/ReviewImport';
import PackageTagging from './screens/PackageTagging';
import Pricing from './screens/Pricing';
import BidStrategy from './screens/BidStrategy';
import ReviewSubmit from './screens/ReviewSubmit';
import Export from './screens/Export';

function Layout({ children }) {
  const { currentUser, logout } = useFrappeAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbs = {
    '/bids': 'Estimation',
    '/bid/new': 'New Bid',
    '/bid/path': 'Choose Path',
    '/bid/upload': 'Upload BOQ',
    '/bid/review': 'Review Import',
    '/bid/tagging': 'Package Tagging',
    '/bid/pricing': 'Pricing',
    '/bid/strategy': 'Bid Strategy',
    '/bid/review-submit': 'Review & Submit',
    '/bid/export': 'Export',
  };

  const title = breadcrumbs[location.pathname] || 'Estimation';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-gray-1)' }}>
      <div className="border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}>
        <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div 
              onClick={() => navigate('/bids')}
              className="cursor-pointer w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm"
            >
              IK
            </div>
            <span className="text-xs uppercase tracking-wide text-gray-500">Operations / Bid /</span>
            <span className="text-sm font-medium" style={{ color: 'var(--ink-gray-8)' }}>{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {currentUser?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm">{currentUser || 'Guest'}</span>
            </div>
            {currentUser && (
              <button
                onClick={logout}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
}

function LoginPage() {
  const { login, currentUser } = useFrappeAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (currentUser) navigate('/bids');
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            <p className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Sign in to Intrakore Estimation</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-gray-7)' }}>Username / Email</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--surface-white)',
                  borderColor: 'var(--outline-gray-1)',
                  color: 'var(--ink-gray-8)',
                }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-gray-7)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--surface-white)',
                  borderColor: 'var(--outline-gray-1)',
                  color: 'var(--ink-gray-8)',
                }}
                required
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg text-white font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

function AppRoutes() {
  const { currentUser, isValidating } = useFrappeAuth();
  const [currentBid, setCurrentBid] = useState(null);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/bids" />} />
      <Route path="/bids" element={<Layout><BidList onSelectBid={setCurrentBid} /></Layout>} />
      <Route path="/bid/new" element={<Layout><BidWizard onComplete={setCurrentBid} /></Layout>} />
      <Route path="/bid/path" element={<Layout><BidPathSelector bid={currentBid} /></Layout>} />
      <Route path="/bid/upload" element={<Layout><BOQUpload bid={currentBid} /></Layout>} />
      <Route path="/bid/review" element={<Layout><ReviewImport bid={currentBid} /></Layout>} />
      <Route path="/bid/tagging" element={<Layout><PackageTagging bid={currentBid} /></Layout>} />
      <Route path="/bid/pricing" element={<Layout><Pricing bid={currentBid} /></Layout>} />
      <Route path="/bid/strategy" element={<Layout><BidStrategy bid={currentBid} /></Layout>} />
      <Route path="/bid/review-submit" element={<Layout><ReviewSubmit bid={currentBid} /></Layout>} />
      <Route path="/bid/export" element={<Layout><Export bid={currentBid} /></Layout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
