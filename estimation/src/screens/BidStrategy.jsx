import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePutCall } from 'frappe-react-sdk';
import { Card, Button, Alert, FeatherIcon } from '@rtcamp/frappe-ui-react';

export default function BidStrategy({ bid }) {
  const [acquisitionMethod, setAcquisitionMethod] = useState('percentage');
  const [acquisitionRate, setAcquisitionRate] = useState(2.5);
  const [contingencyReduction, setContingencyReduction] = useState(0.5);
  const [marginReduction, setMarginReduction] = useState(0);
  
  const { data: bidData, isLoading, mutate } = useFrappeGetCall(
    'intrakore_estimation.api.get_bid_summary',
    { bid_id: bid?.name },
    'BID_SUMMARY',
    { revalidateOnFocus: false }
  );

  const { call: updateStrategy, loading } = useFrappePutCall('intrakore_estimation.api.update_bid_strategy');

  const steps = ['Upload BOQ', 'Review Import', 'Package Tagging', 'Pricing', 'Bid Strategy', 'Review & Submit', 'Export'];
  const currentStep = 4;

  const summary = bidData?.message || { 
    total_cost: 28110400, 
    total_margin: 3070884, 
    total_contingency: 985368,
    packages: [
      { name: 'Prelims', cost: 1840000, margin_pct: 0, margin_amt: 0, cont_pct: 2.0, cont_amt: 36800 },
      { name: 'Substructure', cost: 3460000, margin_pct: 11.8, margin_amt: 408280, cont_pct: 3.5, cont_amt: 121100 },
      { name: 'Superstructure', cost: 7286400, margin_pct: 12.4, margin_amt: 904034, cont_pct: 3.4, cont_amt: 247738 },
      { name: 'Façade & Cladding', cost: 5254000, margin_pct: 10.5, margin_amt: 551670, cont_pct: 4.5, cont_amt: 236430 },
      { name: 'Roofing & Waterproofing', cost: 410000, margin_pct: 14.0, margin_amt: 57400, cont_pct: 5.0, cont_amt: 20500 },
      { name: 'Internal Finishes', cost: 3640000, margin_pct: 13.0, margin_amt: 473200, cont_pct: 3.5, cont_amt: 127400 },
      { name: 'Joinery', cost: 2140000, margin_pct: 14.5, margin_amt: 310300, cont_pct: 4.0, cont_amt: 85600 },
    ]
  };

  const pricedTotal = summary.total_cost + summary.total_margin + summary.total_contingency;
  const contingencySave = (pricedTotal * contingencyReduction) / 100;
  const marginSave = (pricedTotal * marginReduction) / 100;
  const acquisitionCost = acquisitionMethod === 'percentage' 
    ? (pricedTotal * acquisitionRate) / 100 
    : acquisitionRate;
  const adjustedTotal = pricedTotal - contingencySave - marginSave;
  const bidTotal = adjustedTotal + acquisitionCost;

  const handleApplyStrategy = async () => {
    await updateStrategy({
      bid_id: bid?.name,
      contingency_reduction: contingencyReduction,
      margin_reduction: marginReduction,
      acquisition_method: acquisitionMethod,
      acquisition_rate: acquisitionRate
    });
    mutate();
  };

  const isAboveThreshold = pricedTotal > 5000000; // AED 5M threshold for demo

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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Bid strategy</h1>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>
            Adjust margins and contingencies at bid level · Apply bid acquisition cost
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/bid/review-submit'}>
            ⊟ Preview bid
          </Button>
          <Button variant="solid" theme="primary" onClick={() => window.location.href = '/bid/review-submit'}>
            Continue to review & submit →
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

      {/* AI Callout */}
      <Alert theme="purple">
        <div className="flex items-start gap-3">
          <span className="text-purple-500">✦</span>
          <div>
            <strong>Your blended margin is 11.4% — 2.1pts below your last 5 bids</strong> (avg 13.5%).
            Façade &amp; Cladding at 10.5% is the main drag. 
            {isAboveThreshold && (
              <span className="text-amber-500 ml-1">This bid exceeds AED 5M — threshold-based approval applies.</span>
            )}
          </div>
        </div>
      </Alert>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-3 gap-5">
        {/* Margin Overview Table */}
        <Card className="col-span-2">
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold" style={{ color: 'var(--ink-gray-8)' }}>Margin overview by package</h3>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/bid/pricing'}>
                ⚙ Apply bid-wide preset
              </Button>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-white)' }}>
                  <tr className="border-b" style={{ borderColor: 'var(--outline-gray-1)' }}>
                    <th className="text-left py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Package</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Cost (AED)</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Margin %</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Margin AED</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Cont. %</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--ink-gray-5)' }}>Cont. AED</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.packages.map(pkg => (
                    <tr key={pkg.name} className="border-b" style={{ borderColor: 'var(--outline-gray-1)' }}>
                      <td className="py-2" style={{ color: 'var(--ink-gray-8)' }}>{pkg.name}</td>
                      <td className="text-right font-mono" style={{ color: 'var(--ink-gray-7)' }}>{pkg.cost.toLocaleString()}</td>
                      <td className="text-right">{pkg.margin_pct}%</td>
                      <td className="text-right font-mono text-green-600">{pkg.margin_amt.toLocaleString()}</td>
                      <td className="text-right">{pkg.cont_pct}%</td>
                      <td className="text-right font-mono" style={{ color: 'var(--ink-gray-7)' }}>{pkg.cont_amt.toLocaleString()}</td>
                    </table>
                  ))}
                  <tr className="font-semibold" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
                    <td className="py-2">Bid total</td>
                    <td className="text-right font-mono">{summary.total_cost.toLocaleString()}</td>
                    <td className="text-right">11.0%</td>
                    <td className="text-right font-mono text-green-600">{summary.total_margin.toLocaleString()}</td>
                    <td className="text-right">3.4%</td>
                    <td className="text-right font-mono">{summary.total_contingency.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Bid Summary Sidebar */}
        <Card className="col-span-1">
          <div className="p-5">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--ink-gray-8)' }}>Bid summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--ink-gray-6)' }}>Total cost</span>
                <span className="font-mono" style={{ color: 'var(--ink-gray-8)' }}>AED {summary.total_cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Margin (wtd 11.0%)</span>
                <span className="font-mono">+{summary.total_margin.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--ink-gray-6)' }}>Contingency (wtd 3.4%)</span>
                <span className="font-mono" style={{ color: 'var(--ink-gray-8)' }}>+{summary.total_contingency.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold" style={{ borderColor: 'var(--outline-gray-1)' }}>
                <span>Priced BOQ</span>
                <span className="font-mono" style={{ color: 'var(--ink-gray-9)' }}>AED {pricedTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Strategic Adjustments */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--outline-gray-1)' }}>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--ink-gray-8)' }}>
                Strategic adjustments
                <button className="w-4 h-4 rounded-full border text-xs flex items-center justify-center" style={{ borderColor: 'var(--outline-gray-2)', color: 'var(--ink-gray-5)' }}>i</button>
              </h4>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: 'var(--ink-gray-6)' }}>Reduce contingency by</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={contingencyReduction}
                      onChange={(e) => setContingencyReduction(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded border text-right text-sm"
                      style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}
                      step="0.5"
                      min="0"
                      max="10"
                    />
                    <span className="text-xs">% of cost</span>
                  </div>
                </div>
                <div className="text-xs text-green-600">
                  Saves AED {contingencySave.toLocaleString()} · Distributed pro-rata across all line contingencies
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: 'var(--ink-gray-6)' }}>Reduce margin by</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={marginReduction}
                      onChange={(e) => setMarginReduction(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded border text-right text-sm"
                      style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}
                      step="0.5"
                      min="0"
                      max="10"
                    />
                    <span className="text-xs">%</span>
                  </div>
                </div>
                <div className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
                  Saves AED {marginSave.toLocaleString()} · Use when contingency exhausted
                </div>
              </div>
            </div>

            {/* Bid Acquisition Cost */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--outline-gray-1)' }}>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--ink-gray-8)' }}>
                Bid Acquisition Cost
                <button className="w-4 h-4 rounded-full border text-xs flex items-center justify-center" style={{ borderColor: 'var(--outline-gray-2)', color: 'var(--ink-gray-5)' }}>i</button>
              </h4>
              
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAcquisitionMethod('percentage')}
                  className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    acquisitionMethod === 'percentage' 
                      ? 'bg-blue-600 text-white' 
                      : 'border hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: acquisitionMethod === 'percentage' ? undefined : 'var(--surface-white)',
                    borderColor: 'var(--outline-gray-1)',
                    color: acquisitionMethod === 'percentage' ? 'white' : 'var(--ink-gray-7)'
                  }}
                >
                  % of value
                </button>
                <button
                  onClick={() => setAcquisitionMethod('fixed')}
                  className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    acquisitionMethod === 'fixed' 
                      ? 'bg-blue-600 text-white' 
                      : 'border hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: acquisitionMethod === 'fixed' ? undefined : 'var(--surface-white)',
                    borderColor: 'var(--outline-gray-1)',
                    color: acquisitionMethod === 'fixed' ? 'white' : 'var(--ink-gray-7)'
                  }}
                >
                  Fixed AED
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  value={acquisitionRate}
                  onChange={(e) => setAcquisitionRate(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 rounded border text-right text-sm"
                  style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}
                  step="0.5"
                  min="0"
                />
                <span className="text-sm">{acquisitionMethod === 'percentage' ? '%' : 'AED'}</span>
              </div>

              <div className="p-2 rounded text-xs flex gap-2" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <span>🔒</span>
                <span>Bid acquisition cost is visible only to CM and Director roles. Hidden from estimators and never shown on the client-facing bid.</span>
              </div>
            </div>

            {/* Final Bid Total */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--outline-gray-1)' }}>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--ink-gray-6)' }}>Priced BOQ</span>
                  <span className="font-mono">AED {pricedTotal.toLocaleString()}</span>
                </div>
                {(contingencyReduction > 0 || marginReduction > 0) && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Strategic reduction</span>
                    <span className="font-mono">-AED {(contingencySave + marginSave).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--ink-gray-6)' }}>Bid acquisition cost @ {acquisitionMethod === 'percentage' ? `${acquisitionRate}%` : `AED ${acquisitionRate}`}</span>
                  <span className="font-mono">+AED {acquisitionCost.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold" style={{ borderColor: 'var(--outline-gray-1)' }}>
                  <span>Bid total</span>
                  <span className="text-blue-600">AED {bidTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="solid" 
              theme="primary" 
              className="w-full mt-4"
              loading={loading}
              onClick={handleApplyStrategy}
            >
              Apply strategy
            </Button>
          </div>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
        <div>
          <Button variant="outline" onClick={() => window.location.href = '/bid/pricing'}>
            ← Back to pricing
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>
            <strong>Bid total:</strong> AED {bidTotal.toLocaleString()} · Status: Draft
          </span>
          <Button variant="solid" theme="primary" onClick={() => window.location.href = '/bid/review-submit'}>
            Continue to review & submit →
          </Button>
        </div>
      </div>
    </div>
  );
}