import React, { useState } from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Card, Button, Badge, Alert, FeatherIcon } from '@rtcamp/frappe-ui-react';
import { Activity, Users, Briefcase, CheckSquare, TrendingUp, RefreshCw, Plus, FileText, Settings } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const { data: statsData, isLoading: statsLoading } = useFrappeGetCall(
    'intrakore_estimation.api.get_dashboard_stats',
    {},
    'DASHBOARD_STATS'
  );

  const stats = statsData?.message || {
    total_leads: 0,
    active_deals: 0,
    tasks_due: 0,
    conversion_rate: 0
  };

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
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Welcome to Intrakore CRM</h1>
        <p className="mt-2" style={{ color: 'var(--ink-gray-5)' }}>Manage your customer relationships efficiently</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Total Leads</div>
              <Users className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>
              {statsLoading ? '-' : stats.total_leads}
            </div>
            <Badge theme="success" size="sm" className="mt-2">+12% this month</Badge>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Active Deals</div>
              <Briefcase className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>
              {statsLoading ? '-' : stats.active_deals}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-gray-3)' }}>
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.conversion_rate || 0}%` }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Tasks Due</div>
              <CheckSquare className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>
              {statsLoading ? '-' : stats.tasks_due}
            </div>
            <div className="mt-2 text-xs" style={{ color: 'var(--ink-gray-5)' }}>3 overdue</div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>Conversion Rate</div>
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>
              {statsLoading ? '-' : `${stats.conversion_rate}%`}
            </div>
            <div className="flex items-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="text-yellow-500 text-sm">★</span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Test Connection Section */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium" style={{ color: 'var(--ink-gray-8)' }}>Test Backend Connection</h3>
            <Badge theme="gray" size="sm">API Test</Badge>
          </div>
          <p className="mb-4" style={{ color: 'var(--ink-gray-5)' }}>
            Click the button below to test the connection to your Frappe backend.
          </p>
          <Button 
            onClick={testConnection}
            loading={loading}
            variant="solid"
            theme="primary"
          >
            <Activity className="w-4 h-4 mr-2" />
            {loading ? 'Connecting...' : 'Test Connection'}
          </Button>

          {result && (
            <div className="mt-4">
              <Alert 
                title={result.success ? 'Connected Successfully' : 'Connection Failed'} 
                theme={result.success ? 'success' : 'error'}
                closable
                onClose={() => setResult(null)}
              >
                {result.message}
              </Alert>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--ink-gray-8)' }}>Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
