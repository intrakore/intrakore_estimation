import React from 'react';
import { Card, Button } from '@rtcamp/frappe-ui-react';
import { Upload, FileText, Plus } from 'lucide-react';

export default function BidPathSelector({ bid }) {
  const startPath = (path) => {
    if (path === 'upload') window.location.href = '/bid/upload';
    else if (path === 'template') window.location.href = '/bid/tagging';
    else if (path === 'fresh') window.location.href = '/bid/pricing';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>
            {bid?.project_name || 'New Bid'}
          </h1>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>
            <code className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--surface-gray-2)', color: 'var(--ink-gray-6)' }}>
              {bid?.bid_code || 'INT-26-XXX'}
            </code>
            {bid?.client_name && ` · ${bid.client_name} · Due ${bid.submission_date}`}
          </div>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/bids'}>
          Save & Exit
        </Button>
      </div>

      <div className="border-b pb-2 mb-4" style={{ borderColor: 'var(--outline-gray-1)' }}>
        <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary, #3b7ef6)' }}>
          How is this bid being built?
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--ink-gray-5)' }}>
          Pick one — you'll go straight to the right workflow
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Option 1: Upload Client BOQ */}
        <div 
          onClick={() => startPath('upload')}
          className="p-5 rounded-xl border cursor-pointer transition-all hover:border-blue-400 hover:-translate-y-0.5"
          style={{ 
            backgroundColor: 'var(--surface-white)', 
            borderColor: 'var(--outline-gray-1)',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <Upload className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--ink-gray-8)' }}>
            Upload Client BOQ
          </h3>
          <p className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
            The client has provided a priced or unpriced BOQ in Excel. Intrakore parses the file, 
            preserves your bill structure, and prepares it for tagging and pricing.
          </p>
          <div className="mt-3 text-xs font-medium text-blue-600">
            5 steps · ~ tendered work
          </div>
        </div>

        {/* Option 2: Use existing template */}
        <div 
          onClick={() => startPath('template')}
          className="p-5 rounded-xl border cursor-pointer transition-all hover:border-purple-400 hover:-translate-y-0.5"
          style={{ 
            backgroundColor: 'var(--surface-white)', 
            borderColor: 'var(--outline-gray-1)',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--ink-gray-8)' }}>
            Use existing template
          </h3>
          <p className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
            Start from a saved BOQ template — typical fit-out, villa, or warehouse structures 
            your team uses. Lines are pre-tagged and ready for pricing.
          </p>
          <div className="mt-3 text-xs font-medium text-purple-600">
            4 steps · ~ re-bids &amp; standard scopes
          </div>
        </div>

        {/* Option 3: Build BOQ from scratch */}
        <div 
          onClick={() => startPath('fresh')}
          className="p-5 rounded-xl border cursor-pointer transition-all hover:border-green-400 hover:-translate-y-0.5"
          style={{ 
            backgroundColor: 'var(--surface-white)', 
            borderColor: 'var(--outline-gray-1)',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--ink-gray-8)' }}>
            Build BOQ from scratch
          </h3>
          <p className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
            Author the BOQ inside Intrakore. Add lines, units, quantities, and tag each line 
            to a package as you go. Tagging happens inline — no separate step.
          </p>
          <div className="mt-3 text-xs font-medium text-green-600">
            3 steps · ~ private clients &amp; design-build
          </div>
        </div>
      </div>

      {/* AI Callout - Kore recommendation */}
      <div 
        className="mt-4 p-3 rounded-lg flex items-start gap-3"
        style={{ 
          backgroundColor: 'rgba(167, 139, 250, 0.06)', 
          border: '1px solid rgba(167, 139, 250, 0.2)',
          borderLeft: '3px solid #a78bfa'
        }}
      >
        <span className="text-purple-500 text-sm">✦</span>
        <div className="text-sm" style={{ color: 'var(--ink-gray-6)' }}>
          <strong>Don't have a client BOQ yet?</strong> External take-off in CAD or PlanSwift is fine — 
          when you have your quantities, choose <em>Build BOQ from scratch</em> and enter them line by line. 
          Intrakore won't try to do the take-off for you.
        </div>
      </div>
    </div>
  );
}
