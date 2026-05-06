// ReviewSubmit.jsx - Final review and submission with pre-flight checks
import React, { useState } from 'react';

const ReviewSubmit = ({ frappe, bid, onNavigate, onUpdateBid, onShowToast }) => {
    const [showPreflight, setShowPreflight] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    const strategicReduction = 140552;
    const acquisitionAmount = 800653;
    
    const [packageMargins] = useState([
        { name: 'Prelims', cost: 1840000, marginPercent: 0, contPercent: 2.0, total: 1876800 },
        { name: 'Substructure', cost: 3460000, marginPercent: 11.8, contPercent: 3.5, total: 3989380 },
        { name: 'Superstructure', cost: 7286400, marginPercent: 12.4, contPercent: 3.4, total: 8438172 },
        { name: 'Façade & Cladding', cost: 5254000, marginPercent: 10.5, contPercent: 4.5, total: 6042100 },
        { name: 'Roofing & Wprf', cost: 410000, marginPercent: 14.0, contPercent: 5.0, total: 487900 },
        { name: 'Internal Finishes', cost: 3640000, marginPercent: 13.0, contPercent: 3.5, total: 4240600 },
        { name: 'Joinery', cost: 2140000, marginPercent: 14.5, contPercent: 4.0, total: 2535900 },
        { name: 'MEP — Mechanical', cost: 1920000, marginPercent: 10.0, contPercent: 3.0, total: 2169600 },
        { name: 'MEP — Electrical', cost: 1180000, marginPercent: 10.0, contPercent: 3.0, total: 1333400 },
        { name: 'MEP — Plumbing', cost: 560000, marginPercent: 10.0, contPercent: 3.0, total: 632800 },
        { name: 'Provisional Sums', cost: 420000, marginPercent: 0, contPercent: 0, total: 420000 }
    ]);

    const [qualifications, setQualifications] = useState([
        { id: 1, type: 'standard', text: 'Subject to formwork access by main contractor; assumes 2 reuses minimum.', meta: 'Attached to: 3.1.1, 3.1.2, 3.1.4 · Source: Cost Library' },
        { id: 2, type: 'standard', text: 'Assumes uninterrupted concrete pour cycles. Standby crew costs in event of delay are reimbursable.', meta: 'Attached to: Substructure, Superstructure · Source: Library' },
        { id: 3, type: 'standard', text: 'Excludes asbestos removal and any contaminated material handling.', meta: 'Attached to: Bid-level · Source: Library' },
        { id: 4, type: 'bid', text: 'Façade rate held for 60 days; subject to AED/EUR rate as at 24 Apr 2026.', meta: 'Attached to: Façade & Cladding · Added by Ravi K.' },
        { id: 5, type: 'bid', text: 'MEP rates exclude any specialist commissioning beyond basic T&C.', meta: 'Attached to: MEP packages · Added by Ravi K.' },
        { id: 6, type: 'standard', suggested: true, text: 'Extended preliminaries — programme extension beyond contract date reimbursable at AED 12,500/day.', meta: 'Suggested by Kore — standard on your last 6 tower bids ≥ AED 25M.' }
    ]);

    const formatNumber = (value) => {
        if (!value && value !== 0) return '0';
        return value.toLocaleString();
    };

    const bidSubtotal = (() => {
        let cost = 0, total = 0, marginSum = 0, contSum = 0;
        for (const pkg of packageMargins) {
            cost += pkg.cost;
            total += pkg.total;
            marginSum += pkg.marginPercent * pkg.cost;
            contSum += pkg.contPercent * pkg.cost;
        }
        return {
            cost: cost,
            total: total,
            marginPercent: cost ? Math.round((marginSum / cost) * 10) / 10 : 0,
            contPercent: cost ? Math.round((contSum / cost) * 10) / 10 : 0
        };
    })();

    const bidTotalWithAcquisition = bidSubtotal.total - strategicReduction + acquisitionAmount;

    const addSuggestedQualification = (qual) => {
        const index = qualifications.findIndex(q => q.id === qual.id);
        if (index !== -1) {
            const newQual = { 
                ...qual, 
                suggested: false, 
                id: Date.now(),
                type: 'bid',
                meta: `Added by ${frappe.session?.user || 'Estimator'} on ${new Date().toLocaleDateString()}`
            };
            const newQualifications = [...qualifications];
            newQualifications.splice(index, 1);
            setQualifications([newQual, ...newQualifications]);
            onShowToast('Success', 'Qualification added to bid');
        }
    };

    const editQualification = (qual) => {
        frappe.msgprint({
            title: __('Edit Qualification'),
            message: __('Edit qualification: ') + qual.text.substring(0, 50),
            indicator: 'blue'
        });
    };

    const addQualification = () => {
        frappe.msgprint({
            title: __('Add Qualification'),
            message: __('Qualification editor would open here.'),
            indicator: 'blue'
        });
    };

    const submitForReview = async () => {
        setSubmitting(true);
        
        const submitData = {
            bid_code: bid?.code || bid?.bid_code,
            bid_total: bidTotalWithAcquisition,
            submitted_at: new Date().toISOString(),
            status: 'cm-review',
            qualifications: qualifications.filter(q => !q.suggested)
        };

        try {
            const response = await frappe.call({
                method: 'intrakore_estimation.intrakore_estimation.api.submit_bid_for_review',
                args: { submit_data: submitData },
                freeze: true,
                freeze_message: 'Submitting bid for review...'
            });

            if (response.message) {
                onShowToast('Success', `Bid ${bid?.code} submitted for CM review`);
                onUpdateBid({ submitData });
                onNavigate('BidList');
            }
        } catch (error) {
            console.error('API error:', error);
            onShowToast('Success (Demo)', `Bid ${bid?.code} submitted in demo mode`);
            onUpdateBid({ submitData });
            onNavigate('BidList');
        } finally {
            setSubmitting(false);
        }
    };

    const saveAndExit = () => {
        const reviewData = {
            qualifications: qualifications,
            bidTotal: bidTotalWithAcquisition,
            reviewedAt: new Date().toISOString()
        };
        onUpdateBid({ reviewData });
        onNavigate('BidList');
    };

    const goBack = () => {
        onNavigate('BidStrategy');
    };

    const previewBid = () => {
        onNavigate('Export');
    };

    const goToPricing = () => {
        onNavigate('Pricing');
    };

    return (
        <div className="review-submit-screen">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="mb-0">Review & Submit</h3>
                    <div className="small text-muted" style={{ marginTop: '4px' }}>
                        Bid: <strong>{bid?.code || bid?.bid_code}</strong> · Final check before CM review
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-default btn-sm" onClick={previewBid}>
                        <i className="fa fa-eye"></i> Preview bid
                    </button>
                    <button className="btn btn-default btn-sm" onClick={saveAndExit}>
                        <i className="fa fa-save"></i> Save & exit
                    </button>
                </div>
            </div>

            {/* Pre-flight Strip */}
            <div className="preflight-strip">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        <span className="status-badge pass">3 ✓</span>
                        <span className="status-badge warn">1 ⚐</span>
                        <span className="status-badge fail">2 ⚠</span>
                    </div>
                    <span className="small">
                        <strong>2 issues to fix.</strong> 3 lines unpriced · qualifications missing <em>extended preliminaries</em>.
                    </span>
                </div>
                <button className="btn btn-link btn-sm" onClick={() => setShowPreflight(!showPreflight)}>
                    {showPreflight ? 'Hide details ↑' : 'View details ↓'}
                </button>
            </div>

            {/* Pre-flight Details */}
            {showPreflight && (
                <div className="preflight-details">
                    <div className="detail-item pass">
                        <i className="fa fa-check-circle text-success"></i>
                        <span><strong>All 218 lines tagged to a package.</strong> Provisional Sums (3) and PC Sums (1) flagged separately.</span>
                    </div>
                    <div className="detail-item pass">
                        <i className="fa fa-check-circle text-success"></i>
                        <span><strong>Bid total reconciles to priced BOQ.</strong> AED {formatNumber(bidTotalWithAcquisition)} incl. AED {formatNumber(acquisitionAmount)} bid acquisition cost.</span>
                    </div>
                    <div className="detail-item pass">
                        <i className="fa fa-check-circle text-success"></i>
                        <span><strong>215 of 218 lines confirmed by estimator.</strong> Confirmed lines lock at submission.</span>
                    </div>
                    <div className="detail-item warn">
                        <i className="fa fa-exclamation-triangle text-warning"></i>
                        <span><strong>Bid acquisition cost set at 2.5%.</strong> Above the 2.0% standard — CM will see and may adjust.</span>
                    </div>
                    <div className="detail-item fail">
                        <i className="fa fa-times-circle text-danger"></i>
                        <span><strong>3 lines unpriced.</strong> 3.2.3 Fire protection · 4.6.1 Bespoke joinery · 5.1.2 BMS integration. 
                            <button className="btn btn-link btn-xs" onClick={goToPricing}> Fix in pricing →</button>
                        </span>
                    </div>
                    <div className="detail-item fail">
                        <i className="fa fa-times-circle text-danger"></i>
                        <span><strong>Missing standard qualification: extended preliminaries.</strong> Present on your last 6 tower bids ≥ AED 25M.</span>
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="review-layout">
                {/* Left: Bid Summary Table */}
                <div className="bid-summary-card">
                    <h4 className="mb-3">Bid summary</h4>
                    <div className="table-responsive">
                        <table className="table table-bordered table-sm">
                            <thead>
                                <tr>
                                    <th>Package</th>
                                    <th className="text-right">Cost (AED)</th>
                                    <th className="text-right">Margin %</th>
                                    <th className="text-right">Cont. %</th>
                                    <th className="text-right">Total (AED)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {packageMargins.map(pkg => (
                                    <tr key={pkg.name}>
                                        <td>{pkg.name}</td>
                                        <td className="text-right font-mono">{formatNumber(pkg.cost)}</td>
                                        <td className="text-right">{pkg.marginPercent}%</td>
                                        <td className="text-right">{pkg.contPercent}%</td>
                                        <td className="text-right font-mono">{formatNumber(pkg.total)}</td>
                                    </tr>
                                ))}
                                <tr className="subtotal-row">
                                    <td><strong>Bid subtotal</strong></td>
                                    <td className="text-right font-mono"><strong>{formatNumber(bidSubtotal.cost)}</strong></td>
                                    <td className="text-right"><strong>{bidSubtotal.marginPercent}%</strong></td>
                                    <td className="text-right"><strong>{bidSubtotal.contPercent}%</strong></td>
                                    <td className="text-right font-mono"><strong>{formatNumber(bidSubtotal.total)}</strong></td>
                                </tr>
                                <tr>
                                    <td>Strategic adjustments</td>
                                    <td className="text-right">—</td>
                                    <td className="text-right">—</td>
                                    <td className="text-right">—</td>
                                    <td className="text-right font-mono text-success">−{formatNumber(strategicReduction)}</td>
                                </tr>
                                <tr className="text-muted">
                                    <td>Bid acquisition cost @ 2.5% <span className="small">(internal)</span></td>
                                    <td className="text-right">—</td>
                                    <td className="text-right">—</td>
                                    <td className="text-right">—</td>
                                    <td className="text-right font-mono">+{formatNumber(acquisitionAmount)}</td>
                                </tr>
                                <tr className="total-row">
                                    <td><strong>BID TOTAL (excl. VAT)</strong></td>
                                    <td className="text-right">—</td>
                                    <td className="text-right">—</td>
                                    <td className="text-right">—</td>
                                    <td className="text-right font-mono"><strong>{formatNumber(bidTotalWithAcquisition)}</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Qualifications */}
                <div className="qualifications-card">
                    <div className="flex justify-between items-center mb-3">
                        <h4>Qualifications & clarifications (8)</h4>
                        <button className="btn btn-default btn-sm" onClick={addQualification}>
                            <i className="fa fa-plus"></i> Add
                        </button>
                    </div>
                    <div className="qualifications-list">
                        {qualifications.map(qual => (
                            <div key={qual.id} className={`qual-item ${qual.suggested ? 'missing' : ''}`}>
                                <div className="qual-header">
                                    <span className={`qual-type ${qual.type}`}>
                                        {qual.type === 'standard' ? 'Standard' : 'Bid-specific'}
                                    </span>
                                    <button className="btn btn-link btn-xs" onClick={() => editQualification(qual)}>
                                        <i className="fa fa-edit"></i>
                                    </button>
                                </div>
                                <div className="qual-text">{qual.text}</div>
                                <div className="qual-meta">{qual.meta}</div>
                                {qual.suggested && (
                                    <div className="qual-action">
                                        <button className="btn btn-primary btn-xs" onClick={() => addSuggestedQualification(qual)}>
                                            <i className="fa fa-plus"></i> Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar mt-4 pt-3 border-top">
                <button className="btn btn-default" onClick={goBack}>
                    <i className="fa fa-chevron-left"></i> Back to bid strategy
                </button>
                <div className="flex items-center gap-3">
                    <span className="small text-muted">
                        <strong>Bid total:</strong> <span className="font-mono font-bold text-primary">{formatNumber(bidTotalWithAcquisition)}</span> · Status: Draft
                    </span>
                    <button className="btn btn-primary" onClick={submitForReview} disabled={submitting}>
                        {submitting ? <i className="fa fa-spinner fa-spin"></i> : <i className="fa fa-paper-plane"></i>} 
                        Submit for CM Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewSubmit;