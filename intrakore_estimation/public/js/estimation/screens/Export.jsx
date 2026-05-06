// Export.jsx - Final priced BOQ export with client/internal view toggle
import React, { useState } from 'react';

const Export = ({ frappe, bid, onNavigate, onUpdateBid, onShowToast }) => {
    const [activeView, setActiveView] = useState('client');
    const [showAllLineQuals, setShowAllLineQuals] = useState(false);
    const [bidPackOpen, setBidPackOpen] = useState(false);

    const formatNumber = (value) => {
        if (!value && value !== 0) return '0';
        return value.toLocaleString();
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'AED 0';
        return 'AED ' + value.toLocaleString();
    };

    // BOQ Data
    const boqLines = [
        { item: '1.1', description: 'Site establishment & hoarding', unit: 'lot', qty: 1, costRate: 228400, sellRate: 285400, amount: 285400, marginPercent: 12 },
        { item: '1.2', description: 'Project management & supervision', unit: 'mo', qty: 9, costRate: 58500, sellRate: 68500, amount: 616500, marginPercent: 15 },
        { item: '1.3', description: 'Temporary power & water', unit: 'lot', qty: 1, costRate: 76800, sellRate: 96000, amount: 96000, marginPercent: 12 },
        { item: '1.4.1', description: 'Project Manager (full time)', unit: 'mo', qty: 9, costRate: 33600, sellRate: 42000, amount: 378000, marginPercent: 12 }
    ];

    const substructureLines = [
        { item: '2.1.1', description: 'Excavation to reduced level', unit: 'm³', qty: 1240, costRate: 118, sellRate: 142, amount: 176080, marginPercent: 14 },
        { item: '2.1.2', description: 'Disposal of excavated material', unit: 'm³', qty: 1240, costRate: 175, sellRate: 218, amount: 270320, marginPercent: 12 }
    ];

    const superstructureLines = [
        { item: '3.1.1', description: 'Reinforced concrete columns', unit: 'm³', qty: 186, costRate: 1928, sellRate: 2410, amount: 448260, marginPercent: 15 },
        { item: '3.1.2', description: 'Reinforced concrete beams', unit: 'm³', qty: 612, costRate: 1808, sellRate: 2260, amount: 1383120, marginPercent: 14 },
        { item: '3.4.1', description: 'Unitised aluminium curtain wall', unit: 'm²', qty: 2840, costRate: 1720, sellRate: 2150, amount: 6106000, marginPercent: 12 }
    ];

    const fitoutLines = [
        { item: '4.1.1', description: 'Gypsum partition wall', unit: 'm²', qty: 4260, costRate: 200, sellRate: 240, amount: 1022400, marginPercent: 12 },
        { item: '4.2.1', description: 'Porcelain floor tile', unit: 'm²', qty: 3180, costRate: 267, sellRate: 320, amount: 1017600, marginPercent: 14 }
    ];

    // Qualifications Data
    const [bidQualifications, setBidQualifications] = useState([
        { id: 1, code: 'B.1', text: 'Pricing valid for 60 days from submission date. Beyond this period, all rates are subject to re-confirmation.', visible: true },
        { id: 2, code: 'B.2', text: 'All works to be carried out during regular working hours (06:00 – 18:00, Sun–Thu).', visible: true },
        { id: 3, code: 'B.3', text: 'Site possession assumed clear, vacant and accessible from the date of LOI.', visible: true },
        { id: 4, code: 'B.4', text: 'Authority approval fees (DCD, DM, DEWA, etc.) excluded – to be borne by Employer.', visible: true },
        { id: 5, code: 'B.5', text: 'Internal only: Margin assumes 30% labour from sister entity at intercompany rates.', visible: false },
        { id: 6, code: 'B.6', text: 'Internal only: 1.8% strategic discount applied at Director\'s instruction.', visible: false }
    ]);

    const [lineQualifications, setLineQualifications] = useState([
        { id: 101, lineRef: '3.1.1', text: 'Reinforced concrete columns rate is subject to formwork access provided by main contractor. Assumes minimum 2 reuses of formwork.', visible: true },
        { id: 102, lineRef: '2.1.1', text: 'Excavation rates assume soil classified as Class 2 (firm sand/silt). Rock or Class 3+ material not envisaged.', visible: true },
        { id: 103, lineRef: '2.1.3', text: 'Dewatering allowance based on water table at -2.4m below FFL per geotech report.', visible: true },
        { id: 104, lineRef: '3.4.1', text: 'Façade rates subject to AED/EUR exchange rate volatility. Valid for 60 days.', visible: true },
        { id: 105, lineRef: '5.4.2', text: 'Internal only: Ali Plast quoted AED 168/m² vs base rate of AED 215/m², 22% buffer retained.', visible: false }
    ]);

    const toggleQualVisibility = (id, isBidQual) => {
        if (isBidQual) {
            setBidQualifications(prev => prev.map(q => q.id === id ? { ...q, visible: !q.visible } : q));
        } else {
            setLineQualifications(prev => prev.map(q => q.id === id ? { ...q, visible: !q.visible } : q));
        }
    };

    const editQualification = (qual) => {
        frappe.msgprint({
            title: __('Edit Qualification'),
            message: __('Edit qualification for: ') + (qual.code || qual.lineRef),
            indicator: 'blue'
        });
    };

    const visibleLineQualifications = showAllLineQuals 
        ? lineQualifications 
        : lineQualifications.filter(q => q.visible);
    
    const hiddenLineQualifications = lineQualifications.filter(q => !q.visible);

    const generateBidPack = () => {
        setBidPackOpen(true);
    };

    const generatePack = () => {
        setBidPackOpen(false);
        onShowToast('Success', 'Bid pack generated and downloaded');
    };

    const printPreview = () => {
        window.print();
    };

    const downloadExcel = () => {
        onShowToast('Success', 'Excel export started');
    };

    const goBack = () => {
        onNavigate('ReviewSubmit');
    };

    const saveAndExit = () => {
        onNavigate('BidList');
    };

    return (
        <div className="export-screen">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="mb-0">Export</h3>
                    <div className="small text-muted" style={{ marginTop: '4px' }}>
                        Bid: <strong>{bid?.code || bid?.bid_code}</strong> · Final priced BOQ — review and download
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-default btn-sm" onClick={saveAndExit}>
                        <i className="fa fa-save"></i> Save & exit
                    </button>
                </div>
            </div>

            <div className="alert alert-info mb-4">
                <div className="flex items-start">
                    <i className="fa fa-robot mr-2"></i>
                    <div>
                        <strong>Bid pack ready.</strong> Client BOQ shows blended sell rates only — bid acquisition cost is rolled in, internal cost components are stripped.
                        Cross-check the qualifications list against the tender requirements one last time before sending.
                    </div>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="view-mode-toolbar">
                <div className="flex items-center gap-2">
                    <span className="small text-muted">View as:</span>
                    <div className="btn-group">
                        <button className={`btn btn-sm ${activeView === 'client' ? 'btn-primary' : 'btn-default'}`} onClick={() => setActiveView('client')}>
                            Client BOQ
                        </button>
                        <button className={`btn btn-sm ${activeView === 'internal' ? 'btn-primary' : 'btn-default'}`} onClick={() => setActiveView('internal')}>
                            Internal (full detail)
                        </button>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="export-layout">
                {/* Left: BOQ Table */}
                <div className="boq-table-container">
                    <div className="table-responsive">
                        <table className="table table-bordered table-condensed">
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>Item</th>
                                    <th>Description</th>
                                    <th style={{ width: '60px' }}>Unit</th>
                                    <th className="text-right" style={{ width: '80px' }}>Qty</th>
                                    {activeView === 'client' && <th className="text-right" style={{ width: '120px' }}>Rate (AED)</th>}
                                    {activeView === 'internal' && <th className="text-right" style={{ width: '100px' }}>Cost Rate</th>}
                                    {activeView === 'internal' && <th className="text-right" style={{ width: '70px' }}>Margin %</th>}
                                    {activeView === 'internal' && <th className="text-right" style={{ width: '100px' }}>Sell Rate</th>}
                                    <th className="text-right" style={{ width: '130px' }}>Amount (AED)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bill-row"><td colSpan="9"><strong>BILL 1 — PRELIMINARIES</strong></td></tr>
                                {boqLines.map(line => (
                                    <tr key={line.item}>
                                        <td className="font-mono small">{line.item}</td>
                                        <td>{line.description}</td>
                                        <td className="text-center">{line.unit}</td>
                                        <td className="text-right">{formatNumber(line.qty)}</td>
                                        {activeView === 'client' && <td className="text-right font-mono">{formatNumber(line.sellRate)}</td>}
                                        {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(line.costRate)}</td>}
                                        {activeView === 'internal' && <td className="text-right">{line.marginPercent}%</td>}
                                        {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(line.sellRate)}</td>}
                                        <td className="text-right font-mono"><strong>{formatNumber(line.amount)}</strong></td>
                                    </tr>
                                ))}
                                <tr className="subtotal-row"><td colSpan="8" className="text-right"><strong>Subtotal — Bill 1</strong></td><td className="text-right font-mono"><strong>{formatNumber(1843900)}</strong></td></tr>

                                <tr className="bill-row"><td colSpan="9"><strong>BILL 2 — SUBSTRUCTURE</strong></td></tr>
                                {substructureLines.map(line => (
                                    <tr key={line.item}>
                                        <td className="font-mono small">{line.item}</td>
                                        <td>{line.description}</td>
                                        <td className="text-center">{line.unit}</td>
                                        <td className="text-right">{formatNumber(line.qty)}</td>
                                        {activeView === 'client' && <td className="text-right font-mono">{formatNumber(line.sellRate)}</td>}
                                        {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(line.costRate)}</td>}
                                        {activeView === 'internal' && <td className="text-right">{line.marginPercent}%</td>}
                                        {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(line.sellRate)}</td>}
                                        <td className="text-right font-mono"><strong>{formatNumber(line.amount)}</strong></td>
                                    </tr>
                                ))}
                                <tr className="subtotal-row"><td colSpan="8" className="text-right"><strong>Subtotal — Bill 2</strong></td><td className="text-right font-mono"><strong>{formatNumber(2031653)}</strong></td></tr>

                                <tr className="bill-row"><td colSpan="9"><strong>BILL 3 — SUPERSTRUCTURE</strong></td></tr>
                                {superstructureLines.map(line => (
                                    <tr key={line.item}>
                                        <td className="font-mono small">{line.item}</td>
                                        <td>{line.description}</td>
                                        <td className="text-center">{line.unit}</td>
                                        <td className="text-right">{formatNumber(line.qty)}</td>
                                        {activeView === 'client' && <td className="text-right font-mono">{formatNumber(line.sellRate)}</td>}
                                        {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(line.costRate)}</td>}
                                        {activeView === 'internal' && <td className="text-right">{line.marginPercent}%</td>}
                                        {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(line.sellRate)}</td>}
                                        <td className="text-right font-mono"><strong>{formatNumber(line.amount)}</strong></td>
                                    </tr>
                                ))}
                                <tr className="contractor-row">
                                    <td className="font-mono small">3.A</td>
                                    <td><strong>Contractor's sundries & lateral restraints allowance</strong> <span className="text-muted small">★ added by Intrakore</span></td>
                                    <td className="text-center">lot</td>
                                    <td className="text-right">1.00</td>
                                    {activeView === 'client' && <td className="text-right font-mono">{formatNumber(186000)}</td>}
                                    {activeView === 'internal' && <td className="text-right font-mono">186000</td>}
                                    {activeView === 'internal' && <td className="text-right">0%</td>}
                                    {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(186000)}</td>}
                                    <td className="text-right font-mono"><strong>{formatNumber(186000)}</strong></td>
                                </tr>
                                <tr className="subtotal-row"><td colSpan="8" className="text-right"><strong>Subtotal — Bill 3</strong></td><td className="text-right font-mono"><strong>{formatNumber(9680620)}</strong></td></tr>

                                <tr className="bill-row"><td colSpan="9"><strong>BILL 4 — FIT-OUT FINISHES</strong></td></tr>
                                {fitoutLines.map(line => (
                                    <tr key={line.item}>
                                        <td className="font-mono small">{line.item}</td>
                                        <td>{line.description}</td>
                                        <td className="text-center">{line.unit}</td>
                                        <td className="text-right">{formatNumber(line.qty)}</td>
                                        {activeView === 'client' && <td className="text-right font-mono">{formatNumber(line.sellRate)}</td>}
                                        {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(line.costRate)}</td>}
                                        {activeView === 'internal' && <td className="text-right">{line.marginPercent}%</td>}
                                        {activeView === 'internal' && <td className="text-right font-mono">{formatNumber(line.sellRate)}</td>}
                                        <td className="text-right font-mono"><strong>{formatNumber(line.amount)}</strong></td>
                                    </tr>
                                ))}
                                <tr className="subtotal-row"><td colSpan="8" className="text-right"><strong>Subtotal — Bill 4</strong></td><td className="text-right font-mono"><strong>{formatNumber(12921400)}</strong></td></tr>

                                <tr className="subtotal-row"><td colSpan="8" className="text-right"><strong>Sum of Bills 1–4</strong></td><td className="text-right font-mono">{formatNumber(26477573)}</td></tr>
                                <tr className="total-row"><td colSpan="8" className="text-right"><strong>BID TOTAL (excluding VAT)</strong></td><td className="text-right font-mono"><strong>{formatNumber(32826753)}</strong></td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="legend">
                        <span className="legend-item"><span className="legend-color bill"></span> Bill</span>
                        <span className="legend-item"><span className="legend-color contractor"></span> Contractor addition (★)</span>
                        <span className="legend-item"><span className="legend-color subtotal"></span> Subtotal</span>
                    </div>
                </div>

                {/* Right: Qualifications Block */}
                <div className="qualifications-container">
                    <div className="qual-header">
                        <h4>Qualifications & Assumptions</h4>
                        <span className="small text-muted">14 line-level · 6 bid-level · showing for: <strong>{activeView === 'client' ? 'Client BOQ view' : 'Internal view'}</strong></span>
                    </div>

                    {/* Bid-level Qualifications */}
                    <div className="qual-section">
                        <div className="section-title">
                            <span>BID-LEVEL QUALIFICATIONS</span>
                            <span className="section-count">6 total · {bidQualifications.filter(q => q.visible).length} visible · {bidQualifications.filter(q => !q.visible).length} suppressed</span>
                        </div>
                        {bidQualifications.map(qual => (
                            <div key={qual.id} className={`qual-row ${!qual.visible ? 'suppressed' : ''}`}>
                                <div className="qual-toggle">
                                    <i className={`fa ${qual.visible ? 'fa-eye' : 'fa-eye-slash'}`} onClick={() => toggleQualVisibility(qual.id, true)}></i>
                                </div>
                                <div className="qual-code">{qual.code}</div>
                                <div className="qual-content">
                                    <div className="qual-text">{qual.text}</div>
                                    <div className="qual-tags">
                                        <span className="tag bid">Bid-level</span>
                                        <span className={`tag ${qual.visible ? 'visible' : 'suppressed'}`}>
                                            {qual.visible ? 'Visible in Client BOQ' : 'Suppressed — internal only'}
                                        </span>
                                    </div>
                                </div>
                                <div className="qual-actions">
                                    <button className="btn btn-link btn-xs" onClick={() => editQualification(qual)}><i className="fa fa-edit"></i></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Line-level Qualifications */}
                    <div className="qual-section">
                        <div className="section-title">
                            <span>LINE-LEVEL QUALIFICATIONS</span>
                            <span className="section-count">14 total · {lineQualifications.filter(q => q.visible).length} visible · {lineQualifications.filter(q => !q.visible).length} suppressed</span>
                        </div>
                        {visibleLineQualifications.map(qual => (
                            <div key={qual.id} className={`qual-row ${!qual.visible ? 'suppressed' : ''}`}>
                                <div className="qual-toggle">
                                    <i className={`fa ${qual.visible ? 'fa-eye' : 'fa-eye-slash'}`} onClick={() => toggleQualVisibility(qual.id, false)}></i>
                                </div>
                                <div className="qual-code">{qual.lineRef}</div>
                                <div className="qual-content">
                                    <div className="qual-text">{qual.text}</div>
                                    <div className="qual-tags">
                                        <span className="tag line">Line-level</span>
                                        <span className={`tag ${qual.visible ? 'visible' : 'suppressed'}`}>
                                            {qual.visible ? 'Visible in Client BOQ' : 'Suppressed — internal only'}
                                        </span>
                                    </div>
                                </div>
                                <div className="qual-actions">
                                    <button className="btn btn-link btn-xs" onClick={() => editQualification(qual)}><i className="fa fa-edit"></i></button>
                                </div>
                            </div>
                        ))}
                        {hiddenLineQualifications.length > 0 && (
                            <button className="btn btn-link btn-sm show-more" onClick={() => setShowAllLineQuals(!showAllLineQuals)}>
                                <i className={`fa fa-chevron-${showAllLineQuals ? 'up' : 'down'}`}></i>
                                {showAllLineQuals ? 'Show less' : `+ Show ${hiddenLineQualifications.length} more line qualifications`}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar mt-4 pt-3 border-top">
                <button className="btn btn-default" onClick={goBack}>
                    <i className="fa fa-chevron-left"></i> Back to review & submit
                </button>
                <div className="flex gap-2">
                    <button className="btn btn-default" onClick={generateBidPack}>
                        <i className="fa fa-file-archive-o"></i> Generate full bid pack
                    </button>
                    <button className="btn btn-default" onClick={printPreview}>
                        <i className="fa fa-print"></i> Print preview
                    </button>
                    <button className="btn btn-primary" onClick={downloadExcel}>
                        <i className="fa fa-download"></i> Download Excel
                    </button>
                </div>
            </div>

            {/* Bid Pack Modal */}
            {bidPackOpen && (
                <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setBidPackOpen(false)}>
                    <div className="modal-dialog modal-md" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Generate full bid pack</h4>
                                <button type="button" className="close" onClick={() => setBidPackOpen(false)}>&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="checkbox"><label><input type="checkbox" defaultChecked /> Cover letter</label></div>
                                <div className="checkbox"><label><input type="checkbox" defaultChecked /> Priced BOQ (Excel)</label></div>
                                <div className="checkbox"><label><input type="checkbox" defaultChecked /> Priced BOQ (PDF)</label></div>
                                <div className="checkbox"><label><input type="checkbox" defaultChecked /> Bid qualifications schedule</label></div>
                                <div className="checkbox"><label><input type="checkbox" defaultChecked /> Provisional Sums summary</label></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" onClick={() => setBidPackOpen(false)}>Cancel</button>
                                <button type="button" className="btn btn-primary" onClick={generatePack}>↓ Generate & download (.zip)</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Export;