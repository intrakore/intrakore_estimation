import React, { useState, useEffect } from 'react';
import { useFrappePostCall, useFrappeGetCall } from 'frappe-react-sdk';
import { Card, Button, FormLabel, TextInput, Select, Alert } from '@rtcamp/frappe-ui-react';
import { Link, FileText } from 'lucide-react';

export default function BidWizard({ onComplete }) {
  const [bidType, setBidType] = useState('crm');
  const [opportunities, setOpportunities] = useState([]);
  const [formData, setFormData] = useState({
    source: 'CRM-linked',
    opportunity: '',
    client_name: '',
    project_name: '',
    bid_code: '',
    submission_date: '',
    lead_estimator: '',
    notes: '',
  });

  const { data: opportunitiesData, isLoading: oppLoading } = useFrappeGetCall(
    'intrakore_estimation.api.get_opportunities',
    {},
    'GET_OPPORTUNITIES',
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (opportunitiesData?.message) {
      setOpportunities(opportunitiesData.message);
    }
  }, [opportunitiesData]);

  const { call: createBid, loading, error } = useFrappePostCall('intrakore_estimation.api.create_bid');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      source: bidType === 'crm' ? 'CRM-linked' : 'Standalone',
      client_name: bidType === 'standalone' ? formData.client_name : undefined,
      opportunity: bidType === 'crm' ? formData.opportunity : undefined,
    };
    
    const result = await createBid(submitData);
    if (result.message) {
      onComplete(result.message);
      window.location.href = '/bid/path';
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>New Bid</h2>

          {/* Bid Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setBidType('crm')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                bidType === 'crm' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: bidType === 'crm' ? 'rgba(59, 126, 246, 0.05)' : 'var(--surface-white)' }}
            >
              <Link className="w-5 h-5 mb-2" style={{ color: bidType === 'crm' ? 'var(--primary, #3b7ef6)' : 'var(--ink-gray-4)' }} />
              <div className="font-medium" style={{ color: bidType === 'crm' ? 'var(--primary, #3b7ef6)' : 'var(--ink-gray-7)' }}>
                CRM-linked
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--ink-gray-5)' }}>Tied to an Opportunity in CRM</div>
            </div>
            <div
              onClick={() => setBidType('standalone')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                bidType === 'standalone' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: bidType === 'standalone' ? 'rgba(59, 126, 246, 0.05)' : 'var(--surface-white)' }}
            >
              <FileText className="w-5 h-5 mb-2" style={{ color: bidType === 'standalone' ? 'var(--primary, #3b7ef6)' : 'var(--ink-gray-4)' }} />
              <div className="font-medium" style={{ color: bidType === 'standalone' ? 'var(--primary, #3b7ef6)' : 'var(--ink-gray-7)' }}>
                Standalone
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--ink-gray-5)' }}>Private/walk-in client, no CRM record</div>
            </div>
          </div>

          {/* Conditional Fields */}
          {bidType === 'crm' ? (
            <div>
              <FormLabel label="Opportunity" required />
              <Select
                value={formData.opportunity}
                onChange={(value) => setFormData({ ...formData, opportunity: value })}
                options={opportunities.map(opp => ({ value: opp.name, label: `${opp.name} · ${opp.customer_name || opp.title}` }))}
                placeholder={oppLoading ? "Loading opportunities..." : "Select an opportunity"}
                required
              />
              <div className="text-xs mt-2" style={{ color: 'var(--ink-gray-5)' }}>
                Don't see the opportunity? <a href="#" className="text-blue-600 hover:underline">+ Create new opportunity inline</a>
              </div>
            </div>
          ) : (
            <div>
              <FormLabel label="Client Name" required />
              <TextInput
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="e.g. Mr. Mohammed Al Rostamani"
                required
              />
            </div>
          )}

          {/* Project Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel label="Project Name" required />
              <TextInput
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="e.g. Marina Crest Tower — Core & Shell"
                required
              />
            </div>
            <div>
              <FormLabel label="Bid Code" />
              <TextInput
                value={formData.bid_code}
                onChange={(e) => setFormData({ ...formData, bid_code: e.target.value })}
                placeholder="INT-26-XXX"
              />
              <div className="text-xs mt-1" style={{ color: 'var(--ink-gray-5)' }}>Auto-generated if left blank</div>
            </div>
          </div>

          {/* Dates and Estimator */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel label="Submission Deadline" required />
              <TextInput
                type="date"
                value={formData.submission_date}
                onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
                required
              />
            </div>
            <div>
              <FormLabel label="Lead Estimator" required />
              <Select
                value={formData.lead_estimator}
                onChange={(value) => setFormData({ ...formData, lead_estimator: value })}
                options={[
                  { value: 'Ravi K.', label: 'Ravi K.' },
                  { value: 'Priya S.', label: 'Priya S.' },
                  { value: 'Hamza A.', label: 'Hamza A.' },
                ]}
                placeholder="Select lead estimator"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <FormLabel label="Notes (optional)" />
            <textarea
              className="w-full p-2 rounded-lg border resize-none focus:outline-none focus:border-blue-500 transition-colors"
              rows="3"
              placeholder="Site visit notes, client preferences, scope clarifications…"
              style={{
                backgroundColor: 'var(--surface-white)',
                borderColor: 'var(--outline-gray-1)',
                color: 'var(--ink-gray-8)',
              }}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {error && (
            <Alert theme="error">
              {error.message || 'Failed to create bid'}
            </Alert>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3" style={{ backgroundColor: 'var(--surface-gray-2)', borderColor: 'var(--outline-gray-1)' }}>
          <Button variant="outline" onClick={() => window.location.href = '/bids'}>
            Cancel
          </Button>
          <Button type="submit" variant="solid" theme="primary" loading={loading}>
            Create Bid →
          </Button>
        </div>
      </form>
    </Card>
  );
}
