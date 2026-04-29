import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePutCall } from 'frappe-react-sdk';
import { Card, Button, Badge, Alert } from '@rtcamp/frappe-ui-react';
import { Zap, Search, Inbox, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PackageTagging({ bid }) {
  const [filter, setFilter] = useState('all');
  
  const { data: linesData, isLoading, mutate } = useFrappeGetCall(
    'intrakore_estimation.api.get_untagged_lines',
    { bid_id: bid?.name },
    'UNTAGGED_LINES',
    { revalidateOnFocus: false }
  );

  const { call: updateLineTag } = useFrappePutCall('intrakore_estimation.api.update_line_package');

  const { data: packagesData } = useFrappeGetCall(
    'intrakore_estimation.api.get_packages',
    {},
    'PACKAGES'
  );

  const steps = ['Upload BOQ', 'Review Import', 'Package Tagging', 'Pricing', 'Bid Strategy', 'Review & Submit', 'Export'];
  const currentStep = 2;

  const lines = linesData?.message || [];
  const packages = packagesData?.message || [];

  const untaggedCount = lines.filter(l => !l.package).length;
  const taggedCount = lines.length - untaggedCount;
  const needsAttention = lines.filter(l => l.ai_confidence < 70 && !l.package).length;

  const filteredLines = lines.filter(line => {
    if (filter === 'all') return true;
    if (filter === 'attention') return !line.package && line.ai_confidence < 70;
    if (filter === 'untagged') return !line.package;
    if (filter === 'tagged') return line.package;
    return true;
  });

  const handleTagUpdate = async (lineId, packageName) => {
    await updateLineTag({ line_id: lineId, package: packageName });
    mutate();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Package tagging</h1>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>
            {bid?.bid_code} {bid?.project_name} · {lines.length} line items · {packages.length} packages available
          </div>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/bids'}>
          Save & Exit
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 p-4 rounded-xl flex-wrap" style={{ backgroundColor: 'var(--surface-gray-2)', border: '1px solid var(--outline-gray-1)' }}>
        {steps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
              idx === currentStep ? 'bg-blue-600 text-white font-medium' : 
              idx < currentStep ? 'text-green-600' : 'text-gray-500'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                idx === currentStep ? 'bg-white text-blue-600' : 
                idx < currentStep ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                {idx < currentStep ? '✓' : idx + 1}
              </div>
              {step}
            </div>
            {idx < steps.length - 1 && <div className="w-4 h-px bg-gray-300"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* AI Callout */}
      <Alert theme="purple">
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-purple-500 mt-0.5" />
          <div>
            <strong>Kore tagged {taggedCount} of {lines.length} lines</strong> ({Math.round(taggedCount/lines.length*100)}%). 
            {needsAttention > 0 && (
              <strong className="text-amber-500 ml-1">{needsAttention} lines need attention</strong>
            )}
          </div>
        </div>
      </Alert>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: filter === 'all' ? undefined : 'var(--surface-white)',
              borderColor: 'var(--outline-gray-1)',
              color: filter === 'all' ? 'white' : 'var(--ink-gray-6)',
            }}
          >
            All ({lines.length})
          </button>
          <button
            onClick={() => setFilter('attention')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === 'attention' ? 'bg-amber-500 text-white' : 'border hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: filter === 'attention' ? undefined : 'var(--surface-white)',
              borderColor: 'var(--outline-gray-1)',
              color: filter === 'attention' ? 'white' : 'var(--ink-gray-6)',
            }}
          >
            Needs attention ({needsAttention})
          </button>
          <button
            onClick={() => setFilter('untagged')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === 'untagged' ? 'bg-red-500 text-white' : 'border hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: filter === 'untagged' ? undefined : 'var(--surface-white)',
              borderColor: 'var(--outline-gray-1)',
              color: filter === 'untagged' ? 'white' : 'var(--ink-gray-6)',
            }}
          >
            Untagged ({untaggedCount})
          </button>
          <button
            onClick={() => setFilter('tagged')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === 'tagged' ? 'bg-green-600 text-white' : 'border hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: filter === 'tagged' ? undefined : 'var(--surface-white)',
              borderColor: 'var(--outline-gray-1)',
              color: filter === 'tagged' ? 'white' : 'var(--ink-gray-6)',
            }}
          >
            Tagged ({taggedCount})
          </button>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--ink-gray-4)' }} />
          <input
            type="text"
            placeholder="Search lines..."
            className="pl-9 pr-4 py-2 rounded-lg border w-64 text-sm"
            style={{
              backgroundColor: 'var(--surface-white)',
              borderColor: 'var(--outline-gray-1)',
              color: 'var(--ink-gray-8)',
            }}
          />
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-4 gap-5">
        {/* Lines Table */}
        <Card className="col-span-3 overflow-hidden">
          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--outline-gray-1)' }}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide w-20" style={{ color: 'var(--ink-gray-5)' }}>Item</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-gray-5)' }}>Description</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide w-16" style={{ color: 'var(--ink-gray-5)' }}>Unit</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide w-20" style={{ color: 'var(--ink-gray-5)' }}>Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide w-48" style={{ color: 'var(--ink-gray-5)' }}>Package</th>
                </tr>
              </thead>
              <tbody>
                {filteredLines.slice(0, 50).map((line, idx) => (
                  <tr key={idx} className={`border-t ${!line.package ? 'bg-amber-50' : ''}`} style={{ borderColor: 'var(--outline-gray-1)' }}>
                    <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--ink-gray-6)' }}>
                      {line.item_ref}
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--ink-gray-8)' }}>
                      {line.description?.substring(0, 60)}
                      {line.description?.length > 60 && '...'}
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--ink-gray-6)' }}>
                      {line.unit || '-'}
                    </td>
                    <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--ink-gray-7)' }}>
                      {line.qty?.toLocaleString() || '-'}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={line.package || ''}
                        onChange={(e) => handleTagUpdate(line.name, e.target.value)}
                        className={`px-2 py-1 rounded text-xs border w-full focus:outline-none focus:border-blue-500 ${
                          !line.package ? 'border-amber-400' : ''
                        }`}
                        style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}
                      >
                        <option value="">— Select package —</option>
                        {packages.map(pkg => (
                          <option key={pkg.name} value={pkg.package_name}>
                            {pkg.package_name}
                          </option>
                        ))}
                      </select>
                      {line.ai_confidence > 70 && line.suggested_package && (
                        <div className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Kore suggested: {line.suggested_package}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredLines.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12" style={{ color: 'var(--ink-gray-5)' }}>
                      <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      No lines to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Package Summary Sidebar */}
        <Card className="col-span-1">
          <div className="p-4">
            <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink-gray-8)' }}>
              Packages used
            </h4>
            <div className="space-y-2 text-sm max-h-[500px] overflow-y-auto">
              {packages.slice(0, 15).map(pkg => {
                const count = lines.filter(l => l.package === pkg.package_name).length;
                return (
                  <div key={pkg.name} className="flex justify-between items-center">
                    <span style={{ color: 'var(--ink-gray-7)' }}>{pkg.package_name}</span>
                    <Badge theme="gray" size="xs">{count}</Badge>
                  </div>
                );
              })}
              
              <div className="pt-2 mt-2 border-t" style={{ borderColor: 'var(--outline-gray-1)' }}>
                <div className="flex justify-between items-center text-amber-600">
                  <span className="font-medium">⚠ Untagged</span>
                  <Badge theme="amber" size="xs">{untaggedCount}</Badge>
                </div>
              </div>
              
              <div className="pt-2 flex justify-between items-center font-semibold" style={{ color: 'var(--ink-gray-8)' }}>
                <span>Total lines</span>
                <Badge theme="gray" size="sm">{lines.length}</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
        <Button variant="outline" onClick={() => window.location.href = '/bid/review'}>
          ← Back
        </Button>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>
            {untaggedCount > 0 
              ? `${untaggedCount} lines still need tagging.`
              : 'All lines tagged — ready for pricing'}
          </span>
          <Button 
            variant="solid" 
            theme="primary" 
            disabled={untaggedCount > 0}
            onClick={() => window.location.href = '/bid/pricing'}
          >
            Continue to pricing →
          </Button>
        </div>
      </div>
    </div>
  );
}
