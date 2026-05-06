// PackageTagging.jsx - AI-assisted package assignment for BOQ lines
import React, { useState } from 'react';

const PackageTagging = ({ frappe, bid, onNavigate, onUpdateBid, onShowToast }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [filterPackage, setFilterPackage] = useState('');
    const [jumpToBill, setJumpToBill] = useState('');

    const [packages] = useState([
        { name: 'Prelims', count: 6 },
        { name: 'Enabling Works', count: 0 },
        { name: 'Substructure', count: 41 },
        { name: 'Superstructure', count: 54 },
        { name: 'Façade & Cladding', count: 12 },
        { name: 'Roofing & Waterproofing', count: 8 },
        { name: 'Internal Finishes', count: 58 },
        { name: 'Joinery', count: 19 },
        { name: 'MEP — Mechanical', count: 18 },
        { name: 'MEP — Electrical', count: 16 },
        { name: 'MEP — Plumbing', count: 10 },
        { name: 'External Works', count: 0 },
        { name: 'Landscaping', count: 0 },
        { name: 'Provisional Sums', count: 1 }
    ]);

    const [lines, setLines] = useState([
        { id: 1, item: '1.1', description: 'Site establishment & hoarding', unit: 'lot', qty: '1.00', package: 'Prelims', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 2, item: '1.2', description: 'Project management & supervision', unit: 'mo', qty: '9.00', package: 'Prelims', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 3, item: '1.3', description: 'Temporary power & water', unit: 'lot', qty: '1.00', package: 'Prelims', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 4, item: '1.4.1', description: 'Project Manager (full time)', unit: 'mo', qty: '9.00', package: 'Prelims', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 5, item: '2.1.1', description: 'Excavation to reduced level', unit: 'm³', qty: '1,240.00', package: 'Substructure', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 6, item: '2.1.2', description: 'Disposal of excavated material', unit: 'm³', qty: '1,240.00', package: 'Substructure', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 7, item: '2.2.1', description: 'Blinding concrete', unit: 'm²', qty: '680.00', package: 'Substructure', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 8, item: '2.2.2', description: 'Reinforced concrete raft', unit: 'm³', qty: '408.00', package: 'Substructure', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 9, item: '2.5.1', description: 'PS — Allowance for unforeseen ground conditions', unit: 'lot', qty: '1.00', package: '', needsAttention: true, tagged: false, aiSuggestion: 'Provisional Sums' },
        { id: 10, item: '3.1.1', description: 'Reinforced concrete columns', unit: 'm³', qty: '186.00', package: 'Superstructure', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 11, item: '3.4.1', description: 'Unitised aluminium curtain wall', unit: 'm²', qty: '2,840.00', package: 'Façade & Cladding', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 12, item: '3.5.1', description: 'Waterproofing membrane to roof', unit: 'm²', qty: '1,680.00', package: 'Roofing & Waterproofing', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 13, item: '4.1.1', description: 'Gypsum partition wall', unit: 'm²', qty: '4,260.00', package: 'Internal Finishes', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 14, item: '4.4.1', description: 'Bespoke timber kitchen units', unit: 'nr', qty: '84.00', package: 'Joinery', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 15, item: '4.5.1', description: 'Chilled water FCUs', unit: 'nr', qty: '420.00', package: 'MEP — Mechanical', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 16, item: '4.6.1', description: 'Low voltage distribution boards', unit: 'nr', qty: '84.00', package: 'MEP — Electrical', needsAttention: false, tagged: true, aiSuggestion: null },
        { id: 17, item: '4.8.2', description: 'PS — Owner-supplied sanitary ware', unit: 'lot', qty: '1.00', package: '', needsAttention: true, tagged: false, aiSuggestion: 'MEP — Plumbing' },
        { id: 18, item: '4.9.1', description: 'Specialist acoustic treatment', unit: 'm²', qty: '280.00', package: '', needsAttention: true, tagged: false, aiSuggestion: 'Internal Finishes' }
    ]);

    const totalLines = lines.length;
    const taggedCount = lines.filter(l => l.tagged).length;
    const untaggedCount = lines.filter(l => !l.tagged).length;
    const attentionCount = lines.filter(l => l.needsAttention).length;
    const allTagged = untaggedCount === 0;

    const filteredLines = lines.filter(line => {
        if (activeFilter === 'attention' && !line.needsAttention) return false;
        if (activeFilter === 'tagged' && !line.tagged) return false;
        if (filterPackage && line.package !== filterPackage) return false;
        return true;
    });

    const packageSummary = () => {
        const summary = [];
        for (const pkg of packages) {
            const count = lines.filter(l => l.package === pkg.name).length;
            summary.push({ name: pkg.name, count: count });
        }
        const untaggedCountVal = lines.filter(l => !l.package).length;
        summary.push({ name: 'Untagged', count: untaggedCountVal });
        return summary;
    };

    const updatePackage = (lineId, newPackage) => {
        setLines(prev => prev.map(line => {
            if (line.id === lineId) {
                const tagged = !!newPackage;
                const needsAttention = false;
                return { ...line, package: newPackage, tagged, needsAttention };
            }
            return line;
        }));
    };

    const continueToPricing = async () => {
        if (!allTagged) {
            frappe.msgprint({
                title: __('Incomplete Tagging'),
                message: __('Please tag all lines before continuing to pricing.'),
                indicator: 'orange'
            });
            return;
        }

        try {
            const response = await frappe.call({
                method: 'intrakore_estimation.intrakore_estimation.api.save_package_tagging',
                args: { 
                    bid_id: bid?.name || bid?.code,
                    lines: lines
                },
                freeze: true,
                freeze_message: 'Saving package assignments...'
            });

            if (response.message) {
                onShowToast('Success', 'Package tagging saved successfully');
                onUpdateBid({ taggingData: { lines, packages } });
                onNavigate('Pricing');
            }
        } catch (error) {
            console.error('API error:', error);
            onShowToast('Success (Demo)', 'Package tagging saved in demo mode');
            onUpdateBid({ taggingData: { lines, packages } });
            onNavigate('Pricing');
        }
    };

    const goBack = () => {
        onNavigate('ReviewImport');
    };

    return (
        <div className="package-tagging-screen">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="mb-0">Package Tagging</h3>
                    <div className="small text-muted" style={{ marginTop: '4px' }}>
                        Bid: <strong>{bid?.code || bid?.bid_code}</strong> · {totalLines} line items · {packages.length} packages used
                    </div>
                </div>
            </div>

            <div className="alert alert-info mb-4">
                <div className="flex items-start">
                    <i className="fa fa-robot mr-2"></i>
                    <div>
                        <strong>Kore tagged {totalLines - attentionCount} of {totalLines} lines ({Math.round((totalLines - attentionCount) / totalLines * 100)}%).</strong> Confirm or override each suggestion.
                        <strong> {attentionCount} lines need attention</strong> — filter by "Needs attention" to jump to them.
                    </div>
                </div>
            </div>

            <div className="toolbar mb-4">
                <div className="btn-group">
                    <button className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-default'}`} onClick={() => setActiveFilter('all')}>
                        All <span className="badge">{totalLines}</span>
                    </button>
                    <button className={`btn btn-sm ${activeFilter === 'attention' ? 'btn-warning' : 'btn-default'}`} onClick={() => setActiveFilter('attention')}>
                        Needs attention <span className="badge">{attentionCount}</span>
                    </button>
                    <button className={`btn btn-sm ${activeFilter === 'tagged' ? 'btn-success' : 'btn-default'}`} onClick={() => setActiveFilter('tagged')}>
                        Done <span className="badge">{taggedCount}</span>
                    </button>
                </div>
                <div className="pull-right">
                    <select className="form-control form-control-sm" style={{ width: '200px' }} value={filterPackage} onChange={(e) => setFilterPackage(e.target.value)}>
                        <option value="">Filter by package…</option>
                        {packages.map(pkg => (
                            <option key={pkg.name} value={pkg.name}>{pkg.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="tagging-layout">
                <div className="lines-container">
                    <div className="table-responsive">
                        <table className="table table-bordered table-condensed">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>Item</th>
                                    <th>Description</th>
                                    <th style={{ width: '50px' }}>Unit</th>
                                    <th className="text-right" style={{ width: '80px' }}>Qty</th>
                                    <th style={{ width: '220px' }}>Master Package</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLines.map(line => (
                                    <tr key={line.id} className={`${line.needsAttention ? 'needs-attention' : ''} ${line.tagged ? 'tagged' : ''}`}>
                                        <td className="font-mono small">{line.item}</td>
                                        <td>
                                            {line.description}
                                            {line.aiSuggestion && (
                                                <i className="fa fa-robot text-purple ml-1" title={`Kore suggested: ${line.aiSuggestion}`}></i>
                                            )}
                                            {line.needsAttention && (
                                                <i className="fa fa-exclamation-triangle text-warning ml-1" title="Needs attention"></i>
                                            )}
                                        </td>
                                        <td className="text-center">{line.unit}</td>
                                        <td className="text-right">{line.qty}</td>
                                        <td>
                                            <select 
                                                className={`form-control form-control-sm ${line.needsAttention ? 'border-warning' : ''} ${line.tagged ? 'border-success' : ''}`}
                                                value={line.package}
                                                onChange={(e) => updatePackage(line.id, e.target.value)}
                                            >
                                                <option value="">— Select package —</option>
                                                {packages.map(pkg => (
                                                    <option key={pkg.name} value={pkg.name}>{pkg.name}</option>
                                                ))}
                                            </select>
                                            {line.aiSuggestion && !line.package && (
                                                <div className="small text-muted mt-1">
                                                    <i className="fa fa-robot"></i> {line.aiSuggestion}
                                                </div>
                                            )}
                                            {line.package && (
                                                <div className="small text-success mt-1">
                                                    <i className="fa fa-check-circle"></i> Assigned to {line.package}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="summary-sidebar">
                    <h4 className="mb-3">Packages used</h4>
                    
                    {packageSummary().map(pkg => (
                        <div key={pkg.name} className={`summary-row ${pkg.name === 'Untagged' ? 'unassigned' : ''} ${pkg.count === 0 ? 'zero' : ''}`}>
                            <span className="name">{pkg.name}</span>
                            <span className="count">{pkg.count}</span>
                        </div>
                    ))}

                    <div className="border-top pt-3 mt-3">
                        <div className="summary-row font-bold">
                            <span className="name">Total</span>
                            <span className="count">{totalLines}</span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <select className="form-control form-control-sm" value={jumpToBill} onChange={(e) => setJumpToBill(e.target.value)}>
                            <option value="">Jump to bill…</option>
                            <option value="bill1">Bill 1 — Preliminaries</option>
                            <option value="bill2">Bill 2 — Substructure</option>
                            <option value="bill3">Bill 3 — Superstructure</option>
                            <option value="bill4">Bill 4 — Fit-out Finishes</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="action-bar mt-4 pt-3 border-top">
                <button className="btn btn-default" onClick={goBack}>
                    <i className="fa fa-chevron-left"></i> Back
                </button>
                <div className="flex items-center gap-3">
                    <span className={`small ${allTagged ? 'text-success' : 'text-warning'}`}>
                        <strong>{untaggedCount} lines still need tagging.</strong> Pricing locks until every line is assigned.
                    </span>
                    <button className="btn btn-primary" onClick={continueToPricing} disabled={!allTagged}>
                        Continue to pricing <i className="fa fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PackageTagging;