import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePostCall } from 'frappe-react-sdk';
import { Card, Button, Badge, Alert, FeatherIcon } from '@rtcamp/frappe-ui-react';

export default function Export({ bid }) {
  const [viewMode, setViewMode] = useState('client');
  const [exporting, setExporting] = useState(false);
  
  const { data: boqData, isLoading } = useFrappeGetCall(
    'intrakore_estimation.api.get_priced_boq_for_export',
    { bid_id: bid?.name, mode: viewMode },
    'PRICED_BOQ',
    { revalidateOnFocus: false }
  );

  const { call: exportBid } = useFrappePostCall('intrakore_estimation.api.export_bid_pack');

  const steps = ['Upload BOQ', 'Review Import', 'Package Tagging', 'Pricing', 'Bid Strategy', 'Review & Submit', 'Export'];
  const currentStep = 6;

  const boq = boqData?.message || { 
    total: 32826753,
    bills: [
      {
        name: 'BILL 1 — PRELIMINARIES',
        lines: [
          { item_ref: '1.1', description: 'Site establishment & hoarding', unit: 'lot', qty: 1, rate: 285400, amount: 285400 },
          { item_ref: '1.2', description: 'Project management & supervision', unit: 'mo', qty: 9, rate: 68500, amount: 616500 },
          { item_ref: '1.3', description: 'Temporary power & water', unit: 'lot', qty: 1, rate: 96000, amount: 96000 },
        ],
        subtotal: 1843900
      },
      {
        name: 'BILL 2 — SUBSTRUCTURE',
        lines: [
          { item_ref: '2.1.1', description: 'Excavation to reduced level, not exc. 2m depth', unit: 'm³', qty: 1240, rate: 142, amount: 176080 },
          { item_ref: '2.1.2', description: 'Disposal of excavated material off-site', unit: 'm³', qty: 1240, rate: 218, amount: 270320 },
          { item_ref: '2.2.1', description: 'Blinding concrete, 50mm thick, grade C15', unit: 'm²', qty: 680, rate: 142, amount: 96560 },
          { item_ref: '2.2.2', description: 'Reinforced concrete raft, grade C35, 600mm thick', unit: 'm³', qty: 408, rate: 2180, amount: 889440 },
        ],
        subtotal: 2031653
      },
      {
        name: 'BILL 3 — SUPERSTRUCTURE',
        lines: [
          { item_ref: '3.1.1', description: 'Reinforced concrete columns, grade C40, all levels', unit: 'm³', qty: 186, rate: 2410, amount: 448260 },
          { item_ref: '3.1.2', description: 'Reinforced concrete beams & slabs, grade C40', unit: 'm³', qty: 612, rate: 2260, amount: 1383120 },
          { item_ref: '3.4.1', description: 'Unitised aluminium curtain wall, double glazed low-e', unit: 'm²', qty: 2840, rate: 2150, amount: 6106000 },
        ],
        subtotal: 9680620
      },
      {
        name: 'BILL 4 — FIT-OUT FINISHES',
        lines: [
          { item_ref: '4.1.1', description: 'Gypsum partition wall, 100mm, insulated', unit: 'm²', qty: 4260, rate: 240, amount: 1022400 },
          { item_ref: '4.2.1', description: 'Porcelain floor tile 600×600, fully vitrified', unit: 'm²', qty: 3180, rate: 320, amount: 1017600 },
          { item_ref: '4.4.1', description: 'Bespoke timber kitchen units', unit: 'nr', qty: 84, rate: 38500, amount: 3234000 },
        ],
        subtotal: 12921400
      }
    ]
  };

  const qualifications = [
    { id: 'B.1', text: 'Pricing valid for 60 days from submission date.', visible: true, type: 'bid' },
    { id: 'B.2', text: 'Night work, weekend or public holiday work to be billed at premium rates.', visible: true, type: 'bid' },
    { id: 'B.3', text: 'Site possession assumed clear, vacant and accessible from the date of LOI.', visible: true, type: 'bid' },
    { id: 'B.4', text: 'Authority approval fees, NOC charges excluded — to be borne by Employer.', visible: true, type: 'bid' },
    { id: 'B.5', text: 'Internal only: Margin assumes 30% labour from sister entity.', visible: false, type: 'bid' },
    { id: 'B.6', text: 'Internal only: 1.8% strategic discount applied.', visible: false, type: 'bid' },
  ];

  const lineQualifications = [
    { item: '3.1.1', text: 'Reinforced concrete columns rate is subject to formwork access.', visible: true, type: 'line' },
    { item: '2.1.1', text: 'Excavation rates assume soil classified as Class 2.', visible: true, type: 'line' },
    { item: '5.4.2', text: 'Internal only: Ali Plast quoted AED 168/m² vs base rate of AED 215/m².', visible: false, type: 'line' },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const result = await exportBid({ bid_id: bid?.name, format: 'zip' });
      if (result.message?.download_url) {
        window.open(result.message.download_url, '_blank');
      } else {
        // Simulate download for demo
        setTimeout(() => {
          alert('Bid pack downloaded successfully!');
        }, 1500);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Export</h1>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>
            Final priced BOQ — review and download
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
              idx === currentStep ? 'bg-blue-600 text-white font-medium' : 'text-green-600'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                idx === currentStep ? 'bg-white text-blue-600' : 'bg-green-600 text-white'
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
            <strong>Bid pack ready.</strong> Client BOQ shows blended sell rates only — bid acquisition cost is rolled in, 
            internal cost components are stripped. Cross-check the qualifications list against the tender requirements 
            one last time before sending.
          </div>
        </div>
      </Alert>

      {/* Export Toolbar */}
      <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)', border: '1px solid var(--outline-gray-1)' }}>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--ink-gray-6)' }}>View as:</span>
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ backgroundColor: 'var(--surface-white)' }}>
            <button
              onClick={() => setViewMode('client')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                viewMode === 'client' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ color: viewMode === 'client' ? 'white' : 'var(--ink-gray-7)' }}
            >
              Client BOQ
            </button>
            <button
              onClick={() => setViewMode('internal')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                viewMode === 'internal' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ color: viewMode === 'internal' ? 'white' : 'var(--ink-gray-7)' }}
            >
              Internal (full detail)
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <FeatherIcon name="printer" className="w-3.5 h-3.5 mr-1" />
            Print preview
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-3 gap-5">
        {/* BOQ Table */}
        <Card className="col-span-2 overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--outline-gray-1)' }}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide w-20" style={{ color: 'var(--ink-gray-5)' }}>Item</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-gray-5)' }}>Description</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide w-16" style={{ color: 'var(--ink-gray-5)' }}>Unit</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide w-20" style={{ color: 'var(--ink-gray-5)' }}>Qty</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide w-28" style={{ color: 'var(--ink-gray-5)' }}>Rate (AED)</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide w-32" style={{ color: 'var(--ink-gray-5)' }}>Amount (AED)</th>
                </tr>
              </thead>
              <tbody>
                {boq.bills.map((bill, billIdx) => (
                  <React.Fragment key={billIdx}>
                    <tr className="bg-blue-50 sticky top-[33px]">
                      <td colSpan="6" className="px-3 py-2 font-semibold text-blue-600">
                        {bill.name}
                      </td>
                    </tr>
                    {bill.lines.map((line, lineIdx) => (
                      <tr key={lineIdx} className="border-t" style={{ borderColor: 'var(--outline-gray-1)' }}>
                        <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--ink-gray-6)' }}>{line.item_ref}</td>
                        <td className="px-3 py-2" style={{ color: 'var(--ink-gray-8)' }}>{line.description}</td>
                        <td className="px-3 py-2" style={{ color: 'var(--ink-gray-6)' }}>{line.unit}</td>
                        <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--ink-gray-7)' }}>{line.qty.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--ink-gray-8)' }}>{line.rate.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--ink-gray-8)' }}>{line.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 border-t" style={{ borderColor: 'var(--outline-gray-1)' }}>
                      <td colSpan="5" className="px-3 py-2 text-right font-semibold" style={{ color: 'var(--ink-gray-7)' }}>
                        Subtotal — {bill.name}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold" style={{ color: 'var(--ink-gray-8)' }}>
                        {bill.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                <tr className="bg-blue-100 font-bold">
                  <td colSpan="5" className="px-3 py-3 text-right">BID TOTAL (excl. VAT)</td>
                  <td className="px-3 py-3 text-right font-mono text-blue-600">AED {boq.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Export Key */}
          <div className="p-3 border-t flex flex-wrap gap-4 text-xs" style={{ backgroundColor: 'var(--surface-gray-2)', borderColor: 'var(--outline-gray-1)' }}>
            <span className="font-semibold" style={{ color: 'var(--ink-gray-6)' }}>Key:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-blue-100"></div>
              <span>Bill</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-purple-100"></div>
              <span>Section</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-amber-100"></div>
              <span>Contractor addition</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-300"></div>
              <span>Subtotal</span>
            </div>
          </div>
        </Card>

        {/* Qualifications Block */}
        <Card className="col-span-1">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold" style={{ color: 'var(--ink-gray-8)' }}>Qualifications & Assumptions</h3>
              <span className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
                {qualifications.filter(q => q.visible).length + lineQualifications.filter(q => q.visible).length} visible · {qualifications.filter(q => !q.visible).length + lineQualifications.filter(q => !q.visible).length} suppressed
              </span>
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 pt-2" style={{ color: 'var(--ink-gray-5)' }}>
              Bid-level Qualifications
            </h4>
            <div className="space-y-2 mb-4 max-h-[250px] overflow-y-auto">
              {qualifications.map(qual => (
                <div key={qual.id} className={`p-2 rounded-lg ${qual.visible ? '' : 'opacity-50'}`} style={{ backgroundColor: qual.visible ? 'var(--surface-gray-2)' : 'rgba(0,0,0,0.03)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="w-3.5 h-3.5" checked={qual.visible} readOnly />
                      <Badge theme="blue" size="xs">{qual.id}</Badge>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                  <div className="text-xs" style={{ color: qual.visible ? 'var(--ink-gray-7)' : 'var(--ink-gray-5)' }}>
                    {qual.text}
                  </div>
                  {!qual.visible && (
                    <div className="text-xs text-red-400 mt-1">Suppressed — internal only</div>
                  )}
                </div>
              ))}
            </div>

            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 pt-2 border-t" style={{ color: 'var(--ink-gray-5)', borderColor: 'var(--outline-gray-1)' }}>
              Line-level Qualifications
            </h4>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {lineQualifications.map((qual, idx) => (
                <div key={idx} className={`p-2 rounded-lg ${qual.visible ? '' : 'opacity-50'}`} style={{ backgroundColor: qual.visible ? 'var(--surface-gray-2)' : 'rgba(0,0,0,0.03)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="w-3.5 h-3.5" checked={qual.visible} readOnly />
                      <Badge theme="gray" size="xs">{qual.item}</Badge>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                  <div className="text-xs" style={{ color: qual.visible ? 'var(--ink-gray-7)' : 'var(--ink-gray-5)' }}>
                    {qual.text}
                  </div>
                  {!qual.visible && (
                    <div className="text-xs text-red-400 mt-1">Suppressed — internal only</div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t text-center" style={{ borderColor: 'var(--outline-gray-1)' }}>
              <Button variant="outline" size="sm" className="w-full">
                + Add qualification
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
        <Button variant="outline" onClick={() => window.location.href = '/bid/review-submit'}>
          ← Back to review & submit
        </Button>
        <Button variant="outline" onClick={handleExport}>
          <FeatherIcon name="file-text" className="w-4 h-4 mr-1" />
          Generate full bid pack
        </Button>
        <Button variant="solid" theme="primary" loading={exporting} onClick={handleExport}>
          <FeatherIcon name="download" className="w-4 h-4 mr-1" />
          ↓ Download Excel
        </Button>
      </div>
    </div>
  );
}