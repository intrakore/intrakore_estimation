import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePutCall } from 'frappe-react-sdk';
import { Card, Button, Badge, Alert } from '@rtcamp/frappe-ui-react';
import { Zap, Inbox, AlertTriangle } from 'lucide-react';

export default function ReviewImport({ bid }) {
  const [selectedTab, setSelectedTab] = useState('review');
  
  const { data: boqData, isLoading } = useFrappeGetCall(
    'intrakore_estimation.api.get_parsed_boq',
    { bid_id: bid?.name },
    'PARSED_BOQ',
    { revalidateOnFocus: false }
  );

  const steps = ['Upload BOQ', 'Review Import', 'Package Tagging', 'Pricing', 'Bid Strategy', 'Review & Submit', 'Export'];
  const currentStep = 1;

  const stats = boqData?.message?.stats || { 
    line_items: 0, 
    headers: 0, 
    totals: 0, 
    ambiguous: 0,
    confidence: 94,
    total_rows: 0
  };
  const rows = boqData?.message?.rows || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Review imported BOQ</h1>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>
            Confirm column mapping and row types — Kore got {stats.confidence}% right
          </div>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/bids'}>
          Save & Exit
        </Button>
      </div>

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

      <Alert theme="purple">
        <div className="flex items-start gap-3">
          <Zap className="w-4 h-4 text-purple-500 mt-0.5" />
          <div>
            <strong>Kore parsed {stats.total_rows || rows.length} rows</strong> — {stats.line_items} line items, {stats.headers} headers, {stats.totals} totals.
            {stats.ambiguous > 0 && (
              <strong className="text-amber-500 ml-1">{stats.ambiguous} rows are ambiguous</strong>
            )} — flagged amber. Adjust any row's type from the dropdown.
          </div>
        </div>
      </Alert>

      <div className="grid grid-cols-4 gap-5">
        <Card className="col-span-1">
          <div className="p-4">
            <h4 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink-gray-8)' }}>
              Column mapping
            </h4>
            <div className="space-y-3">
              {['Item Ref', 'Description', 'Unit', 'Qty', 'Rate', 'Amount'].map((col, idx) => (
                <div key={col} className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--ink-gray-6)' }}>{col}</span>
                  <select 
                    className="px-2 py-1 rounded text-xs border focus:outline-none focus:border-blue-500"
                    style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}
                    defaultValue={`Col ${String.fromCharCode(65 + idx)}`}
                  >
                    <option>Col A</option>
                    <option>Col B</option>
                    <option>Col C</option>
                    <option>Col D</option>
                    <option>Col E</option>
                    <option>Col F</option>
                  </select>
                </div>
              ))}
            </div>

            <h4 className="font-semibold text-sm mt-4 mb-3 pt-3 border-t" style={{ borderColor: 'var(--outline-gray-1)', color: 'var(--ink-gray-8)' }}>
              Row classification
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span style={{ color: 'var(--ink-gray-6)' }}>Line items</span><span className="font-mono">{stats.line_items}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--ink-gray-6)' }}>Bill headers</span><span className="font-mono">{stats.bill_headers || 4}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--ink-gray-6)' }}>Section headers</span><span className="font-mono">{stats.headers}</span></div>
              <div className="flex justify-between"><span style={{ color: 'var(--ink-gray-6)' }}>Totals / subtotals</span><span className="font-mono">{stats.totals}</span></div>
              <div className="flex justify-between text-amber-600"><span>Ambiguous (review)</span><span className="font-mono">{stats.ambiguous}</span></div>
            </div>
          </div>
        </Card>

        <Card className="col-span-3 overflow-hidden">
          <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
                <tr className="border-b" style={{ borderColor: 'var(--outline-gray-1)' }}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide w-20" style={{ color: 'var(--ink-gray-5)' }}>Item</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-gray-5)' }}>Description</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide w-16" style={{ color: 'var(--ink-gray-5)' }}>Unit</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide w-20" style={{ color: 'var(--ink-gray-5)' }}>Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide w-32" style={{ color: 'var(--ink-gray-5)' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 30).map((row, idx) => (
                  <tr key={idx} className={`border-t ${row.is_ambiguous ? 'bg-amber-50' : ''}`} style={{ borderColor: 'var(--outline-gray-1)' }}>
                    <td className="px-3 py-2 font-mono text-xs" style={{ color: 'var(--ink-gray-6)' }}>{row.item_ref || '-'}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--ink-gray-8)' }}>{row.description?.substring(0, 80)}{row.description?.length > 80 && '...'}</td>
                    <td className="px-3 py-2" style={{ color: 'var(--ink-gray-6)' }}>{row.unit || '-'}</td>
                    <td className="px-3 py-2 text-right font-mono" style={{ color: 'var(--ink-gray-7)' }}>{row.qty || '-'}</td>
                    <td className="px-3 py-2">
                      <select 
                        className={`px-2 py-1 rounded text-xs border ${row.is_ambiguous ? 'border-amber-400' : ''} focus:outline-none focus:border-blue-500`}
                        style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}
                        defaultValue={row.type || 'line'}
                      >
                        <option value="line">Line item</option>
                        <option value="header">Header</option>
                        <option value="section">Section Header</option>
                        <option value="total">Total</option>
                        <option value="ignore">Ignore</option>
                      </select>
                      {row.is_ambiguous && (
                        <div className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Needs review
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-12" style={{ color: 'var(--ink-gray-5)' }}>
                      <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" /> No data to review
                    </td>
                  </tr>
                )}
                {rows.length > 30 && (
                  <tr>
                    <td colSpan="5" className="text-center py-3" style={{ color: 'var(--ink-gray-5)' }}>+ {rows.length - 30} more rows</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/bid/upload'}>← Back</Button>
          <span className="text-sm" style={{ color: 'var(--ink-gray-5)' }}>
            {stats.ambiguous > 0 ? `${stats.ambiguous} ambiguous rows still flagged — review before continuing` : 'All rows reviewed and ready'}
          </span>
        </div>
        <Button variant="solid" theme="primary" onClick={() => window.location.href = '/bid/tagging'}>
          Continue to package tagging →
        </Button>
      </div>
    </div>
  );
}