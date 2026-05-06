// estimation.bundle.jsx - React entry point for Frappe's build system
import * as React from "react";
import EstimationApp from "./App.jsx";
import { createRoot } from "react-dom/client";

class Estimation {
    constructor({ page, wrapper }) {
        this.$wrapper = $(wrapper);
        this.page = page;
        this.rootComponent = null; // Initialize
        this.init();
    }

    init() {
        this.setup_page_actions();
        // Wait for DOM to be ready
        setTimeout(() => {
            this.setup_app();
        }, 100);
    }

    setup_page_actions() {
        // Setup page header actions
        this.page.set_title("Estimation");
        
        // Save reference to this for use inside callback
        const self = this;
        
        this.primary_btn = this.page.set_primary_action(
            __("New Bid"), 
            () => {
                console.log("Header New Bid button clicked");
                console.log("rootComponent:", self.rootComponent);
                if (self.rootComponent) {
                    console.log("Calling createNewBid");
                    self.rootComponent.createNewBid();
                } else {
                    console.error("rootComponent is null! Trying again...");
                    // Try again after a short delay
                    setTimeout(() => {
                        if (self.rootComponent) {
                            self.rootComponent.createNewBid();
                        } else {
                            console.error("rootComponent still null after retry");
                            frappe.msgprint("Please wait for the app to load completely");
                        }
                    }, 500);
                }
            }, 
            "add"
        );
        
        // Add secondary actions
        this.page.add_menu_item(__("Import BOQ"), () => {
            if (this.rootComponent) {
                this.rootComponent.importBOQ();
            }
        });
        
        this.page.add_menu_item(__("Export Data"), () => {
            if (this.rootComponent) {
                this.rootComponent.exportData();
            }
        });
        
        this.page.add_menu_item(__("Settings"), () => {
            frappe.msgprint("Settings panel coming soon");
        });
    }

    setup_app() {
        // Find container
        let container = this.$wrapper.find('.layout-main-section')[0];
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'estimation-container';
            this.$wrapper.append(container);
        }
        
        console.log('Mounting React app to container:', container);
        
        // Clear any existing content
        container.innerHTML = '';
        container.style.padding = '20px';
        container.style.minHeight = 'calc(100vh - 120px)';
        
        // Create React root and mount
        const root = createRoot(container);
        
        // Save reference to this
        const self = this;
        
        // Render with ref callback
        root.render(
            <EstimationApp 
                ref={(ref) => {
                    console.log("Ref callback called, ref:", ref);
                    self.rootComponent = ref;
                }}
                frappe={frappe}
            />
        );
        
        this.root = root;
        
        // Verify ref was set
        setTimeout(() => {
            console.log("After mount, rootComponent:", this.rootComponent);
        }, 200);
    }
}

// Register with Frappe
frappe.provide("frappe.ui");
frappe.ui.Estimation = Estimation;

export default Estimation;