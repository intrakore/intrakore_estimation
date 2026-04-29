import React, { useState } from 'react';
import { useFrappeGetCall, useFrappePutCall } from 'frappe-react-sdk';
import { Card, Button, Badge, Progress, Alert, FeatherIcon } from '@rtcamp/frappe-ui-react';

export default function Pricing({ bid }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [expandedLine, setExpandedLine] = useState(null);
  
  const { data: packagesData, isLoading: packagesLoading } = useFrappeGetCall(
    'intrakore_estimation.api.get_packages_with_lines',
    { bid_id: bid?.name },
    'PACKAGES_WITH_LINES',
    { revalidateOnFocus: false }
  );

  const { call: updateLine, loading } = useFrappePutCall('intrakore_estimation.api.update_line_pricing');
  const { call: confirmLine } = useFrappePutCall('intrakore_estimation.api.confirm_line');

  const steps = ['Upload BOQ', 'Review Import', 'Package Tagging', 'Pricing', 'Bid Strategy', 'Review & Submit', 'Export'];
  const currentStep = 3;

  const packages = packagesData?.message || [];
  const currentPackage = selectedPackage || packages[0];
  const lines = currentPackage?.lines || [];
  const confirmedCount = lines.filter(l => l.is_confirmed).length;
  const progressPercent = lines.length ? (confirmedCount / lines.length) * 100 : 0;

  const handleConfirmLine = async (lineId, isConfirmed) => {
    await confirmLine({ line_id: lineId, is_confirmed: !isConfirmed });
    // Refresh data
    window.location.reload();
  };

  if (packagesLoading) {
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--ink-gray-9)' }}>Pricing</h1>
          <div className="text-sm mt-1" style={{ color: 'var(--ink-gray-5)' }}>
            {bid?.bid_code} {bid?.project_name} · {packages.reduce((sum, p) => sum + (p.lines?.length || 0), 0)} lines · {packages.length} packages
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/bid/strategy'}>
            Bulk margin/contingency
          </Button>
          <Button variant="solid" theme="primary" onClick={() => window.location.href = '/bid/strategy'}>
            Continue to bid strategy →
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
            <strong>Kore auto-priced {Math.floor(lines.length * 0.75)} of {lines.length} lines</strong> from your Cost Library.
            <strong className="text-amber-500 ml-1">
              {lines.filter(l => l.has_price_deviation).length} lines need a closer look
            </strong> — flagged with warning icon.
          </div>
        </div>
      </Alert>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-4 gap-5">
        {/* Package Navigation Sidebar */}
        <Card className="col-span-1 p-0 sticky top-5 h-fit">
          <div className="p-3 border-b" style={{ borderColor: 'var(--outline-gray-1)' }}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--ink-gray-5)' }}>
                Packages
              </span>
              <Badge theme="gray" size="sm">{packages.length}</Badge>
            </div>
          </div>
          <div className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
            {packages.map(pkg => {
              const pkgLines = pkg.lines || [];
              const confirmed = pkgLines.filter(l => l.is_confirmed).length;
              const isComplete = confirmed === pkgLines.length && pkgLines.length > 0;
              return (
                <button
                  key={pkg.name}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${
                    selectedPackage?.package_name === pkg.package_name
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: selectedPackage?.package_name === pkg.package_name ? 'rgba(59, 126, 246, 0.1)' : undefined
                  }}
                >
                  <span>{pkg.package_name}</span>
                  <div className="flex items-center gap-2">
                    {isComplete && <FeatherIcon name="check-circle" className="w-3.5 h-3.5 text-green-500" />}
                    <span className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>{confirmed}/{pkgLines.length}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Lines Area */}
        <div className="col-span-3 space-y-3">
          {/* Package Summary Header */}
          <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
            <div>
              <span className="font-semibold" style={{ color: 'var(--ink-gray-8)' }}>
                {currentPackage?.package_name}
              </span>
              <span className="text-sm ml-2" style={{ color: 'var(--ink-gray-5)' }}>
                {lines.length} lines · <strong>{confirmedCount} confirmed</strong>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>Cost</div>
                <div className="font-mono text-sm" style={{ color: 'var(--ink-gray-8)' }}>
                  AED {currentPackage?.total_cost?.toLocaleString() || 0}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>Margin</div>
                <div className="font-mono text-sm text-green-600">{currentPackage?.margin_percent || 12.5}%</div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>Total</div>
                <div className="font-mono text-sm font-semibold text-blue-600">
                  AED {currentPackage?.total_amount?.toLocaleString() || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-gray-3)' }}>
              <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>{Math.round(progressPercent)}% complete</span>
          </div>

          {/* Lines List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {lines.map(line => (
              <Card key={line.name} className={`overflow-hidden transition-all ${expandedLine === line.name ? 'border-blue-400' : ''}`}>
                <div
                  className="p-4 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedLine(expandedLine === line.name ? null : line.name)}
                >
                  <button
                    className="w-5 h-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 transition-all"
                    style={{
                      backgroundColor: line.is_confirmed ? '#10b981' : 'transparent',
                      borderColor: line.is_confirmed ? '#10b981' : 'var(--outline-gray-2)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmLine(line.name, line.is_confirmed);
                    }}
                  >
                    {line.is_confirmed && <FeatherIcon name="check" className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
                    <div className="font-mono text-xs" style={{ color: 'var(--ink-gray-6)' }}>{line.item_ref}</div>
                    <div className="col-span-2 font-medium" style={{ color: 'var(--ink-gray-8)' }}>
                      {line.description?.substring(0, 60)}
                      {line.description?.length > 60 && '...'}
                    </div>
                    <div className="text-right font-mono" style={{ color: 'var(--ink-gray-7)' }}>
                      {line.qty?.toLocaleString()} <span className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>{line.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-medium text-blue-600">
                        AED {line.our_amount?.toLocaleString() || '-'}
                      </span>
                      {line.has_price_deviation && (
                        <FeatherIcon name="alert-triangle" className="w-3.5 h-3.5 inline-block ml-1 text-amber-500" />
                      )}
                    </div>
                  </div>
                  <FeatherIcon 
                    name="chevron-down" 
                    className={`w-4 h-4 ml-3 transition-transform ${expandedLine === line.name ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--ink-gray-4)' }}
                  />
                </div>

                {expandedLine === line.name && (
                  <div className="p-4 border-t" style={{ backgroundColor: 'var(--surface-gray-2)', borderColor: 'var(--outline-gray-1)' }}>
                    {/* Cost Breakdown */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Cost Components */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-gray-5)' }}>
                          Cost Components
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--ink-gray-6)' }}>Material</span>
                            <span className="font-mono" style={{ color: 'var(--ink-gray-8)' }}>
                              AED {line.material_cost?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--ink-gray-6)' }}>Manpower</span>
                            <span className="font-mono" style={{ color: 'var(--ink-gray-8)' }}>
                              AED {line.manpower_cost?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--ink-gray-6)' }}>Equipment</span>
                            <span className="font-mono" style={{ color: 'var(--ink-gray-8)' }}>
                              AED {line.equipment_cost?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--ink-gray-6)' }}>Subcontractors</span>
                            <span className="font-mono" style={{ color: 'var(--ink-gray-8)' }}>
                              AED {line.subcontractor_cost?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="pt-2 border-t flex justify-between font-medium" style={{ borderColor: 'var(--outline-gray-1)' }}>
                            <span style={{ color: 'var(--ink-gray-7)' }}>Total Cost</span>
                            <span className="font-mono font-semibold" style={{ color: 'var(--ink-gray-9)' }}>
                              AED {line.total_cost?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--ink-gray-5)' }}>
                          Pricing
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--ink-gray-6)' }}>Cost Rate</span>
                            <span className="font-mono" style={{ color: 'var(--ink-gray-8)' }}>
                              AED {line.cost_rate?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--ink-gray-6)' }}>Margin %</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={line.margin_percent || 12.5}
                                className="w-16 px-2 py-0.5 rounded border text-right text-sm focus:outline-none focus:border-blue-500"
                                style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}
                                onChange={(e) => updateLine({ line_id: line.name, margin_percent: parseFloat(e.target.value) })}
                              />
                              <span className="text-green-600">%</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--ink-gray-6)' }}>Contingency %</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={line.contingency_percent || 3.0}
                                className="w-16 px-2 py-0.5 rounded border text-right text-sm focus:outline-none focus:border-blue-500"
                                style={{ backgroundColor: 'var(--surface-white)', borderColor: 'var(--outline-gray-1)' }}
                                onChange={(e) => updateLine({ line_id: line.name, contingency_percent: parseFloat(e.target.value) })}
                              />
                              <span>%</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t flex justify-between font-medium" style={{ borderColor: 'var(--outline-gray-1)' }}>
                            <span style={{ color: 'var(--ink-gray-7)' }}>Sell Rate</span>
                            <span className="font-mono font-semibold text-blue-600">
                              AED {line.sell_rate?.toLocaleString() || '0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Line Amount */}
                    <div className="mt-4 pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--outline-gray-1)' }}>
                      <div className="flex items-center gap-2">
                        <FeatherIcon name="dollar-sign" className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium" style={{ color: 'var(--ink-gray-7)' }}>Line Amount</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs" style={{ color: 'var(--ink-gray-5)' }}>
                          {line.qty?.toLocaleString()} {line.unit} × Sell Rate
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          AED {line.our_amount?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>

                    {/* Qualification Button */}
                    <div className="mt-3 pt-3 border-t flex justify-between items-center" style={{ borderColor: 'var(--outline-gray-1)' }}>
                      <div className="flex items-center gap-2">
                        <FeatherIcon name="file-text" className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-xs" style={{ color: 'var(--ink-gray-6)' }}>
                          {line.has_qualification ? '1 qualification attached' : 'No qualifications'}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        {line.has_qualification ? 'Edit qualification' : '+ Add qualification'}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-gray-2)' }}>
        <Button variant="solid" theme="primary" onClick={() => window.location.href = '/bid/strategy'}>
          Continue to bid strategy →
        </Button>
      </div>
    </div>
  );
}