// App.jsx - Main React component with proper prop passing
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import BidList from './screens/BidList';
import BidWizard from './screens/BidWizard';
import BOQReviewAndTagging from './screens/BOQReviewAndTagging';
import ReviewImport from './screens/ReviewImport';
import PackageTagging from './screens/PackageTagging';
import Pricing from './screens/Pricing';
import BidStrategy from './screens/BidStrategy';
import ReviewSubmit from './screens/ReviewSubmit';
import Export from './screens/Export';

const EstimationApp = forwardRef(({ frappe }, ref) => {
    const [currentScreen, setCurrentScreen] = useState('BidList');
    const [selectedBid, setSelectedBid] = useState(null);
    const [bidData, setBidData] = useState(null);
    const [toast, setToast] = useState({ show: false, title: '', message: '' });
    let toastTimeout = null;

    console.log("App state:", { currentScreen, selectedBid }); // Debug log

    // Navigation methods
const navigateTo = (screen, bid = null, showStepper = false, step = 0) => {
    console.log("Navigating to:", screen, "with bid:", bid);
    
    if (bid) {
        setSelectedBid(bid);
        setBidData(null);
    }
    
    setCurrentScreen(screen);
};


const selectBid = (bid) => {
    console.log("Selecting bid:", bid);
    setSelectedBid(bid);
    setBidData(null);
    navigateTo('Pricing', bid);
};

const bidCreated = (bid) => {
    console.log("Bid created:", bid);
    setSelectedBid(bid);
    showToast('Success', `Bid ${bid.bid_code || bid.code} created successfully`);
    // Don't navigate here - the navigation happens in BidWizard after creation
};

    const updateBid = (data) => {
        setBidData(prev => ({ ...prev, ...data }));
    };

    // Toast notifications
    const showToast = (title, message) => {
        setToast({ show: true, title, message });
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            setToast({ show: false, title: '', message: '' });
        }, 3000);
    };

    // Exposed methods for Frappe page actions
    useImperativeHandle(ref, () => ({
        createNewBid: () => {
            setSelectedBid(null);
            setBidData(null);
            navigateTo('BidWizard');
        },
        importBOQ: () => {
            if (!selectedBid) {
                showToast('Warning', 'Please select or create a bid first');
                return;
            }
            navigateTo('BOQReviewAndTagging');
        },
        exportData: () => {
            if (!selectedBid && currentScreen !== 'Export') {
                showToast('Warning', 'No bid selected for export');
                return;
            }
            navigateTo('Export');
        }
    }));

    // Helper to get current component with proper props
    const getCurrentComponent = () => {
        // Common props that all screens might need
        const commonProps = {
            frappe: frappe,
            onNavigate: navigateTo,
            onBidSelected: selectBid,
            onBidCreated: bidCreated,
            onUpdateBid: updateBid,
            onShowToast: showToast
        };

        // Screen-specific props
        switch (currentScreen) {
            case 'BidList':
                return <BidList {...commonProps} />;
                
            case 'BidWizard':
                return <BidWizard {...commonProps} />;
                
            case 'BOQReviewAndTagging':
                return <BOQReviewAndTagging 
                    {...commonProps} 
                    bid={selectedBid}  // This should now have the created bid
                    bidData={bidData}
                />;
                
            case 'ReviewImport':
                return <ReviewImport 
                    {...commonProps} 
                    bid={selectedBid}
                    bidData={bidData}
                />;
                
            case 'PackageTagging':
                return <PackageTagging 
                    {...commonProps} 
                    bid={selectedBid}
                    bidData={bidData}
                />;
                
            case 'Pricing':
                return <Pricing 
                    {...commonProps} 
                    bid={selectedBid}
                    bidData={bidData}
                />;
                
            case 'BidStrategy':
                return <BidStrategy 
                    {...commonProps} 
                    bid={selectedBid}
                    bidData={bidData}
                />;
                
            case 'ReviewSubmit':
                return <ReviewSubmit 
                    {...commonProps} 
                    bid={selectedBid}
                    bidData={bidData}
                />;
                
            case 'Export':
                return <Export 
                    {...commonProps} 
                    bid={selectedBid}
                    bidData={bidData}
                />;
                
            default:
                return <BidList {...commonProps} />;
        }
    };

    return (
        <div className="estimation-module" style={{ padding: '20px', minHeight: 'calc(100vh - 120px)' }}>
            {getCurrentComponent()}
            
            {/* Toast Notification */}
            {toast.show && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                    <div className="toast show" role="alert" style={{ minWidth: '300px', background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <div className="toast-header" style={{ padding: '8px 12px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <strong className="mr-auto">{toast.title}</strong>
                            <button type="button" className="close" onClick={() => setToast({ show: false, title: '', message: '' })} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
                                &times;
                            </button>
                        </div>
                        <div className="toast-body" style={{ padding: '12px' }}>
                            {toast.message}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

EstimationApp.displayName = 'EstimationApp';

export default EstimationApp;