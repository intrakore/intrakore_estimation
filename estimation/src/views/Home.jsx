import { useState } from 'react';
import { Card, Button, Alert, Badge, Progress, Rating, FeatherIcon, useFrappeCall } from 'intrakore-ui';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/method/frappe.ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setResult({ success: true, message: data.message || 'Connected successfully!' });
    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Home Page</h1>
        <p className="mt-2" style={{ color: 'var(--ink-gray-5)' }}>Welcome to your Intrakore dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Total Leads</div>
              <FeatherIcon name="users" className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>0</div>
            <Badge theme="success" size="sm" className="mt-2">+12% this month</Badge>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Active Deals</div>
              <FeatherIcon name="briefcase" className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>0</div>
            <Progress value={65} size="sm" className="mt-2" />
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Tasks Due</div>
              <FeatherIcon name="check-square" className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>0</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Conversion Rate</div>
              <FeatherIcon name="trending-up" className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>0%</div>
            <Rating value={0} max={5} size="sm" className="mt-2" />
          </div>
        </Card>
      </div>

      <Card className="mb-8">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--ink-gray-8)' }}>Test Backend Connection</h3>
          <p className="mb-4" style={{ color: 'var(--ink-gray-5)' }}>Click the button to test connection to your Frappe backend.</p>
          <Button onClick={testConnection} loading={loading} variant="solid" theme="primary">
            <FeatherIcon name="activity" className="w-4 h-4 mr-2" />
            {loading ? 'Connecting...' : 'Test Connection'}
          </Button>
          {result && (
            <div className="mt-4">
              <Alert title={result.success ? 'Connected Successfully' : 'Connection Failed'} theme={result.success ? 'success' : 'error'}>
                {result.message}
              </Alert>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--ink-gray-8)' }}>Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline"><FeatherIcon name="user-plus" className="w-4 h-4 mr-2" />Add Lead</Button>
            <Button variant="outline"><FeatherIcon name="file-text" className="w-4 h-4 mr-2" />Generate Report</Button>
            <Button variant="outline"><FeatherIcon name="settings" className="w-4 h-4 mr-2" />Settings</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
