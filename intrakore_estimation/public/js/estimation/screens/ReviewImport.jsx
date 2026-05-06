// ReviewImport.jsx - Column mapping and row classification
import React, { useState } from 'react';

const ReviewImport = ({ frappe, bid, onNavigate, onUpdateBid, onShowToast }) => {
    const [availableColumns] = useState([
        'Col A — "Item No."', 
        'Col B — "Description"', 
        'Col C — "Unit"', 
        'Col D — "Qty"', 
        'Col E — "Rate (AED)"', 
        'Col F — "Amount"'
    ]);

    const [columnMappings, setColumnMappings] = useState([
        { field: 'item', label: 'Item ref', tooltip: 'The BOQ line reference (1.1, 2.1.1 etc)', selectedColumn: 'Col A — "Item No."' },
        { field: 'description', label: 'Description', tooltip: 'Description of work', selectedColumn: 'Col B — "Description"' },
        { field: 'unit', label: 'Unit', tooltip: 'Unit of measurement', selectedColumn: 'Col C — "Unit"' },
        { field: 'qty', label: 'Qty', tooltip: 'Quantity', selectedColumn: 'Col D — "Qty"' },
        { field: 'rate', label: 'Rate (blank)', tooltip: 'Rate field (may be empty)', selectedColumn: 'Col E — "Rate (AED)"' },
        { field: 'amount', label: 'Amount (blank)', tooltip: 'Amount field (may be empty)', selectedColumn: 'Col F — "Amount"' }
    ]);

    const [previewRows, setPreviewRows] = useState([
        { id: 1, item: '1.1', description: 'Site establishment & hoarding', unit: 'lot', qty: '1.00', type: 'line', rowClass: '', warning: null, aiSuggestion: null },
        { id: 2, item: '1.2', description: 'Project management & supervision', unit: 'mo', qty: '9.00', type: 'line', rowClass: '', warning: null, aiSuggestion: null },
        { id: 3, item: '1.3', description: 'Temporary power & water', unit: 'lot', qty: '1.00', type: 'line', rowClass: '', warning: null, aiSuggestion: null },
        { id: 4, item: '1.4', description: 'Site supervision & safety', unit: '', qty: '', type: 'section', rowClass: 'section-row', warning: null, aiSuggestion: 'Section header' },
        { id: 5, item: '1.4.1', description: 'Project Manager (full time)', unit: 'mo', qty: '9.00', type: 'line', rowClass: '', warning: null, aiSuggestion: null },
        { id: 6, item: '', description: 'Subtotal — Bill 1 Preliminaries', unit: '', qty: '', type: 'total', rowClass: 'total-row', warning: null, aiSuggestion: 'Total row' },
        { id: 7, item: '2.1.1', description: 'Excavation to reduced level', unit: 'm³', qty: '1,240.00', type: 'line', rowClass: '', warning: null, aiSuggestion: null },
        { id: 8, item: '2.1.3', description: 'Dewatering allowance', unit: '', qty: '1.00', type: 'line', rowClass: 'warning-row', warning: 'Qty present but no unit. Kore is unsure — review.', aiSuggestion: 'Line item' },
        { id: 9, item: '2.5', description: 'PS — Allowance for unforeseen ground conditions', unit: 'lot', qty: '1.00', type: 'line', rowClass: 'warning-row', warning: 'Provisional Sum — qty is "lot 1" but Kore is unsure', aiSuggestion: 'Line item (Provisional Sum)' },
        { id: 10, item: '3.1.1', description: 'Reinforced concrete columns', unit: 'm³', qty: '186.00', type: 'line', rowClass: '', warning: null, aiSuggestion: null },
        { id: 11, item: '3.4.1', description: 'Unitised aluminium curtain wall', unit: 'm²', qty: '2,840.00', type: 'line', rowClass: '', warning: null, aiSuggestion: null },
        { id: 12, item: '4.8.2', description: 'PS — Owner-supplied sanitary ware', unit: 'lot', qty: '1.00', type: 'line', rowClass: 'warning-row', warning: 'Provisional Sum item — review', aiSuggestion: 'Line item (Provisional Sum)' }
    ]);

    const updateRowType = (id, newType) => {
        setPreviewRows(prev => prev.map(row => 
            row.id === id ? { ...row, type: newType } : row
        ));
    };

    const updateColumnMapping = (field, value) => {
        setColumnMappings(prev => prev.map(map => 
            map.field === field ? { ...map, selectedColumn: value } : map
        ));
    };

    const getRowClass = (row) => {
        if (row.type === 'section') return 'section-row';
        if (row.type === 'total') return 'total-row';
        if (row.warning) return 'warning-row';
        return '';
    };

    const getTotalLines = () => {
        return previewRows.filter(r => r.type === 'line').length;
    };

    const getAttentionCount = () => {
        return previewRows.filter(r => r.warning).length;
    };

    const continueToTagging = () => {
        const ambiguousRows = previewRows.filter(row => row.warning && row.type === 'line');
        
        if (ambiguousRows.length > 0) {
            frappe.msgprint({
                title: __('Ambiguous Rows'),
                message: __('{0} ambiguous rows still need review. Please classify them before continuing.', [ambiguousRows.length]),
                indicator: 'orange'
            });
            return;
        }
        
        const reviewData = {
            columnMappings: columnMappings,
            rows: previewRows,
            totalLines: getTotalLines()
        };
        
        onUpdateBid({ reviewData });
        onNavigate('PackageTagging');
    };

    const goBack = () => {
        onNavigate('BOQUpload');
    };

    return (
        <div className="review-import-screen">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="mb-0">Review Imported BOQ</h3>
                    <div className="small text-muted" style={{ marginTop: '4px' }}>
                        Bid: <strong>{bid?.code || bid?.bid_code}</strong> · Confirm column mapping and row types — Kore got it 94% right, you're checking the rest
                    </div>
                </div>
            </div>

            <div className="alert alert-info mb-4">
                <div className="flex items-start">
                    <i className="fa fa-robot mr-2"></i>
                    <div>
                        <strong>Kore parsed 247 rows</strong> — {getTotalLines()} line items, 22 headers, 7 totals. Items must have a description AND (qty OR unit) to be priceable.
                        <strong> {getAttentionCount()} rows are ambiguous</strong> (qty present but no unit, or vice versa) — they're flagged amber. Adjust any row's type from the dropdown.
                    </div>
                </div>
            </div>

            <div className="review-layout">
                {/* Left: Column Mapping Sidebar */}
                <div className="review-sidebar">
                    <h4 className="mb-3">Column mapping</h4>
                    
                    {columnMappings.map(map => (
                        <div key={map.field} className="mapping-item">
                            <label className="mapping-label">
                                {map.label} 
                                <i className="fa fa-question-circle text-muted" style={{ marginLeft: '4px', cursor: 'help' }} title={map.tooltip}></i>
                            </label>
                            <select 
                                className="form-control form-control-sm" 
                                value={map.selectedColumn}
                                onChange={(e) => updateColumnMapping(map.field, e.target.value)}
                            >
                                {availableColumns.map(col => (
                                    <option key={col} value={col}>{col}</option>
                                ))}
                            </select>
                        </div>
                    ))}

                    <div className="mt-4 pt-3 border-top">
                        <h4 className="mb-3">Row classification</h4>
                        
                        <div className="classification-stats">
                            <div className="stat-row">
                                <span className="stat-name"><span className="stat-swatch line"></span>Line items</span>
                                <span className="stat-count">{previewRows.filter(r => r.type === 'line').length}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-name"><span className="stat-swatch bill"></span>Bill headers</span>
                                <span className="stat-count">{previewRows.filter(r => r.type === 'bill').length}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-name"><span className="stat-swatch section"></span>Section headers</span>
                                <span className="stat-count">{previewRows.filter(r => r.type === 'section').length}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-name"><span className="stat-swatch total"></span>Totals / subtotals</span>
                                <span className="stat-count">{previewRows.filter(r => r.type === 'total').length}</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-name"><span className="stat-swatch ambiguous"></span>Ambiguous (review)</span>
                                <span className="stat-count" style={{ color: 'var(--warning-color)' }}>{getAttentionCount()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: BOQ Preview Table */}
                <div className="review-table-container">
                    <div className="table-responsive">
                        <table className="table table-bordered table-condensed table-hover">
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>Item</th>
                                    <th>Description</th>
                                    <th style={{ width: '60px' }}>Unit</th>
                                    <th className="text-right" style={{ width: '80px' }}>Qty</th>
                                    <th style={{ width: '140px' }}>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewRows.map(row => (
                                    <tr key={row.id} className={getRowClass(row)}>
                                        <td className="font-mono small">{row.item}</td>
                                        <td>
                                            {row.description}
                                            {row.warning && (
                                                <i className="fa fa-exclamation-triangle text-warning ml-1" title={row.warning}></i>
                                            )}
                                        </td>
                                        <td className="text-center">{row.unit}</td>
                                        <td className="text-right">{row.qty}</td>
                                        <td>
                                            <select 
                                                className={`form-control form-control-sm ${row.warning ? 'border-warning' : ''}`}
                                                value={row.type}
                                                onChange={(e) => updateRowType(row.id, e.target.value)}
                                            >
                                                <option value="line">Line item</option>
                                                <option value="bill">Bill header</option>
                                                <option value="section">Section header</option>
                                                <option value="total">Total</option>
                                                <option value="ignore">Ignore</option>
                                            </select>
                                            {row.aiSuggestion && (
                                                <div className="small text-muted mt-1">
                                                    <i className="fa fa-robot"></i> Kore suggested: {row.aiSuggestion}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="action-bar mt-4 pt-3 border-top">
                <button className="btn btn-default" onClick={goBack}>
                    <i className="fa fa-chevron-left"></i> Back
                </button>
                <div className="flex items-center gap-3">
                    <span className="small text-muted">
                        <strong>{getAttentionCount()} ambiguous rows still flagged</strong> — review before continuing
                    </span>
                    <button className="btn btn-primary" onClick={continueToTagging}>
                        Continue to package tagging <i className="fa fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewImport;