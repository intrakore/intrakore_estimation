// BidStrategy.jsx - Simplified with "Coming Soon" notice
import React, { useState } from 'react';

const BidStrategy = ({ frappe, bid, onNavigate, onUpdateBid, onShowToast }) => {
    const [loading, setLoading] = useState(false);

    const continueToReview = () => {
        onNavigate('ReviewSubmit');
    };

    const goBack = () => {
        onNavigate('Pricing');
    };

    const previewBid = () => {
        onNavigate('Export');
    };

    const saveAndExit = () => {
        onNavigate('BidList');
    };

    // Dummy summary data for preview
    const dummySummary = {
        totalCost: 28110400,
        totalMargin: 3070884,
        marginPercent: 11.0,
        totalContingency: 985368,
        contingencyPercent: 3.4,
        strategicReduction: 140552,
        pricedBOQ: 32026100,
        acquisitionCost: 800653,
        acquisitionPercent: 2.5,
        bidTotal: 32826753
    };

    const formatNumber = (value) => {
        if (!value && value !== 0) return '0';
        return value.toLocaleString();
    };

    // Dummy package data for preview table
    const dummyPackages = [
        { name: 'Preliminaries', cost: 1840000, marginPercent: 0.0, marginAed: 0, contPercent: 2.0, contAed: 36800 },
        { name: 'Substructure', cost: 3460000, marginPercent: 11.8, marginAed: 408280, contPercent: 3.5, contAed: 121100 },
        { name: 'Superstructure', cost: 7286400, marginPercent: 12.4, marginAed: 904034, contPercent: 3.4, contAed: 247738 },
        { name: 'Façade & Cladding', cost: 5254000, marginPercent: 10.5, marginAed: 551670, contPercent: 4.5, contAed: 236430 },
        { name: 'Roofing & Waterproofing', cost: 410000, marginPercent: 14.0, marginAed: 57400, contPercent: 5.0, contAed: 20500 },
        { name: 'Internal Finishes', cost: 3640000, marginPercent: 13.0, marginAed: 473200, contPercent: 3.5, contAed: 127400 },
        { name: 'Joinery', cost: 2140000, marginPercent: 14.5, marginAed: 310300, contPercent: 4.0, contAed: 85600 },
        { name: 'MEP Works', cost: 3660000, marginPercent: 10.0, marginAed: 366000, contPercent: 3.0, contAed: 109800 },
        { name: 'Provisional Sums', cost: 420000, marginPercent: 0.0, marginAed: 0, contPercent: 0.0, contAed: 0 }
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            {/* Coming Soon Banner */}
            <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                marginBottom: '24px',
                color: 'white'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Bid Strategy Module Coming Soon</h2>
                <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                    The bid strategy functionality is currently under development.
                    You can review the sample summary below as a preview of what's coming.
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        Margin Optimization
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        Contingency Management
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        Bid Acquisition Cost
                    </span>
                </div>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Bid Strategy Preview</h1>
                    <p style={{ color: '#666', fontSize: '12px' }}>
                        Bid: <strong>{bid?.bid_code || bid?.name || 'SAMPLE-BID-001'}</strong> · Sample strategy data shown for demonstration
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={previewBid}
                        style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
                    >
                        Preview Bid
                    </button>
                    <button 
                        onClick={saveAndExit}
                        style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
                    >
                        Save & Exit
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
                {/* Left Panel - Margin Table */}
                <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Margin Overview by Package</h3>
                        <button 
                            style={{ padding: '4px 12px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer', fontSize: '11px' }}
                            disabled
                        >
                            Apply Bid-wide Preset (Coming Soon)
                        </button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 8px', color: '#666', fontWeight: 600 }}>Package</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: '#666', fontWeight: 600 }}>Cost (AED)</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: '#666', fontWeight: 600 }}>Margin %</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: '#666', fontWeight: 600 }}>Margin AED</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: '#666', fontWeight: 600 }}>Cont. %</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: '#666', fontWeight: 600 }}>Cont. AED</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dummyPackages.map((pkg, idx) => (
                                    <tr key={pkg.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '10px 8px', fontWeight: 500 }}>{pkg.name}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(pkg.cost)}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>{pkg.marginPercent}%</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(pkg.marginAed)}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>{pkg.contPercent}%</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(pkg.contAed)}</td>
                                    </tr>
                                ))}
                                <tr style={{ borderTop: '2px solid #e0e0e0', background: '#f9f9f9', fontWeight: 'bold' }}>
                                    <td style={{ padding: '10px 8px' }}>Bid Total</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(dummySummary.totalCost)}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{dummySummary.marginPercent}%</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(dummySummary.totalMargin)}</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{dummySummary.contingencyPercent}%</td>
                                    <td style={{ padding: '10px 8px', textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(dummySummary.totalContingency)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Strategic Adjustments Section */}
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                            Strategic Adjustments 
                            <span style={{ fontSize: '11px', color: '#999', marginLeft: '6px' }}>(Coming Soon)</span>
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Reduce Contingency By</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                        type="number" 
                                        style={{ width: '80px', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        value="0.5"
                                        disabled
                                    />
                                    <span style={{ fontSize: '12px', color: '#666' }}>% of cost</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                                    Saves <strong>AED 140,552</strong> · Coming soon
                                </div>
                            </div>
                            <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Reduce Margin By</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                        type="number" 
                                        style={{ width: '80px', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        value="0"
                                        disabled
                                    />
                                    <span style={{ fontSize: '12px', color: '#666' }}>%</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#888', marginTop: '6px' }}>
                                    No reduction applied · Coming soon
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bid Acquisition Cost Section */}
                    <div style={{ marginTop: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '6px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
                            Bid Acquisition Cost
                            <span style={{ fontSize: '11px', color: '#999', marginLeft: '6px' }}>(Coming Soon)</span>
                        </h3>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <input type="radio" name="method" checked disabled /> % of value
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <input type="radio" name="method" disabled /> Fixed AED
                            </label>
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>Acquisition Rate</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input 
                                    type="number" 
                                    style={{ width: '100px', padding: '4px 8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    value="2.5"
                                    disabled
                                />
                                <span style={{ fontSize: '12px', color: '#666' }}>%</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '12px', padding: '8px', background: '#fff8e1', borderRadius: '4px' }}>
                            <i className="fa fa-lock"></i> Bid acquisition cost is visible only to CM and Director roles. Coming soon.
                        </div>
                    </div>
                </div>

                {/* Right Panel - Bid Summary */}
                <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', height: 'fit-content', position: 'sticky', top: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0', marginBottom: '12px' }}>Bid Summary</h3>
                    
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Total Cost</span>
                            <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: 500 }}>{formatNumber(dummySummary.totalCost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Margin ({dummySummary.marginPercent}%)</span>
                            <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#4caf50' }}>+{formatNumber(dummySummary.totalMargin)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Contingency ({dummySummary.contingencyPercent}%)</span>
                            <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#ff9800' }}>+{formatNumber(dummySummary.totalContingency)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e0e0e0', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Strategic Reduction</span>
                            <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#f44336' }}>-{formatNumber(dummySummary.strategicReduction)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 'bold' }}>
                            <span style={{ fontSize: '14px' }}>Priced BOQ</span>
                            <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>{formatNumber(dummySummary.pricedBOQ)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                            <span style={{ fontSize: '12px', color: '#666' }}>Bid Acquisition Cost ({dummySummary.acquisitionPercent}%)</span>
                            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>+{formatNumber(dummySummary.acquisitionCost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: '8px', borderTop: '2px solid #e0e0e0', fontWeight: 'bold' }}>
                            <span style={{ fontSize: '16px', color: '#2196f3' }}>Bid Total</span>
                            <span style={{ fontSize: '18px', fontFamily: 'monospace', color: '#2196f3', fontWeight: 'bold' }}>{formatNumber(dummySummary.bidTotal)}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '16px', padding: '12px', background: '#e3f2fd', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <i className="fa fa-info-circle" style={{ color: '#2196f3', marginTop: '2px' }}></i>
                            <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.4' }}>
                                Bid acquisition cost blends proportionally into each line rate in the export. 
                                The client sees a single rate per line.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                <button 
                    onClick={goBack}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
                >
                    ← Back to Pricing
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                        <strong>Bid total:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#2196f3', fontSize: '14px' }}>{formatNumber(dummySummary.bidTotal)}</span> · Status: Draft
                    </span>
                    <button 
                        onClick={continueToReview}
                        style={{ padding: '8px 20px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Continue to Review & Submit →
                    </button>
                </div>
            </div>

            {/* Info Note */}
            <div style={{ marginTop: '20px', padding: '12px', background: '#fff8e1', borderRadius: '8px', borderLeft: '3px solid #ff9800' }}>
                <p style={{ fontSize: '12px', color: '#666' }}>
                    <strong>📌 Note:</strong> This is a preview of the bid strategy module. 
                    The full feature will include:
                </p>
                <ul style={{ fontSize: '11px', color: '#666', marginTop: '8px', marginLeft: '20px' }}>
                    <li>Real-time margin adjustments at package and line level</li>
                    <li>Contingency management with strategic reductions</li>
                    <li>Bid acquisition cost calculation and allocation</li>
                    <li>Bulk margin application across packages</li>
                    <li>Comparative analysis against historical bids</li>
                </ul>
            </div>
        </div>
    );
};

export default BidStrategy;