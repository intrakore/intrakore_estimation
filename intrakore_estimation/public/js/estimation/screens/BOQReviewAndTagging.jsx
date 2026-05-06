// BOQReviewAndTagging.jsx - Complete BOQ review with package tagging, search, and collapsible column mapping
import React, { useState, useRef } from 'react';

const BOQReviewAndTagging = ({ frappe, bid, onNavigate, onUpdateBid, onShowToast }) => {
    // State management
    const [currentStep, setCurrentStep] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [showIndexDetails, setShowIndexDetails] = useState(false);
    const [showColumnMapping, setShowColumnMapping] = useState(true);
    const [selectedPackageFilter, setSelectedPackageFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [reviewRows, setReviewRows] = useState([]);
    const [taggedLines, setTaggedLines] = useState([]);
    const [availablePackages, setAvailablePackages] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editingCell, setEditingCell] = useState({ rowId: null, field: null });
    const [fileStats, setFileStats] = useState({
        bills: 0,
        lines: 0,
        headers: 0,
        totals: 0,
        ambiguous: 0,
        confidence: 0,
        packages: [],
        sectionCount: 0
    });
    
    const fileInputRef = useRef(null);
    const acceptedExtensions = ['.xlsx', '.xls', '.csv'];
    const maxSizeMB = 50;

    const packageColors = {
        'Preliminaries': '#3b82f6',
        'Substructure': '#10b981',
        'Superstructure': '#f59e0b',
        'Concrete Works': '#ef4444',
        'Reinforcement': '#8b5cf6',
        'Formwork': '#ec4898',
        'Structural Steel': '#06b6d4',
        'MEP Works': '#84cc16',
        'Façade & Cladding': '#14b8a6',
        'Roofing & Waterproofing': '#f97316',
        'Flooring Works': '#d946ef',
        'Wall Finishes': '#0ea5e9',
        'Ceiling Works': '#64748b',
        'Doors & Hardware': '#eab308',
        'Joinery & Carpentry': '#a855f7',
        'Glass & Mirrors': '#2dd4bf',
        'Sanitaryware': '#f43f5e',
        'Unassigned': '#6b7280'
    };

    const availableColumns = [
        'Col A — "Item No."', 
        'Col B — "Description"', 
        'Col C — "Unit"', 
        'Col D — "Qty"', 
        'Col E — "Rate (AED)"', 
        'Col F — "Amount"'
    ];

    const [columnMappings, setColumnMappings] = useState([
        { field: 'item', label: 'Item ref', selectedColumn: 'Col A — "Item No."' },
        { field: 'description', label: 'Description', selectedColumn: 'Col B — "Description"' },
        { field: 'unit', label: 'Unit', selectedColumn: 'Col C — "Unit"' },
        { field: 'qty', label: 'Qty', selectedColumn: 'Col D — "Qty"' },
        { field: 'rate', label: 'Rate (blank)', selectedColumn: 'Col E — "Rate (AED)"' },
        { field: 'amount', label: 'Amount (blank)', selectedColumn: 'Col F — "Amount"' }
    ]);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // ============ Inline Editing Functions ============
    const startEditing = (rowId, field) => {
        setEditingCell({ rowId, field });
    };

    const saveEdit = (rowId, field, newValue) => {
        setReviewRows(prev => prev.map(row => {
            if (row.id === rowId) {
                const updatedRow = { ...row, [field]: newValue };
                if (field === 'item' || field === 'description' || field === 'unit' || field === 'qty') {
                    const fieldMapping = {
                        'item': 'item_ref',
                        'description': 'description',
                        'unit': 'unit',
                        'qty': 'quantity'
                    };
                    updatedRow.original_data = {
                        ...row.original_data,
                        [fieldMapping[field]]: newValue
                    };
                }
                return updatedRow;
            }
            return row;
        }));
        setEditingCell({ rowId: null, field: null });
        onShowToast('Success', `${field} updated`);
    };

    const handleKeyDown = (e, rowId, field) => {
        if (e.key === 'Enter') {
            saveEdit(rowId, field, e.target.value);
        } else if (e.key === 'Escape') {
            setEditingCell({ rowId: null, field: null });
        }
    };

    const renderEditableCell = (row, field, value, type = 'text') => {
        const isEditing = editingCell.rowId === row.id && editingCell.field === field;
        
        if (isEditing) {
            return (
                <input
                    type={type === 'number' ? 'number' : 'text'}
                    defaultValue={value}
                    autoFocus={true}
                    onBlur={(e) => saveEdit(row.id, field, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, row.id, field)}
                    style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11px',
                        border: '1px solid #2196f3',
                        borderRadius: '3px',
                        outline: 'none'
                    }}
                />
            );
        }
        
        return (
            <div 
                onClick={() => startEditing(row.id, field)}
                style={{ 
                    cursor: 'pointer', 
                    minHeight: '24px',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                title="Click to edit"
            >
                {value || '-'}
            </div>
        );
    };

    // ============ Search Function ============
    const getFilteredLineItems = () => {
        if (!reviewRows.length) return [];
        
        let items = reviewRows.filter(row => row.type === 'line');
        
        // Filter by package
        if (selectedPackageFilter !== 'all') {
            const currentPackage = getPackageForLineRealTime(selectedPackageFilter);
            items = items.filter(item => getPackageForLineRealTime(item.id) === selectedPackageFilter);
        }
        
        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            items = items.filter(item => 
                (item.item && item.item.toLowerCase().includes(term)) ||
                (item.description && item.description.toLowerCase().includes(term)) ||
                (item.unit && item.unit.toLowerCase().includes(term))
            );
        }
        
        return items;
    };

    // ============ Selection Functions ============
    const toggleRowSelection = (rowId) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(rowId)) {
            newSelected.delete(rowId);
        } else {
            newSelected.add(rowId);
        }
        setSelectedRows(newSelected);
        setSelectAll(false);
    };

    const toggleSelectAll = () => {
        const filteredItems = getFilteredLineItems();
        if (selectAll) {
            setSelectedRows(new Set());
            setSelectAll(false);
        } else {
            const allIds = new Set();
            filteredItems.forEach(item => allIds.add(item.id));
            setSelectedRows(allIds);
            setSelectAll(true);
        }
    };

    const deleteSelectedRows = () => {
        const remainingRows = reviewRows.filter(row => !selectedRows.has(row.id));
        setReviewRows(remainingRows);
        setSelectedRows(new Set());
        setSelectAll(false);
        setShowDeleteConfirm(false);
        
        const remainingTagged = taggedLines.filter(line => remainingRows.some(row => row.id === line.id));
        setTaggedLines(remainingTagged);
        onShowToast('Success', `${selectedRows.size} line items deleted`);
    };

    const getSelectableCount = () => getFilteredLineItems().length;
    const getSelectedCount = () => selectedRows.size;

    // ============ File Upload & Parsing ============
    const processFile = async (file) => {
        if (file.size > maxSizeMB * 1024 * 1024) {
            frappe.msgprint({
                title: __('File Too Large'),
                message: __('File exceeds {0}MB limit', [maxSizeMB]),
                indicator: 'red'
            });
            return;
        }
        
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!acceptedExtensions.includes(ext)) {
            frappe.msgprint({
                title: __('Invalid File Type'),
                message: __('Please upload an Excel or CSV file'),
                indicator: 'red'
            });
            return;
        }
        
        setIsUploading(true);
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/method/intrakore_estimation.intrakore_estimation.api.upload_and_parse_boq', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Frappe-CSRF-Token': frappe.csrf_token,
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.message && result.message.success !== false) {
                const data = result.message;
                setUploadedFile(file);
                setParsedData(data);
                
                // Initialize review rows from parsed line items
                const initialReviewRows = (data.line_items || []).map((item, idx) => ({
                    id: idx,
                    item: item.item_ref || '',
                    description: item.description || '',
                    unit: item.unit || '',
                    qty: item.quantity || '',
                    type: 'line',
                    package: item.package || 'Unassigned',
                    suggested_package: item.package || 'Unassigned',
                    suggested_components: item.suggested_components || [],
                    warnings: item.warnings || [],
                    original_data: item
                }));
                setReviewRows(initialReviewRows);
                
                // Extract unique packages
                const packages = [...new Set(initialReviewRows.map(item => item.package).filter(p => p && p !== 'Unassigned'))];
                setAvailablePackages(['Unassigned', ...packages]);
                
                setFileStats({
                    bills: data.bills?.length || 0,
                    lines: data.total_lines || 0,
                    headers: data.total_headers || 0,
                    totals: data.total_totals || 0,
                    ambiguous: data.ambiguous_count || 0,
                    confidence: data.confidence || 0,
                    packages: packages,
                    sectionCount: data.index?.sections?.length || 0
                });
                
                setCurrentStep(1);
                onShowToast('Success', `File parsed successfully with ${data.confidence || 0}% confidence`);
                
                onUpdateBid({ 
                    boqData: data,
                    fileName: file.name,
                    fileSize: file.size
                });
            } else {
                throw new Error(result.message?.error || 'Parsing failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            onShowToast('Error', error.message || 'Failed to parse BOQ file');
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => fileInputRef.current?.click();
    
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) processFile(file);
        event.target.value = '';
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) processFile(file);
    };

    // ============ Tagging Functions ============
    const updatePackage = (id, newPackage) => {
        setTaggedLines(prev => {
            const existing = prev.find(t => t.id === id);
            if (existing) {
                return prev.map(t => t.id === id ? { ...t, package: newPackage } : t);
            }
            return [...prev, { id, package: newPackage }];
        });
        
        setReviewRows(prev => prev.map(row => 
            row.id === id ? { ...row, package: newPackage } : row
        ));
    };

    const getPackageForLine = (id) => {
        const tagged = taggedLines.find(t => t.id === id);
        if (tagged) return tagged.package;
        const row = reviewRows.find(r => r.id === id);
        return row?.suggested_package || 'Unassigned';
    };

    const getPackageForLineRealTime = (id) => {
        const row = reviewRows.find(r => r.id === id);
        return row?.package || 'Unassigned';
    };

    const getUntaggedCount = () => {
        return reviewRows.filter(row => {
            if (row.type !== 'line') return false;
            return getPackageForLineRealTime(row.id) === 'Unassigned';
        }).length;
    };

    const getPackageCounts = () => {
        const counts = {};
        reviewRows.forEach(row => {
            if (row.type !== 'line') return;
            const pkg = getPackageForLineRealTime(row.id);
            counts[pkg] = (counts[pkg] || 0) + 1;
        });
        return counts;
    };

    // ============ Save & Continue ============
const saveAndContinue = async () => {
    if (!Array.isArray(reviewRows) || reviewRows.length === 0) {
        onShowToast('Error', 'No line items to save');
        return;
    }
    
    const bidId = bid?.name || bid?.bid_code;
    
    if (!bidId) {
        onShowToast('Error', 'No bid selected');
        return;
    }
    
    const lineItemsToSave = [];
    for (const row of reviewRows) {
        if (!row || row.type !== 'line') continue;
        lineItemsToSave.push({
            item_ref: row.item || '',
            description: row.description || '',
            unit: row.unit || '',
            quantity: Number(row.qty) || 0,
            package: row.package || 'Unassigned',
            bill: row.bill || '',
            section: row.section || ''
        });
    }
    
    const finalData = {
        line_items: lineItemsToSave,
        index: parsedData?.index || {},
        // Add file URLs from the parsed data
        original_boq_url: parsedData?.original_boq_url || '',
        cleaned_boq_url: parsedData?.cleaned_boq_url || ''
    };
    
    try {
        const response = await frappe.call({
            method: 'intrakore_estimation.intrakore_estimation.api.save_parsed_boq',
            args: { 
                bid_id: bidId,
                boq_data: finalData
            }
        });
        
        if (response.message?.success) {
            onShowToast('Success', `Saved ${response.message.total_lines} BOQ lines`);
            onNavigate('Pricing');
        } else {
            throw new Error(response.message?.error || 'Save failed');
        }
    } catch (error) {
        console.error('Save error:', error);
        onShowToast('Error', error.message);
    }
};

    const goBack = () => {
        if (currentStep === 0) {
            onNavigate('BidWizard');
        } else {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateColumnMapping = (field, value) => {
        setColumnMappings(prev => prev.map(map => 
            map.field === field ? { ...map, selectedColumn: value } : map
        ));
    };

    // ============ Delete Confirmation Modal ============
    const DeleteConfirmModal = () => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={() => setShowDeleteConfirm(false)}>
            <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '400px',
                width: '90%',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Confirm Delete</h3>
                <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                    Are you sure you want to delete {selectedRows.size} selected line item(s)? 
                    This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-default" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={deleteSelectedRows} style={{ background: '#f44336', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    // ============ Progress Indicator ============
    const ProgressIndicator = () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 0', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', minWidth: '80px', cursor: 'pointer' }} onClick={() => currentStep > 0 && setCurrentStep(0)}>
                <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: currentStep >= 0 ? '#2196f3' : '#e0e0e0', 
                    color: 'white', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '8px' 
                }}>1</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: currentStep >= 0 ? '#2196f3' : '#999' }}>Upload BOQ</div>
            </div>
            <div style={{ width: '60px', height: '2px', background: currentStep >= 1 ? '#2196f3' : '#e0e0e0', margin: '0 8px', marginBottom: '28px' }}></div>
            <div style={{ textAlign: 'center', minWidth: '80px', cursor: 'pointer' }} onClick={() => currentStep > 1 && setCurrentStep(1)}>
                <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: currentStep >= 1 ? '#2196f3' : '#e0e0e0', 
                    color: 'white', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '8px' 
                }}>2</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: currentStep >= 1 ? '#2196f3' : '#999' }}>Review</div>
            </div>
            <div style={{ width: '60px', height: '2px', background: currentStep >= 2 ? '#2196f3' : '#e0e0e0', margin: '0 8px', marginBottom: '28px' }}></div>
            <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: currentStep >= 2 ? '#2196f3' : '#e0e0e0', 
                    color: 'white', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '8px' 
                }}>3</div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: currentStep >= 2 ? '#2196f3' : '#999' }}>Tagging</div>
            </div>
        </div>
    );

    // ============ Step 0: Upload Screen ============
    if (currentStep === 0) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Upload Client BOQ</h1>
                        <p style={{ color: '#666', fontSize: '12px' }}>
                            Bid: <strong>{bid?.bid_code || bid?.name || 'New Bid'}</strong>
                        </p>
                    </div>
                    <button className="btn btn-default btn-sm" onClick={goBack}>
                        ✕ Cancel
                    </button>
                </div>

                <ProgressIndicator />

                <div 
                    onClick={triggerFileInput}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={handleDrop}
                    style={{ 
                        border: `2px dashed ${isDragging ? '#2196f3' : '#ccc'}`,
                        borderRadius: '8px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: isDragging ? '#e3f2fd' : '#fafafa'
                    }}
                >
                    <div style={{ fontSize: '48px', color: '#2196f3', marginBottom: '16px' }}>📁</div>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Drop the client's BOQ file here</h3>
                    <p style={{ color: '#666', marginBottom: '8px' }}>or click to browse</p>
                    <p style={{ fontSize: '11px', color: '#999' }}>Supported: .xlsx, .xls, .csv · Max 50 MB</p>
                    <button style={{ marginTop: '12px', padding: '6px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>
                        Browse files
                    </button>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept={acceptedExtensions.join(',')} 
                    onChange={handleFileSelect} 
                />
                
                {isUploading && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <p style={{ marginTop: '8px', color: '#666' }}>Uploading and parsing file...</p>
                    </div>
                )}
            </div>
        );
    }

    // ============ Step 1: Review Screen with Filter, Search, and Collapsible Column Mapping ============
    const packageCounts = getPackageCounts();
    const filteredItems = getFilteredLineItems();
    const selectableCount = getSelectableCount();
    const selectedCount = getSelectedCount();
    const totalLineItems = reviewRows.filter(r => r.type === 'line').length;
    const attentionCount = reviewRows.filter(r => r.warnings?.length > 0).length;

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            {showDeleteConfirm && <DeleteConfirmModal />}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Review & Tag BOQ</h1>
                    <p style={{ color: '#666', fontSize: '12px' }}>
                        Bid: <strong>{bid?.bid_code || bid?.name}</strong> · Click any cell to edit
                    </p>
                </div>
                <button className="btn btn-default btn-sm" onClick={goBack}>
                    ← Cancel
                </button>
            </div>

            <ProgressIndicator />

            {/* File Info */}
            {uploadedFile && (
                <div style={{ background: '#e8f5e9', borderLeft: '3px solid #4caf50', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px', marginRight: '12px' }}>📊</span>
                            <div>
                                <strong>{uploadedFile?.name}</strong>
                                <div style={{ fontSize: '11px', color: '#666' }}>
                                    {formatFileSize(uploadedFile?.size)} · {fileStats.bills} bills · {totalLineItems} line items
                                </div>
                            </div>
                        </div>
                        <span style={{ color: '#4caf50', fontWeight: 500 }}>✓ Uploaded</span>
                    </div>
                </div>
            )}

            {/* Index Sheet Section */}
            {parsedData?.index?.raw_content && (
                <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ 
                        padding: '10px 16px', 
                        background: '#f5f5f5', 
                        borderBottom: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }} onClick={() => setShowIndexDetails(!showIndexDetails)}>
                        <div>
                            <strong>📋 BOQ Index</strong>
                            <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                                ({parsedData.index.sections?.length || 0} sections)
                            </span>
                        </div>
                        <span>{showIndexDetails ? '▲' : '▼'}</span>
                    </div>
                    {showIndexDetails && (
                        <div style={{ padding: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                            <pre style={{ 
                                background: '#f9f9f9', 
                                padding: '10px', 
                                borderRadius: '4px', 
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                margin: 0
                            }}>
                                {parsedData.index.raw_content}
                            </pre>
                        </div>
                    )}
                </div>
            )}

            {/* AI Analysis */}
            <div style={{ background: '#e3f2fd', borderLeft: '3px solid #2196f3', padding: '12px 16px', borderRadius: '4px', marginBottom: '16px' }}>
                <div>
                    <strong>🤖 Analysis Complete</strong>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                        {totalLineItems} line items, {fileStats.sectionCount} sections. 
                        <strong> {attentionCount} rows flagged</strong>
                        <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>✎ Click any cell to edit</span>
                    </div>
                </div>
            </div>

            {/* Collapsible Column Mapping Section */}
            {/* <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '16px', overflow: 'hidden' }}>
                <div 
                    style={{ 
                        padding: '10px 16px', 
                        background: '#f5f5f5', 
                        borderBottom: showColumnMapping ? '1px solid #e0e0e0' : 'none',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={() => setShowColumnMapping(!showColumnMapping)}
                >
                    <div>
                        <strong>🔧 Column Mapping</strong>
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>
                            Map Excel columns to BOQ fields
                        </span>
                    </div>
                    <span>{showColumnMapping ? '▲' : '▼'}</span>
                </div>
{showColumnMapping && (
    <div style={{ 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'nowrap',
        gap: '12px', 
        alignItems: 'flex-end',
        overflowX: 'auto'
    }}>
        {columnMappings.map(map => (
            <div key={map.field} style={{ flex: 1, minWidth: '100px' }}>
                <label style={{ fontSize: '11px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                    {map.label}
                </label>
                <select 
                    style={{ 
                        width: '100%', 
                        padding: '6px 8px', 
                        fontSize: '11px' 
                    }}
                    value={map.selectedColumn}
                    onChange={(e) => updateColumnMapping(map.field, e.target.value)}
                >
                    {availableColumns.map(col => (
                        <option key={col} value={col}>{col}</option>
                    ))}
                </select>
            </div>
        ))}
    </div>
)}
            </div> */}

            {/* Search Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '8px', color: '#999' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search by item ref, description, or unit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px 8px 32px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '12px'
                        }}
                    />
                </div>
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        style={{ padding: '8px 16px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Package Filter Bar */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px', 
                marginBottom: '16px', 
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '8px',
                alignItems: 'center'
            }}>
                <span style={{ fontSize: '12px', fontWeight: 500, marginRight: '8px' }}>Filter by Package:</span>
                <button 
                    onClick={() => setSelectedPackageFilter('all')}
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        border: '1px solid #ccc',
                        background: selectedPackageFilter === 'all' ? '#2196f3' : 'white',
                        color: selectedPackageFilter === 'all' ? 'white' : '#333',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    All ({totalLineItems})
                </button>
                <button 
                    onClick={() => setSelectedPackageFilter('Unassigned')}
                    style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        border: '1px solid #ff9800',
                        background: selectedPackageFilter === 'Unassigned' ? '#ff9800' : 'white',
                        color: selectedPackageFilter === 'Unassigned' ? 'white' : '#ff9800',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    Unassigned ({packageCounts['Unassigned'] || 0})
                </button>
                {Object.entries(packageCounts).map(([pkg, count]) => {
                    if (pkg === 'Unassigned') return null;
                    return (
                        <button 
                            key={pkg}
                            onClick={() => setSelectedPackageFilter(pkg)}
                            style={{
                                padding: '4px 12px',
                                borderRadius: '16px',
                                border: '1px solid #ccc',
                                background: selectedPackageFilter === pkg ? '#2196f3' : 'white',
                                color: selectedPackageFilter === pkg ? 'white' : '#333',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            {pkg} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Selection Toolbar */}
            {selectableCount > 0 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 16px', 
                    background: '#f5f5f5', 
                    borderRadius: '4px', 
                    marginBottom: '16px',
                    border: '1px solid #e0e0e0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={selectAll && selectedCount === selectableCount}
                                onChange={toggleSelectAll}
                            />
                            <span style={{ fontSize: '12px' }}>Select All ({selectableCount})</span>
                        </label>
                        {selectedCount > 0 && (
                            <span style={{ fontSize: '12px', color: '#666' }}>
                                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                            </span>
                        )}
                    </div>
                    {selectedCount > 0 && (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{ background: '#f44336', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            🗑 Delete Selected ({selectedCount})
                        </button>
                    )}
                </div>
            )}

            {/* Line Items Table */}
            <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e0e0e0', background: '#fafafa' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                        📋 Line Items {selectedPackageFilter !== 'all' && `(${selectedPackageFilter})`}
                        {searchTerm && <span style={{ fontSize: '11px', color: '#666', marginLeft: '8px' }}>· Search: "{searchTerm}"</span>}
                    </h4>
                    <button 
                        onClick={saveAndContinue}
                        style={{ padding: '6px 16px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Continue → {getUntaggedCount() > 0 && `(${totalLineItems - getUntaggedCount()}/${totalLineItems})`}
                    </button>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                        <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>
                            <tr>
                                <th style={{ width: '30px', padding: '10px 4px', textAlign: 'center' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectAll && selectedCount === selectableCount}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', width: '80px' }}>Item</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left' }}>Description</th>
                                <th style={{ padding: '10px 8px', textAlign: 'center', width: '70px' }}>Unit</th>
                                <th style={{ padding: '10px 8px', textAlign: 'right', width: '90px' }}>Qty</th>
                                <th style={{ padding: '10px 8px', textAlign: 'left', width: '180px' }}>Package</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(row => {
                                const isSelected = selectedRows.has(row.id);
                                const currentPackage = getPackageForLineRealTime(row.id);
                                const isUntagged = currentPackage === 'Unassigned';
                                
                                return (
                                    <tr key={row.id} style={{ 
                                        borderBottom: '1px solid #f0f0f0',
                                        background: isSelected ? '#e3f2fd' : (isUntagged ? '#fff8e1' : 'transparent')
                                    }}>
                                        <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleRowSelection(row.id)}
                                            />
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {renderEditableCell(row, 'item', row.item, 'text')}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            {renderEditableCell(row, 'description', row.description, 'text')}
                                            {row.warnings?.length > 0 && (
                                                <span style={{ color: '#ff9800', marginLeft: '6px' }} title={row.warnings.join(', ')}>⚠</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                            {renderEditableCell(row, 'unit', row.unit, 'text')}
                                        </td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                            {renderEditableCell(row, 'qty', row.qty, 'number')}
                                        </td>
                                        <td style={{ padding: '8px' }}>
                                            <select 
                                                style={{ 
                                                    width: '100%', 
                                                    padding: '6px 8px', 
                                                    fontSize: '11px',
                                                    borderColor: isUntagged ? '#ff9800' : '#ccc',
                                                    borderRadius: '4px'
                                                }}
                                                value={currentPackage}
                                                onChange={(e) => updatePackage(row.id, e.target.value)}
                                            >
                                                {availablePackages.map(pkg => (
                                                    <option key={pkg} value={pkg}>{pkg}</option>
                                                ))}
                                            </select>
                                            {row.suggested_package && row.suggested_package !== 'Unassigned' && currentPackage === 'Unassigned' && (
                                                <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
                                                    🤖 Suggested: {row.suggested_package}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Footer */}
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        📊 Total: <strong>{totalLineItems}</strong> line items
                        {searchTerm && <span> · Filtered: <strong>{filteredItems.length}</strong></span>}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#4caf50', marginRight: '4px' }}></span>
                            Tagged: {totalLineItems - getUntaggedCount()}
                        </span>
                        <span style={{ fontSize: '12px' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ff9800', marginRight: '4px' }}></span>
                            Untagged: {getUntaggedCount()}
                        </span>
                        <span style={{ fontSize: '12px' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#2196f3', marginRight: '4px' }}></span>
                            Packages: {fileStats.packages.length}
                        </span>
                        <span style={{ fontSize: '12px' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ff9800', marginRight: '4px' }}></span>
                            Confidence: {fileStats.confidence}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>Tagging Progress</span>
                    <span>{Math.round((totalLineItems - getUntaggedCount()) / totalLineItems * 100)}%</span>
                </div>
                <div style={{ background: '#e0e0e0', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ 
                        background: '#2196f3', 
                        width: `${(totalLineItems - getUntaggedCount()) / totalLineItems * 100}%`, 
                        height: '100%',
                        transition: 'width 0.3s'
                    }}></div>
                </div>
            </div>
        </div>
    );
};

export default BOQReviewAndTagging;