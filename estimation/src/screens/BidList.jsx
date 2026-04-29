import React, { useState } from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { Card, Badge, Button, Alert } from '@rtcamp/frappe-ui-react';
import { RefreshCw, Plus, Search, Inbox, ChevronRight, FileText, ArrowRightLeft, Tags, Calculator, TrendingUp, Eye, Send, Trophy, XCircle } from 'lucide-react';

const statusConfig = {
  Draft: { theme: 'gray', icon: FileText },
  Mapping: { theme: 'amber', icon: ArrowRightLeft },
  Tagging: { theme: 'purple', icon: Tags },
  Pricing: { theme: 'blue', icon: Calculator },
  Strategy: { theme: 'indigo', icon: TrendingUp },
  Review: { theme: 'orange', icon: Eye },
  Submitted: { theme: 'green', icon: Send },
  Won: { theme: 'success', icon: Trophy },
  Lost: { theme: 'red', icon: XCircle },
};

export default function BidList({ onSelectBid }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: bidsData, isLoading, error, mutate } = useFrappeGetCall(
    'intrakore_estimation.api.get_bids',
    {},
    'GET_BIDS',
    { revalidateOnFocus: false }
  );

  const bids = bidsData?.message || [];

  const filteredBids = bids.filter(bid => {
    if (filter !== 'all' && bid.status !== filter) return false;
    if (search && !bid.project_name?.toLowerCase().includes(search.toLowerCase()) &&
        !bid.client_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = bids.reduce((acc, bid) => {
    acc[bid.status] = (acc[bid.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert theme="error">
        Failed to load bids: {error.message}
      </Alert>
    );
  }

  const IconComponent = ({ icon: Icon, className }) => Icon && <Icon className={className} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Estimation</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>Active bids, standalones, and CRM-linked opportunities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => mutate()}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button variant="solid" theme="primary" onClick={() => onSelectBid(null)}>
            <Plus className="w-4 h-4 mr-2" />
            New Bid
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {['all', 'Draft', 'Mapping', 'Tagging', 'Pricing', 'Review', 'Submitted'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status.toLowerCase())}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === status.toLowerCase()
                  ? 'bg-blue-600 text-white'
                  : 'border hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: filter === status.toLowerCase() ? undefined : 'var(--surface-white)',
                borderColor: 'var(--outline-gray-1)',
                color: filter === status.toLowerCase() ? 'white' : 'var(--ink-gray-6)',
              }}
            >
              {status === 'all' ? 'All' : status} ({counts[status] || 0})
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-gray-4)' }} />
          <input
            type="text"
            placeholder="Search bids, clients, projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border w-72 text-sm"
            style={{
              backgroundColor: 'var(--surface-white)',
              borderColor: 'var(--outline-gray-1)',
              color: 'var(--ink-gray-8)',
            }}
          />
        </div>
      </div>

      {/* Bid Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--surface-gray-2)', borderColor: 'var(--outline-gray-1)' }}>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-gray-5)' }}>Bid Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-gray-5)' }}>Project / Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-gray-5)' }}>Source</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-gray-5)' }}>Bid Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-gray-5)' }}>Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-gray-5)' }}>Lead Estimator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-gray-5)' }}>Stage</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredBids.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12" style={{ color: 'var(--ink-gray-5)' }}>
                    <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    No bids found
                  </td>
                </tr>
              ) : (
                filteredBids.map((bid) => {
                  const status = statusConfig[bid.status] || statusConfig.Draft;
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={bid.name}
                      onClick={() => {
                        onSelectBid(bid);
                        if (bid.status === 'Draft') window.location.href = '/bid/path';
                        else if (bid.status === 'Mapping') window.location.href = '/bid/upload';
                        else if (bid.status === 'Tagging') window.location.href = '/bid/tagging';
                        else if (bid.status === 'Pricing') window.location.href = '/bid/pricing';
                        else if (bid.status === 'Strategy') window.location.href = '/bid/strategy';
                        else if (bid.status === 'Review') window.location.href = '/bid/review-submit';
                        else window.location.href = '/bids';
                      }}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: '1px solid var(--outline-gray-1)' }}
                    >
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-gray-2)', color: 'var(--ink-gray-6)' }}>
                          {bid.bid_code}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: 'var(--ink-gray-8)' }}>{bid.project_name}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--ink-gray-5)' }}>{bid.client_name}</div>
                      </td>
                      <td className="px-4 py-3">
                        {bid.source === 'CRM-linked' ? (
                          <Badge theme="blue" size="xs">CRM-linked</Badge>
                        ) : (
                          <Badge theme="gray" size="xs">Standalone</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: 'var(--ink-gray-8)' }}>
                        AED {bid.total_priced_value?.toLocaleString() || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--ink-gray-7)' }}>
                        {bid.submission_date || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--ink-gray-7)' }}>
                        {bid.lead_estimator_name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge theme={status.theme} size="sm">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {bid.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--ink-gray-4)' }} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
