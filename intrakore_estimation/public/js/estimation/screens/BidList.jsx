// BidList.jsx - Bid listing screen with Frappe doctype integration
import React, { useState, useEffect } from 'react';

const BidList = ({ frappe, onNavigate, onBidSelected }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalBids, setTotalBids] = useState(0);
    const pageSize = 10;

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'draft', label: 'Draft' },
        { key: 'pricing', label: 'In Pricing' },
        { key: 'review', label: 'In Review' },
        { key: 'submitted', label: 'Submitted' }
    ];

    // Fetch bids from Frappe
    const fetchBids = async () => {
        setLoading(true);
        try {
            const response = await frappe.call({
                method: 'intrakore_estimation.intrakore_estimation.api.get_bid_list',
                args: {
                    filters: activeFilter !== 'all' ? { status: activeFilter } : {},
                    search: searchQuery,
                    page: currentPage,
                    page_size: pageSize
                },
                freeze: false
            });

            if (response.message) {
                setBids(response.message.bids || []);
                setTotalBids(response.message.total || 0);
            }
        } catch (error) {
            console.error('API error:', error);
            // Fallback to dummy data
            setBids([
                { 
                    name: 'BID-2026-001',
                    bid_code: 'INT-26-042', 
                    project_name: 'Al Hadeel Residences', 
                    client_name: 'Crescent Heights Developments',
                    bid_source: 'CRM-linked',
                    total_priced_value: 28400000, 
                    status: 'Pricing', 
                    submission_date: '2026-05-12', 
                    lead_estimator_name: 'Ravi K.',
                    progress: 38,
                    days_left: 9
                },
                { 
                    name: 'BID-2026-002',
                    bid_code: 'INT-26-038', 
                    project_name: 'Meydan Villa Cluster', 
                    client_name: 'M. Al Rostamani',
                    bid_source: 'Standalone',
                    total_priced_value: 62800000, 
                    status: 'Pricing', 
                    submission_date: '2026-05-19', 
                    lead_estimator_name: 'Ravi K.',
                    progress: 65,
                    days_left: 16
                },
                { 
                    name: 'BID-2026-003',
                    bid_code: 'INT-26-035', 
                    project_name: 'JVC Phase 3 - Warehouse', 
                    client_name: 'Gulf Freight Holdings',
                    bid_source: 'CRM-linked',
                    total_priced_value: 44100000, 
                    status: 'Pricing', 
                    submission_date: '2026-05-28', 
                    lead_estimator_name: 'Priya S.',
                    progress: 42,
                    days_left: 25
                },
                { 
                    name: 'BID-2026-004',
                    bid_code: 'INT-26-029', 
                    project_name: 'Sharjah Waterfront Clubhouse', 
                    client_name: 'Emaar Sharjah LLC',
                    bid_source: 'CRM-linked',
                    total_priced_value: 18700000, 
                    status: 'Director Review', 
                    submission_date: '2026-04-30', 
                    lead_estimator_name: 'Ravi K.',
                    progress: 92,
                    days_left: 4
                },
                { 
                    name: 'BID-2026-005',
                    bid_code: 'INT-26-024', 
                    project_name: 'DIFC Office Refurb - Floors 18-22', 
                    client_name: 'Brookfield Properties DIFC',
                    bid_source: 'Standalone',
                    total_priced_value: 11200000, 
                    status: 'Draft', 
                    submission_date: null, 
                    lead_estimator_name: 'Hamza A.',
                    progress: 15,
                    days_left: null
                },
                { 
                    name: 'BID-2026-006',
                    bid_code: 'INT-26-019', 
                    project_name: 'RAK Hotel - MEP Scope', 
                    client_name: 'Marjan Developments PJSC',
                    bid_source: 'CRM-linked',
                    total_priced_value: 34600000, 
                    status: 'Draft', 
                    submission_date: null, 
                    lead_estimator_name: 'Priya S.',
                    progress: 8,
                    days_left: null
                },
                { 
                    name: 'BID-2026-007',
                    bid_code: 'INT-26-011', 
                    project_name: 'Al Reem Island School Extension', 
                    client_name: 'Aldar Education',
                    bid_source: 'CRM-linked',
                    total_priced_value: 21300000, 
                    status: 'Submitted', 
                    submission_date: '2026-04-08', 
                    lead_estimator_name: 'Ravi K.',
                    progress: 100,
                    days_left: null
                }
            ]);
            setTotalBids(7);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBids();
    }, [activeFilter, searchQuery, currentPage]);

    // Helper functions
    const formatNumber = (value) => {
        if (!value && value !== 0) return '0';
        if (value >= 1000000) {
            return 'AED ' + (value / 1000000).toFixed(1) + 'M';
        }
        if (value >= 1000) {
            return 'AED ' + (value / 1000).toFixed(0) + 'K';
        }
        return 'AED ' + value.toLocaleString();
    };

    const formatTotalValue = () => {
        const total = bids.reduce((sum, bid) => sum + (bid.total_priced_value || 0), 0);
        return formatNumber(total);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getStageClass = (status) => {
        const stageMap = {
            'Draft': 'indicator darkgrey',
            'Pricing': 'indicator orange',
            'Director Review': 'indicator purple',
            'Submitted': 'indicator blue',
            'Approved': 'indicator green',
            'Rejected': 'indicator red'
        };
        return stageMap[status] || 'indicator darkgrey';
    };

    const getStageKey = (status) => {
        const keyMap = {
            'Draft': 'draft',
            'Pricing': 'pricing',
            'Director Review': 'review',
            'Submitted': 'submitted',
            'Approved': 'approved',
            'Rejected': 'rejected'
        };
        return keyMap[status] || 'draft';
    };

    const getProgressBarClass = (progress) => {
        if (progress >= 100) return 'progress-bar-success';
        if (progress >= 70) return 'progress-bar-info';
        if (progress >= 30) return 'progress-bar-warning';
        return 'progress-bar-danger';
    };

    const calculateDaysLeft = (submissionDate) => {
        if (!submissionDate) return null;
        const today = new Date();
        const due = new Date(submissionDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : (diffDays === 0 ? 0 : null);
    };

    // Filter logic
    const filteredBids = bids.filter(bid => {
        const stageKey = getStageKey(bid.status);
        if (activeFilter !== 'all' && stageKey !== activeFilter) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (bid.bid_code || '').toLowerCase().includes(query) ||
                   (bid.project_name || '').toLowerCase().includes(query) ||
                   (bid.client_name || '').toLowerCase().includes(query);
        }
        return true;
    });

    const getFilterCount = (filterKey) => {
        if (filterKey === 'all') return bids.length;
        return bids.filter(b => getStageKey(b.status) === filterKey).length;
    };

    const totalPages = Math.ceil(filteredBids.length / pageSize);
    const paginatedBids = filteredBids.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredBids.length);

    const attentionBids = bids.filter(b => {
        const daysLeft = calculateDaysLeft(b.submission_date);
        return daysLeft && daysLeft <= 7 && b.status !== 'Submitted';
    });
    const urgentBid = attentionBids[0];

    const stageStats = () => {
        const stages = [{ stage: 'Draft', key: 'draft' }, { stage: 'Pricing', key: 'pricing' }, { stage: 'Director Review', key: 'review' }, { stage: 'Submitted', key: 'submitted' }];
        return stages.map(stage => ({
            stage: stage.stage,
            count: bids.filter(b => getStageKey(b.status) === stage.key).length
        }));
    };

    const selectBid = (bid) => {
        onBidSelected(bid);
    };

    const createNewBid = () => {
        console.log("Create New Bid button clicked"); // Debug log
        // Create a temporary bid object
        const tempBid = {
            bid_code: 'NEW-' + Date.now(),
            project_name: 'New Bid',
            status: 'Draft',
            bid_source: 'Standalone'
        };
        onBidSelected(tempBid);
        onNavigate('BidWizard');
    };

    if (loading) {
        return (
            <div className="bid-list-screen">
                <div className="text-center py-8">
                    <i className="fa fa-spinner fa-spin fa-2x text-muted"></i>
                    <p className="mt-2 text-muted">Loading bids...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bid-list-screen">
            {/* Search and Filter Bar */}
            <div className="filter-section">
                <div className="row">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-addon"><i className="fa fa-search"></i></span>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search bids, projects, or clients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="btn-group pull-right">
                            {filters.map(filter => (
                                <button 
                                    key={filter.key}
                                    className={`btn btn-sm ${activeFilter === filter.key ? 'btn-primary' : 'btn-default'}`}
                                    onClick={() => setActiveFilter(filter.key)}
                                >
                                    {filter.label} 
                                    <span className="badge">{getFilterCount(filter.key)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insight Banner */}
            {urgentBid && (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    <div className="flex items-start">
                        <i className="fa fa-robot mr-2 mt-1"></i>
                        <div>
                            <strong>✦ Kore AI Insight:</strong>
                            <span className="ml-2">
                                {attentionBids.length} bid(s) need attention. 
                                <strong> {urgentBid.project_name}</strong> is due in <strong>{calculateDaysLeft(urgentBid.submission_date)}</strong> days 
                                with pricing {urgentBid.progress}% complete.
                            </span>
                        </div>
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Bids Table */}
            <div className="frappe-table">
                <table className="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th style={{ width: '110px' }}>Bid Code</th>
                            <th>Project / Client</th>
                            <th style={{ width: '100px' }}>Source</th>
                            <th className="text-right" style={{ width: '140px' }}>Bid Value</th>
                            <th style={{ width: '100px' }}>Due Date</th>
                            <th style={{ width: '120px' }}>Lead Estimator</th>
                            <th style={{ width: '130px' }}>Stage</th>
                            <th style={{ width: '80px' }}>Progress</th>
                            <th style={{ width: '40px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBids.map(bid => (
                            <tr key={bid.name} onClick={() => selectBid(bid)} className="clickable-row">
                                <td><code className="small">{bid.bid_code}</code></td>
                                <td>
                                    <div className="font-medium">{bid.project_name}</div>
                                    <div className="small text-muted">{bid.client_name}</div>
                                </td>
                                <td>
                                    <span className={`indicator ${bid.bid_source === 'CRM-linked' ? 'green' : 'darkgrey'}`}>
                                        {bid.bid_source}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <strong>{formatNumber(bid.total_priced_value || 0)}</strong>
                                </td>
                                <td>{formatDate(bid.submission_date)}</td>
                                <td>{bid.lead_estimator_name}</td>
                                <td>
                                    <span className={getStageClass(bid.status)}>
                                        {bid.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="progress" style={{ height: '20px' }}>
                                        <div className={`progress-bar ${getProgressBarClass(bid.progress)}`}
                                            role="progressbar" 
                                            style={{ width: `${bid.progress}%` }}
                                            aria-valuenow={bid.progress} 
                                            aria-valuemin="0" 
                                            aria-valuemax="100">
                                            {bid.progress}%
                                        </div>
                                    </div>
                                </td>
                                <td className="text-right">
                                    <i className="fa fa-chevron-right text-muted"></i>
                                </td>
                            </tr>
                        ))}
                        {filteredBids.length === 0 && (
                            <tr>
                                <td colSpan="9" className="text-center text-muted py-4">
                                    <i className="fa fa-inbox fa-2x mb-2"></i>
                                    <p>No bids found matching your criteria</p>
                                    <button className="btn btn-primary btn-sm" onClick={createNewBid}>
                                        + Create New Bid
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredBids.length > 0 && (
                <div className="row mt-4">
                    <div className="col-md-6">
                        <div className="small text-muted">
                            Showing {startIndex + 1} to {endIndex} of {filteredBids.length} bids
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="btn-group pull-right">
                            <button className="btn btn-default btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <i className="fa fa-chevron-left"></i> Prev
                            </button>
                            <button className="btn btn-default btn-sm disabled">
                                Page {currentPage} of {totalPages}
                            </button>
                            <button className="btn btn-default btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                Next <i className="fa fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Footer */}
            <div className="stats-footer mt-4 pt-3 border-top">
                <div className="row">
                    <div className="col-md-12">
                        <div className="flex justify-between items-center">
                            <div className="small text-muted">
                                <i className="fa fa-chart-line"></i> Total pipeline value: <strong>{formatTotalValue()}</strong>
                            </div>
                            <div className="flex gap-4">
                                {stageStats().map(stat => (
                                    <div key={stat.stage} className="small">
                                        <span className={getStageClass(stat.stage)}>{stat.stage}</span>
                                        <span className="ml-1 badge">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BidList;