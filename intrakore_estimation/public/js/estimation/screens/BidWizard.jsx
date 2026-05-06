// BidWizard.jsx - New bid creation wizard with API integration
import React, { useState, useEffect } from 'react';

const BidWizard = ({ frappe, onNavigate, onBidCreated, onShowToast }) => {
    const [step, setStep] = useState('path');
    const [selectedPath, setSelectedPath] = useState(null);
    const [bidType, setBidType] = useState('crm');
    const [selectedOpportunity, setSelectedOpportunity] = useState('');
    const [opportunities, setOpportunities] = useState([]);
    const [loadingOpportunities, setLoadingOpportunities] = useState(false);
    const [opportunitySearch, setOpportunitySearch] = useState('');
    const [clientName, setClientName] = useState('');
    const [projectName, setProjectName] = useState('');
    const [bidCode, setBidCode] = useState('');
    const [deadline, setDeadline] = useState('');
    const [leadEstimator, setLeadEstimator] = useState('Administrator');
    const [notes, setNotes] = useState('');
        // Add this state near the top with other useState declarations
    const [estimators, setEstimators] = useState([]);
    const [loadingEstimators, setLoadingEstimators] = useState(false);
    const [estimatorSearch, setEstimatorSearch] = useState('');

    // Add this function to fetch estimators
    const fetchEstimators = async (search = '') => {
        setLoadingEstimators(true);
        try {
            const response = await frappe.call({
                method: 'intrakore_estimation.intrakore_estimation.api.get_lead_estimators',
                args: { txt: search },
                freeze: false
            });
            
            if (response.message && response.message.users) {
                setEstimators(response.message.users);
            } else {
                // Fallback - get current user
                setEstimators([{
                    name: frappe.session.user,
                    full_name: frappe.session.user_fullname || frappe.session.user,
                    enabled: 1
                }]);
            }
        } catch (error) {
            console.error('API error:', error);
            // Fallback to current user
            setEstimators([{
                name: frappe.session.user,
                full_name: frappe.session.user_fullname || frappe.session.user,
                enabled: 1
            }]);
        } finally {
            setLoadingEstimators(false);
        }
    };

    // Add useEffect to load estimators when component mounts
    useEffect(() => {
        if (step === 'details') {
            fetchEstimators(estimatorSearch);
        }
    }, [step, estimatorSearch]);
    const generateBidCode = () => {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 900) + 100;
        return `INT-${year}${month}-${random}`;
    };

    // Fetch opportunities from API
    const fetchOpportunities = async (search = '') => {
        setLoadingOpportunities(true);
        try {
            const response = await frappe.call({
                method: 'intrakore_estimation.intrakore_estimation.api.get_opportunities',
                args: { search: search },
                freeze: false
            });
            
            if (response.message && response.message.opportunities) {
                setOpportunities(response.message.opportunities);
            } else {
                // Fallback dummy data
                setOpportunities([
                    { value: "OPP-26-014", label: "Marina Crest Tower · Dubai Properties Investments · AED 28,400,000", data: {} },
                    { value: "OPP-26-018", label: "Bay Square Block C · Wasl Group · AED 18,700,000", data: {} },
                    { value: "OPP-26-022", label: "Al Quoz Warehouse · Mubadala Industrial · AED 44,100,000", data: {} }
                ]);
            }
        } catch (error) {
            console.error('API error:', error);
            // Fallback dummy data
            setOpportunities([
                { value: "OPP-26-014", label: "Marina Crest Tower · Dubai Properties Investments · AED 28,400,000", data: {} },
                { value: "OPP-26-018", label: "Bay Square Block C · Wasl Group · AED 18,700,000", data: {} },
                { value: "OPP-26-022", label: "Al Quoz Warehouse · Mubadala Industrial · AED 44,100,000", data: {} }
            ]);
        } finally {
            setLoadingOpportunities(false);
        }
    };

    // Load opportunities when bid type is CRM-linked
    useEffect(() => {
        if (bidType === 'crm' && step === 'details') {
            fetchOpportunities(opportunitySearch);
        }
    }, [bidType, step, opportunitySearch]);

    const isFormValid = () => {
        if (!projectName) return false;
        if (bidType === 'crm') return !!selectedOpportunity;
        return !!clientName;
    };

    const selectPath = (path) => {
        setSelectedPath(path);
        setBidCode(generateBidCode());
        setStep('details');
    };

    const handleOpportunitySelect = (e) => {
        const value = e.target.value;
        setSelectedOpportunity(value);
        
        // Auto-fill project name from selected opportunity
        const selected = opportunities.find(opp => opp.value === value);
        if (selected && selected.data) {
            setProjectName(selected.data.opportunity_name || selected.label.split('·')[0].trim());
        }
    };

const createBid = async () => {
    // Validate
    if (!projectName) {
        onShowToast('Error', 'Project name is required');
        return;
    }
    
    if (bidType === 'crm' && !selectedOpportunity) {
        onShowToast('Error', 'Please select an opportunity');
        return;
    }
    
    if (bidType === 'standalone' && !clientName) {
        onShowToast('Error', 'Client name is required');
        return;
    }
    
    // Prepare bid data
    const newBid = {
        bid_code: bidCode,
        project_name: projectName,
        bid_source: bidType === 'crm' ? 'CRM-linked' : 'Standalone',
        lead_estimator: leadEstimator,
        status: 'Draft',
        internal_notes: notes
    };
    
    // Add client name (for both CRM and standalone)
    if (bidType === 'crm' && selectedOpportunity) {
        newBid.opportunity = selectedOpportunity;
        // Client name will be fetched from opportunity in API
    } else if (bidType === 'standalone' && clientName) {
        newBid.client_name = clientName;  // This will be used to create/find customer
    }
    
    // Add submission date if provided
    if (deadline) {
        newBid.submission_date = deadline;
    }
    
    console.log('Creating bid with data:', newBid);
    
    try {
        const response = await frappe.call({
            method: 'intrakore_estimation.intrakore_estimation.api.create_bid',
            args: { bid_data: newBid },
            freeze: true,
            freeze_message: 'Creating bid...'
        });
        
        if (response.message && !response.message.error) {
            const createdBid = response.message;
            onShowToast('Success', `Bid ${bidCode} created successfully`);
            onBidCreated(createdBid);
            
            if (selectedPath === 'upload') {
                onNavigate('BOQReviewAndTagging');
            } else if (selectedPath === 'template') {
                onNavigate('PackageTagging');
            } else if (selectedPath === 'fresh') {
                onNavigate('Pricing');
            }
        } else {
            throw new Error(response.message?.error || 'Failed to create bid');
        }
    } catch (error) {
        console.error('API error:', error);
        onShowToast('Error', error.message || 'Failed to create bid');
    }
};

    const createOpportunity = () => {
        frappe.msgprint({
            title: __('Create Opportunity'),
            message: __('Opportunity creation form would open here.'),
            indicator: 'blue'
        });
    };

    if (step === 'path') {
        return (
            <div className="bid-wizard-screen" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <div className="alert alert-info mb-4" style={{ backgroundColor: '#e3f2fd', borderLeft: '3px solid #2196f3', padding: '12px 16px', borderRadius: '4px' }}>
                    <div className="flex items-start">
                        <span className="mr-2" style={{ fontSize: '18px' }}>✦</span>
                        <div>
                            <strong>How is this bid being built?</strong>
                            <span className="ml-2 text-muted" style={{ color: '#666' }}>Pick one — you'll go straight to the right workflow</span>
                        </div>
                    </div>
                </div>

                <div className="path-cards" style={{ display: 'flex', gap: '24px', marginTop: '20px' }}>
                    {/* Upload Client BOQ Card */}
                    <div 
                        className="path-card" 
                        onClick={() => selectPath('upload')}
                        style={{ 
                            flex: 1,
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '28px 24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2196f3';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div className="path-icon" style={{ 
                            width: '56px', 
                            height: '56px', 
                            borderRadius: '12px', 
                            background: '#f5f5f5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            marginBottom: '16px',
                            color: '#2196f3'
                        }}>
                            <i className="fa fa-upload"></i>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Upload Client BOQ</h3>
                        <p style={{ fontSize: '12.5px', color: '#666', lineHeight: '1.5', marginBottom: '16px' }}>
                            The client has provided a priced or unpriced BOQ in Excel. Intrakore parses the file, preserves your bill structure, and prepares it for tagging and pricing.
                        </p>
                        <div className="path-meta" style={{ fontSize: '11px', color: '#2196f3', fontWeight: '600' }}>
                            <i className="fa fa-clock-o"></i> 5 steps · ~ tendered work
                        </div>
                    </div>

                    {/* Use existing template Card */}
                    <div 
                        className="path-card" 
                        onClick={() => selectPath('template')}
                        style={{ 
                            flex: 1,
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '28px 24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2196f3';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div className="path-icon" style={{ 
                            width: '56px', 
                            height: '56px', 
                            borderRadius: '12px', 
                            background: '#f5f5f5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            marginBottom: '16px',
                            color: '#2196f3'
                        }}>
                            <i className="fa fa-files-o"></i>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Use existing template</h3>
                        <p style={{ fontSize: '12.5px', color: '#666', lineHeight: '1.5', marginBottom: '16px' }}>
                            Start from a saved BOQ template — typical fit-out, villa, or warehouse structures your team uses. Lines are pre-tagged and ready for pricing.
                        </p>
                        <div className="path-meta" style={{ fontSize: '11px', color: '#2196f3', fontWeight: '600' }}>
                            <i className="fa fa-clock-o"></i> 4 steps · ~ re-bids &amp; standard scopes
                        </div>
                    </div>

                    {/* Build BOQ from scratch Card */}
                    <div 
                        className="path-card" 
                        onClick={() => selectPath('fresh')}
                        style={{ 
                            flex: 1,
                            background: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            padding: '28px 24px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#2196f3';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div className="path-icon" style={{ 
                            width: '56px', 
                            height: '56px', 
                            borderRadius: '12px', 
                            background: '#f5f5f5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '28px',
                            marginBottom: '16px',
                            color: '#2196f3'
                        }}>
                            <i className="fa fa-plus"></i>
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Build BOQ from scratch</h3>
                        <p style={{ fontSize: '12.5px', color: '#666', lineHeight: '1.5', marginBottom: '16px' }}>
                            Author the BOQ inside Intrakore. Add lines, units, quantities, and tag each line to a package as you go. Tagging happens inline — no separate step.
                        </p>
                        <div className="path-meta" style={{ fontSize: '11px', color: '#2196f3', fontWeight: '600' }}>
                            <i className="fa fa-clock-o"></i> 3 steps · ~ private clients &amp; design-build
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bid-wizard-screen" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div className="bid-details-form" style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '24px' }}>
                <div className="form-header" style={{ display: 'flex', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #e0e0e0', marginBottom: '20px' }}>
                    <button className="btn btn-default btn-sm mr-2" onClick={() => setStep('path')} style={{ marginRight: '12px' }}>
                        <i className="fa fa-chevron-left"></i> Back
                    </button>
                    <h3 className="mb-0" style={{ margin: 0 }}>New Bid Details</h3>
                </div>

                <div className="form-section">
                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <div className="col-md-12" style={{ width: '100%', padding: '0 8px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Bid Type</label>
                                <div className="radio-group" style={{ display: 'flex', gap: '16px', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '8px' }}>
                                    <label className={`radio-label ${bidType === 'crm' ? 'active' : ''}`} style={{ flex: 1, padding: '12px', borderRadius: '4px', cursor: 'pointer', background: bidType === 'crm' ? '#f5f5f5' : 'transparent', border: bidType === 'crm' ? '1px solid #2196f3' : 'none' }}>
                                        <input type="radio" value="crm" checked={bidType === 'crm'} onChange={(e) => setBidType(e.target.value)} style={{ marginRight: '8px' }} />
                                        <span style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}><i className="fa fa-link"></i> CRM-linked</span>
                                        <small className="text-muted" style={{ fontSize: '11px', color: '#666' }}>Tied to an Opportunity in CRM</small>
                                    </label>
                                    <label className={`radio-label ${bidType === 'standalone' ? 'active' : ''}`} style={{ flex: 1, padding: '12px', borderRadius: '4px', cursor: 'pointer', background: bidType === 'standalone' ? '#f5f5f5' : 'transparent', border: bidType === 'standalone' ? '1px solid #2196f3' : 'none' }}>
                                        <input type="radio" value="standalone" checked={bidType === 'standalone'} onChange={(e) => setBidType(e.target.value)} style={{ marginRight: '8px' }} />
                                        <span style={{ display: 'block', fontWeight: '500', marginBottom: '4px' }}><i className="fa fa-user"></i> Standalone</span>
                                        <small className="text-muted" style={{ fontSize: '11px', color: '#666' }}>Private/walk-in client, no CRM record</small>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {bidType === 'crm' && (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Opportunity <span className="text-danger" style={{ color: '#f44336' }}>*</span></label>
                                    <select 
                                        className="form-control" 
                                        value={selectedOpportunity} 
                                        onChange={handleOpportunitySelect}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
                                    >
                                        <option value="">— Select an opportunity —</option>
                                        {opportunities.map(opp => (
                                            <option key={opp.value} value={opp.value}>{opp.label}</option>
                                        ))}
                                    </select>
                                    {loadingOpportunities && (
                                        <div className="small text-muted mt-1" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                            <i className="fa fa-spinner fa-spin"></i> Loading opportunities...
                                        </div>
                                    )}
                                    <div className="small text-muted mt-1" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                        Don't see the opportunity? 
                                        <a href="#" onClick={createOpportunity} className="text-primary" style={{ color: '#2196f3', textDecoration: 'none' }}> + Create new opportunity inline</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {bidType === 'standalone' && (
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group" style={{ marginBottom: '16px' }}>
                                    <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Client Name <span className="text-danger" style={{ color: '#f44336' }}>*</span></label>
                                    <input type="text" className="form-control" placeholder="e.g. Mr. Mohammed Al Rostamani" value={clientName} onChange={(e) => setClientName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <div className="col-md-6" style={{ width: '50%', padding: '0 8px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Project Name <span className="text-danger" style={{ color: '#f44336' }}>*</span></label>
                                <input type="text" className="form-control" placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                        </div>
                        <div className="col-md-6" style={{ width: '50%', padding: '0 8px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Bid Code <span className="text-danger" style={{ color: '#f44336' }}>*</span></label>
                                <input type="text" className="form-control" value={bidCode} onChange={(e) => setBidCode(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }} />
                                <div className="small text-muted mt-1" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}><i className="fa fa-info-circle"></i> Auto-generated. Editable.</div>
                            </div>
                        </div>
                    </div>

                    <div className="row" style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <div className="col-md-6" style={{ width: '50%', padding: '0 8px' }}>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Submission Deadline</label>
                                <input type="date" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                        </div>
<div className="col-md-6" style={{ width: '50%', padding: '0 8px' }}>
    <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Lead Estimator</label>
        <select 
            className="form-control" 
            value={leadEstimator} 
            onChange={(e) => setLeadEstimator(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px' }}
        >
            <option value="">— Select Lead Estimator —</option>
            {estimators.map(estimator => (
                <option key={estimator.name} value={estimator.name}>
                    {estimator.full_name || estimator.name}
                </option>
            ))}
        </select>
        {loadingEstimators && (
            <div className="small text-muted mt-1" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                <i className="fa fa-spinner fa-spin"></i> Loading estimators...
            </div>
        )}
        <div className="small text-muted mt-1" style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
            <i className="fa fa-info-circle"></i> Showing users with Estimator, Estimation Manager, or Commercial Manager roles
        </div>
    </div>
</div>
                    </div>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>Notes (optional)</label>
                                <textarea className="form-control" rows="3" placeholder="Site visit notes, client preferences, scope clarifications…" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }}></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e0e0e0', marginTop: '20px' }}>
                    <button className="btn btn-default" onClick={() => setStep('path')} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                    <button className="btn btn-primary" onClick={createBid} disabled={!isFormValid()} style={{ padding: '8px 16px', borderRadius: '4px', background: '#2196f3', color: '#fff', border: 'none', cursor: 'pointer' }}>
                        Create bid &amp; continue <i className="fa fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BidWizard;