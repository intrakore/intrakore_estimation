// Pricing.jsx - Simplified with "Coming Soon" notice
import React, { useState, useEffect } from 'react';

const Pricing = ({ frappe, bid, onNavigate, onUpdateBid, onShowToast }) => {
    const [loading, setLoading] = useState(false);
    const [packages, setPackages] = useState([
        { name: 'Preliminaries', total: 14, confirmed: 14, color: 'blue' },
        { name: 'Substructure', total: 22, confirmed: 22, color: 'green' },
        { name: 'Superstructure', total: 31, confirmed: 31, color: 'purple' },
        { name: 'Doors & Hardware', total: 18, confirmed: 18, color: 'yellow' },
        { name: 'MEP Works', total: 12, confirmed: 12, color: 'teal' },
        { name: 'Finishes', total: 25, confirmed: 25, color: 'pink' }
    ]);
    const [activePackage, setActivePackage] = useState('Superstructure');

    const continueToStrategy = () => {
        onNavigate('BidStrategy');
    };

    const goBack = () => {
        onNavigate('BOQReviewAndTagging');
    };

    const formatCurrency = (value) => {
        return 'AED ' + (value || 0).toLocaleString();
    };

    // Dummy data for the table
    const dummyLines = [
        { id: 1, item: '3.1.1', description: 'Reinforced concrete columns, grade C40', qty: 186, unit: 'm³', rate: 2410, amount: 448260 },
        { id: 2, item: '3.1.2', description: 'Reinforced concrete beams & slabs, grade C40', qty: 612, unit: 'm³', rate: 2260, amount: 1383120 },
        { id: 3, item: '3.2.1', description: 'Rebar B500B to columns & walls', qty: 74.4, unit: 'tonne', rate: 4180, amount: 310992 },
        { id: 4, item: '3.2.2', description: 'Rebar B500B to beams & slabs', qty: 183.6, unit: 'tonne', rate: 4180, amount: 767448 },
        { id: 5, item: '3.3.1', description: 'Structural steel beams, S275', qty: 284, unit: 'tonne', rate: 6250, amount: 1775000 },
        { id: 6, item: '3.3.2', description: 'Steel columns, S355', qty: 95, unit: 'tonne', rate: 6850, amount: 650750 },
        { id: 7, item: '3.4.1', description: 'Formwork to columns', qty: 1860, unit: 'm²', rate: 185, amount: 344100 },
        { id: 8, item: '3.4.2', description: 'Formwork to beams & slabs', qty: 6120, unit: 'm²', rate: 165, amount: 1009800 }
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
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Pricing Module Coming Soon</h2>
                <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                    The pricing functionality is currently under development. 
                    You can review the sample data below as a preview of what's coming.
                </p>
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        Material Cost Tracking
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        Margin & Contingency
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
                        AI Cost Suggestions
                    </span>
                </div>
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Pricing Preview</h1>
                    <p style={{ color: '#666', fontSize: '12px' }}>
                        Bid: <strong>{bid?.bid_code || bid?.name || 'SAMPLE-BID-001'}</strong> · Sample pricing data shown for demonstration
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        onClick={goBack}
                        style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
                    >
                        ← Back
                    </button>
                    <button 
                        onClick={continueToStrategy}
                        style={{ padding: '8px 20px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Continue to Strategy →
                    </button>
                </div>
            </div>
            
            {/* Package Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '12px' }}>
                {packages.map(pkg => (
                    <button
                        key={pkg.name}
                        onClick={() => setActivePackage(pkg.name)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: activePackage === pkg.name ? '#e3f2fd' : 'transparent',
                            color: activePackage === pkg.name ? '#1976d2' : '#666',
                            border: activePackage === pkg.name ? '1px solid #1976d2' : '1px solid transparent'
                        }}
                    >
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: pkg.color === 'blue' ? '#2196f3' : pkg.color === 'green' ? '#4caf50' : pkg.color === 'purple' ? '#9c27b0' : pkg.color === 'yellow' ? '#ff9800' : pkg.color === 'teal' ? '#009688' : '#e91e63'
                        }}></span>
                        <span>{pkg.name}</span>
                        <span style={{ fontSize: '10px', background: '#e0e0e0', padding: '2px 6px', borderRadius: '10px' }}>
                            {pkg.confirmed}/{pkg.total}
                        </span>
                    </button>
                ))}
            </div>
            
            {/* Package Summary Banner */}
            <div style={{ 
                background: '#e3f2fd', 
                borderRadius: '8px', 
                padding: '16px', 
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{activePackage}</h3>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                        {dummyLines.length} line items · All items confirmed
                    </p>
                </div>
                <span style={{ background: '#4caf50', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500 }}>
                    ✓ Package Complete
                </span>
            </div>
            
            {/* Lines Table */}
            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
                            <tr>
                                <th style={{ width: '40px', padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#666' }}>✓</th>
                                <th style={{ width: '80px', padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#666' }}>ITEM</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#666' }}>DESCRIPTION</th>
                                <th style={{ width: '70px', padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#666' }}>QTY</th>
                                <th style={{ width: '60px', padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#666' }}>UNIT</th>
                                <th style={{ width: '120px', padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#666' }}>SELL RATE</th>
                                <th style={{ width: '140px', padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 600, color: '#666' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyLines.map(line => (
                                <tr key={line.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            borderRadius: '50%', 
                                            background: '#4caf50', 
                                            color: 'white',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px'
                                        }}>✓</span>
                                    </td>
                                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>{line.item}</td>
                                    <td style={{ padding: '12px', fontSize: '12px' }}>{line.description}</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px' }}>{line.qty.toLocaleString()}</td>
                                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#666' }}>{line.unit}</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', fontWeight: 500, color: '#1976d2' }}>
                                        {formatCurrency(line.rate)}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>
                                        {formatCurrency(line.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Summary Footer */}
            <div style={{ marginTop: '20px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <span style={{ fontSize: '12px', color: '#666' }}>Package Summary</span>
                        <div>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{dummyLines.length}</span>
                            <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>line items</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Package Total</span>
                        <div>
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2196f3' }}>
                                {formatCurrency(dummyLines.reduce((sum, l) => sum + l.amount, 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div style={{ marginTop: '20px', padding: '12px', background: '#fff8e1', borderRadius: '8px', borderLeft: '3px solid #ff9800' }}>
                <p style={{ fontSize: '12px', color: '#666' }}>
                    <strong>📌 Note:</strong> This is a preview of the pricing module. 
                    The full feature will include:
                </p>
                <ul style={{ fontSize: '11px', color: '#666', marginTop: '8px', marginLeft: '20px' }}>
                    <li>Real-time cost component breakdown (Material, Manpower, Equipment, Subcontractors)</li>
                    <li>AI-powered rate suggestions from your cost library</li>
                    <li>Margin and contingency management at line and package level</li>
                    <li>Bulk pricing updates and cost comparison</li>
                </ul>
            </div>
        </div>
    );
};

export default Pricing;