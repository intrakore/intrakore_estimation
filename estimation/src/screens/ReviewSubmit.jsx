import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { Card, Button, Badge, Alert, FeatherIcon } from '@rtcamp/frappe-ui-react';

export default function ReviewSubmit({ bid }) {
  const [showPreflight, setShowPreflight] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { data: bidData, isLoading, mutate } = useFrappeGetCall(
    'intrakore_estimation.api.get_bid_for_review',
    { bid_id: bid?.name },
    'BID_REVIEW',
    { revalidateOnFocus: false }
  );

  const { call: submitBid } = useFrappePostCall('intrakore_estimation.api.submit_bid');

  const steps = ['Upload BOQ', 'Review Import', 'Package Tagging', 'Pricing', 'Bid Strategy', 'Review & Submit', 'Export'];
  const currentStep = 5;

  const summary = bidData?.message || { 
    total: 32826753, 
    packages: [
      { name: 'Prelims', cost: 1840000, margin_pct: 0, cont_pct: 2.0, total: 1876800 },
      { name: 'Substructure', cost: 3460000, margin_pct: 11.8, cont_pct: 3.5, total: 3989380 },
      { name: 'Superstructure', cost: 7286400, margin_pct: 12.4, cont_pct: 3.4, total: 8438172 },
      { name: 'Façade & Cladding', cost: 5254000, margin_pct: 10.5, cont_pct: 4.5, total: 6042100 },
      { name: 'Roofing & Waterproofing', cost: 410000, margin_pct: 14.0, cont_pct: 5.0, total: 487900 },
      { name: 'Internal Finishes', cost: 3640000, margin_pct: 13.0, cont_pct: 3.5, total: 4240600 },
      { name: 'Joinery', cost: 2140000, margin_pct: 14.5, cont_pct: 4.0, total: 2535900 },
      { name: 'MEP Mechanical', cost: 1920000, margin_pct: 10.0, cont_pct: 3.0, total: 2179200 },
      { name: 'MEP Electrical', cost: 1180000, margin_pct: 10.0, cont_pct: 3.0, total: 1339400 },
      { name: 'MEP Plumbing', cost: 560000, margin_pct: 10.0, cont_pct: 3.0, total: 635600 },
    ]
  };

  const preflight = {
    passed: 3,
    warnings: 1,
    errors: 2,
    items: [
      { type: 'pass', text: 'All 218 lines tagged to a package. Provisional Sums (3) and PC Sums (1) flagged separately per FIDIC.' },
      { type: 'pass', text: 'Bid total reconciles to priced BOQ. AED 32,826,753 incl. AED 800,653 bid acquisition cost.' },
      { type: 'pass', text: '215 of 218 lines confirmed by estimator. Confirmed lines lock at submission.' },
      { type: 'warn', text: 'Bid acquisition cost set at 2.5%. Above the 2.0% standard for residential towers — CM will see and may adjust.' },
      { type: 'error', text: '3 lines unpriced. 3.2.3 Fire protection · 4.6.1 Bespoke joinery · 5.1.2 BMS integration.' },
      { type: 'error', text: 'Missing standard qualification: extended preliminaries. Present on your last 6 tower bids ≥ AED 25M.' }
    ]
  };

  const qualifications = [
    { type: 'standard', text: 'Subject to formwork access by main contractor; assumes 2 reuses minimum.', attached: '3.1.1, 3.1.2, 3.1.4' },
    { type: 'standard', text: 'Assumes uninterrupted concrete pour cycles. Standby crew costs in event of delay are reimbursable.', attached: 'Substructure, Superstructure' },
    { type: 'standard', text: 'Excludes asbestos removal and any contaminated material handling.', attached: 'Bid-level' },
    { type: 'bid', text: 'Façade rate held for 60 days; subject to AED/EUR rate as at 24 Apr 2026.', attached: 'Façade & Cladding' },
    { type: 'bid', text: 'MEP rates exclude any specialist commissioning beyond basic T&C.', attached: 'MEP packages' },
  ];

  const suggestedQualification = {
    text: 'Extended preliminaries — programme extension beyond contract date reimbursable at AED 12,500/day.',
    attached: 'Suggested by Kore — standard on your last 6 tower bids ≥ AED 25M.'
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitBid({ bid_id: bid?.name });
      window.location.href = '/bids';
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Review & submit</h1>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>
            Final check before CM review
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/bid/export'}>
            ⊟ Preview bid
          </Button>
          <Button variant="solid" theme="primary" onClick={() => window.location.href = '/bid/export'}>
            Continue to export →
          </Button>
        </div>
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

      {/* Pre-flight Strip */}
      <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)', border: '1px solid var(--outline-gray-1)' }}>
        <div className="flex items-center gap-3">
          <Badge theme="green" size="sm">{preflight.passed} ✓</Badge>
          <Badge theme="amber" size="sm">{preflight.warnings} ⚐</Badge>
          <Badge theme="red" size="sm">{preflight.errors} ⚠</Badge>
          <span className="text-sm" style={{ color: 'var(--ink-gray-7)' }}>
            <strong>2 issues to fix.</strong> 3 lines unpriced · qualifications missing
          </span>
        </div>
        <button 
          onClick={() => setShowPreflight(!showPreflight)} 
          className="text-sm text-blue-600 hover:underline"
        >
          View details {showPreflight ? '↑' : '↓'}
        </button>
      </div>

      {showPreflight && (
        <div className="p-3 rounded-lg space-y-2" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
          {preflight.items.map((item, idx) => (
            <div key={idx} className="flex gap-2 text-sm">
              {item.type === 'pass' && <span className="text-green-600">✓</span>}
              {item.type === 'warn' && <span className="text-amber-600">⚐</span>}
              {item.type === 'error' && <span className="text-red-600">⚠</span>}
              <span style={{ color: item.type === 'error' ? 'var(--ink-gray-9)' : 'var(--ink-gray-7)' }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-2 gap-5">
        {/* Bid Summary Table */}
        <Card>
          <div className="p-5">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-gray-8)' }}>Bid summary</h3>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-white)' }}>
                  <tr className="border-b" style={{ borderColor: 'var(--outline-gray-1)' }}>
                    <th className="text-left py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Package</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Cost (AED)</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Margin</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Cont.</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Total (AED)</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.packages.map(pkg => (
                    <tr key={pkg.name} className="border-b" style={{ borderColor: 'var(--outline-gray-1)' }}>
                      <td className="py-2" style={{ color: 'var(--ink-gray-8)' }}>{pkg.name}</td>
                      <td className="text-right font-mono" style={{ color: 'var(--ink-gray-7)' }}>{pkg.cost.toLocaleString()}</td>
                      <td className="text-right">{pkg.margin_pct}%</td>
                      <td className="text-right">{pkg.cont_pct}%</td>
                      <td className="text-right font-mono" style={{ color: 'var(--ink-gray-8)' }}>{pkg.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
                    <td className="py-2 font-semibold">Subtotal</td>
                    <td className="text-right"></td>
                    <td className="text-right"></td>
                    <td className="text-right"></td>
                    <td className="text-right font-mono font-semibold">{summary.packages.reduce((sum, p) => sum + p.total, 0).toLocaleString()}</td>
                  </tr>
                  <tr className="border-t" style={{ backgroundColor: 'rgba(59,126,246,0.05)' }}>
                    <td className="py-2 font-bold">Strategic adjustments</td>
                    <td className="text-right"></td>
                    <td className="text-right"></td>
                    <td className="text-right"></td>
                    <td className="text-right font-mono text-red-600">-140,552</td>
                  </tr>
                  <tr className="border-t" style={{ backgroundColor: 'rgba(59,126,246,0.08)' }}>
                    <td className="py-2 font-bold">Bid acquisition cost</td>
                    <td className="text-right"></td>
                    <td className="text-right"></td>
                    <td className="text-right"></td>
                    <td className="text-right font-mono text-amber-600">+800,653</td>
                  </tr>
                  <tr className="border-t" style={{ backgroundColor: 'rgba(59,126,246,0.12)' }}>
                    <td className="py-2 font-bold text-blue-600">BID TOTAL (excl. VAT)</td>
                    <td className="text-right"></td>
                    <td className="text-right"></td>
                    <td className="text-right"></td>
                    <td className="text-right font-mono font-bold text-blue-600">AED {summary.total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Qualifications */}
        <Card>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--ink-gray-8)' }}>Qualifications & clarifications (8)</h3>
              <Button variant="outline" size="sm">+ Add</Button>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {qualifications.map((qual, idx) => (
                <div key={idx} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)', border: '1px solid var(--outline-gray-1)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <Badge theme={qual.type === 'standard' ? 'gray' : 'blue'} size="xs">
                      {qual.type === 'standard' ? 'Standard' : 'Bid-specific'}
                    </Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                  <div className="text-sm mb-2" style={{ color: 'var(--ink-gray-8)' }}>{qual.text}</div>
                  <div className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
                    Attached to: {qual.attached}
                  </div>
                </div>
              ))}
              
              {/* Suggested Qualification */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.3)' }}>
                <div className="flex justify-between items-start mb-2">
                  <Badge theme="purple" size="xs">Suggested</Badge>
                  <Button variant="solid" size="sm" theme="primary">+ Add</Button>
                </div>
                <div className="text-sm mb-2" style={{ color: 'var(--ink-gray-8)' }}>{suggestedQualification.text}</div>
                <div className="text-xs text-purple-600">{suggestedQualification.attached}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
        <div>
          <Button variant="outline" onClick={() => window.location.href = '/bid/strategy'}>
            ← Back to bid strategy
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>
            <strong>Bid total:</strong> AED {summary.total.toLocaleString()} · Status: Draft
          </span>
          <Button 
            variant="solid" 
            theme="primary" 
            loading={submitting}
            onClick={handleSubmit}
          >
            ↗ Submit for CM Review
          </Button>
        </div>
      </div>
    </div>
  );
}