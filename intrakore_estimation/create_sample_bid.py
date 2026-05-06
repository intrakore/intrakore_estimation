# intrakore_estimation/create_sample_bid.py

import frappe
from datetime import datetime, timedelta

def run():
    """Main function to create sample bid"""
    print("=" * 60)
    print("Creating Complete Sample Bid")
    print("=" * 60)
    
    # Create or get customer
    customer_name = "Dubai Properties Investments"
    if not frappe.db.exists("Customer", customer_name):
        customer = frappe.get_doc({
            "doctype": "Customer",
            "customer_name": customer_name,
            "customer_type": "Company",
            "customer_group": "Commercial",
            "territory": "UAE"
        })
        customer.insert()
        print(f"✅ Created customer: {customer_name}")
    else:
        customer = frappe.get_doc("Customer", customer_name)
        print(f"✅ Using existing customer: {customer_name}")
    
    # Create bid
    bid_code = f"MARINA-{datetime.now().strftime('%Y%m%d')}-001"
    
    bid = frappe.get_doc({
        "doctype": "Bid",
        "bid_code": bid_code,
        "project_name": "Marina Crest Tower - Core & Shell",
        "client": customer.name,
        "bid_source": "CRM-linked",
        "status": "Draft",
        "lead_estimator": "Administrator",
        "submission_date": (datetime.now() + timedelta(days=45)).date(),
        "commission_method": "Percentage",
        "commission_rate": 2.5,
        "internal_notes": """
        Marina Crest Tower is a 25-story residential tower in Dubai Marina.
        This bid covers the complete core & shell package including:
        - Substructure and superstructure concrete works
        - Structural steel framing
        - Façade and cladding
        - MEP rough-ins
        """,
        "client_notes": "Bid validity: 60 days from submission date."
    })
    
    # Add Master Packages
    packages = [
        {"package_name": "Preliminaries", "package_code": "PREL", "color": "#3b82f6", "status": "In Progress"},
        {"package_name": "Substructure", "package_code": "SUB", "color": "#10b981", "status": "In Progress"},
        {"package_name": "Superstructure", "package_code": "SUP", "color": "#f59e0b", "status": "Not Started"},
        {"package_name": "Façade & Cladding", "package_code": "FAC", "color": "#8b5cf6", "status": "Not Started"},
        {"package_name": "MEP Works", "package_code": "MEP", "color": "#ec4898", "status": "Not Started"},
        {"package_name": "Finishes", "package_code": "FIN", "color": "#14b8a6", "status": "Not Started"}
    ]
    
    for pkg in packages:
        bid.append("master_packages", pkg)
    
    # Add BOQ Lines with quantities
    boq_lines = [
        # Preliminaries Package
        {
            "item_ref": "1.1",
            "description": "Site establishment, hoarding, and security",
            "unit": "lot",
            "client_qty": 1,
            "master_package": "Preliminaries",
            "line_cost": 185000,
            "line_margin": 0,
            "line_margin_amount": 0,
            "line_contingency": 2.0,
            "line_contingency_amount": 3700,
            "line_sell": 188700,
            "is_priced": 1
        },
        {
            "item_ref": "1.2",
            "description": "Project management and supervision (12 months)",
            "unit": "mo",
            "client_qty": 12,
            "master_package": "Preliminaries",
            "line_cost": 720000,
            "line_margin": 0,
            "line_margin_amount": 0,
            "line_contingency": 2.0,
            "line_contingency_amount": 14400,
            "line_sell": 734400,
            "is_priced": 1
        },
        {
            "item_ref": "1.3",
            "description": "Temporary power, water, and telecom connections",
            "unit": "lot",
            "client_qty": 1,
            "master_package": "Preliminaries",
            "line_cost": 95000,
            "line_margin": 0,
            "line_margin_amount": 0,
            "line_contingency": 2.0,
            "line_contingency_amount": 1900,
            "line_sell": 96900,
            "is_priced": 1
        },
        
        # Substructure Package
        {
            "item_ref": "2.1.1",
            "description": "Excavation to reduced level, not exceeding 2m depth",
            "unit": "m³",
            "client_qty": 3240,
            "master_package": "Substructure",
            "line_cost": 226800,
            "line_margin": 8.0,
            "line_margin_amount": 18144,
            "line_contingency": 3.0,
            "line_contingency_amount": 6804,
            "line_sell": 251748,
            "is_priced": 1
        },
        {
            "item_ref": "2.1.2",
            "description": "Disposal of excavated material off-site",
            "unit": "m³",
            "client_qty": 3240,
            "master_package": "Substructure",
            "line_cost": 291600,
            "line_margin": 8.0,
            "line_margin_amount": 23328,
            "line_contingency": 3.0,
            "line_contingency_amount": 8748,
            "line_sell": 323676,
            "is_priced": 1
        },
        {
            "item_ref": "2.2.1",
            "description": "Blinding concrete, 50mm thick, grade C15",
            "unit": "m²",
            "client_qty": 1680,
            "master_package": "Substructure",
            "line_cost": 126000,
            "line_margin": 10.0,
            "line_margin_amount": 12600,
            "line_contingency": 3.0,
            "line_contingency_amount": 3780,
            "line_sell": 142380,
            "is_priced": 1
        },
        {
            "item_ref": "2.2.2",
            "description": "Reinforced concrete raft, grade C35, 600mm thick",
            "unit": "m³",
            "client_qty": 1008,
            "master_package": "Substructure",
            "line_cost": 1814400,
            "line_margin": 12.0,
            "line_margin_amount": 217728,
            "line_contingency": 3.5,
            "line_contingency_amount": 63504,
            "line_sell": 2095632,
            "is_priced": 1
        },
        {
            "item_ref": "2.3.1",
            "description": "High yield reinforcement to raft",
            "unit": "tonne",
            "client_qty": 120,
            "master_package": "Substructure",
            "line_cost": 504000,
            "line_margin": 12.0,
            "line_margin_amount": 60480,
            "line_contingency": 3.5,
            "line_contingency_amount": 17640,
            "line_sell": 582120,
            "is_priced": 1
        },
        
        # Superstructure Package
        {
            "item_ref": "3.1.1",
            "description": "Reinforced concrete columns, grade C40, all levels",
            "unit": "m³",
            "client_qty": 486,
            "master_package": "Superstructure",
            "line_cost": 972000,
            "line_margin": 12.5,
            "line_margin_amount": 121500,
            "line_contingency": 3.5,
            "line_contingency_amount": 34020,
            "line_sell": 1127520,
            "is_priced": 1
        },
        {
            "item_ref": "3.1.2",
            "description": "Reinforced concrete beams and slabs, grade C40",
            "unit": "m³",
            "client_qty": 1620,
            "master_package": "Superstructure",
            "line_cost": 3078000,
            "line_margin": 12.5,
            "line_margin_amount": 384750,
            "line_contingency": 3.5,
            "line_contingency_amount": 107730,
            "line_sell": 3570480,
            "is_priced": 1
        },
        {
            "item_ref": "3.2.1",
            "description": "Rebar B500B to columns and walls",
            "unit": "tonne",
            "client_qty": 194.4,
            "master_package": "Superstructure",
            "line_cost": 816480,
            "line_margin": 12.5,
            "line_margin_amount": 102060,
            "line_contingency": 3.5,
            "line_contingency_amount": 28576.8,
            "line_sell": 947116.8,
            "is_priced": 1
        },
        {
            "item_ref": "3.2.2",
            "description": "Rebar B500B to beams and slabs",
            "unit": "tonne",
            "client_qty": 486,
            "master_package": "Superstructure",
            "line_cost": 2041200,
            "line_margin": 12.5,
            "line_margin_amount": 255150,
            "line_contingency": 3.5,
            "line_contingency_amount": 71442,
            "line_sell": 2367792,
            "is_priced": 1
        },
        
        # Façade & Cladding Package
        {
            "item_ref": "4.1.1",
            "description": "Unitised aluminium curtain wall, double glazed low-e",
            "unit": "m²",
            "client_qty": 6840,
            "master_package": "Façade & Cladding",
            "line_cost": 14364000,
            "line_margin": 14.0,
            "line_margin_amount": 2010960,
            "line_contingency": 4.0,
            "line_contingency_amount": 574560,
            "line_sell": 16949520,
            "is_priced": 1
        },
        {
            "item_ref": "4.2.1",
            "description": "Aluminium composite panels to spandrel areas",
            "unit": "m²",
            "client_qty": 2850,
            "master_package": "Façade & Cladding",
            "line_cost": 969000,
            "line_margin": 14.0,
            "line_margin_amount": 135660,
            "line_contingency": 4.0,
            "line_contingency_amount": 38760,
            "line_sell": 1143420,
            "is_priced": 1
        },
        
        # MEP Works Package
        {
            "item_ref": "5.1.1",
            "description": "Chilled water FCUs with DDC controls",
            "unit": "nr",
            "client_qty": 126,
            "master_package": "MEP Works",
            "line_cost": 441000,
            "line_margin": 10.0,
            "line_margin_amount": 44100,
            "line_contingency": 3.0,
            "line_contingency_amount": 13230,
            "line_sell": 498330,
            "is_priced": 1
        },
        {
            "item_ref": "5.2.1",
            "description": "Low voltage distribution boards, full apartment circuitry",
            "unit": "nr",
            "client_qty": 125,
            "master_package": "MEP Works",
            "line_cost": 625000,
            "line_margin": 10.0,
            "line_margin_amount": 62500,
            "line_contingency": 3.0,
            "line_contingency_amount": 18750,
            "line_sell": 706250,
            "is_priced": 1
        },
        {
            "item_ref": "5.3.1",
            "description": "LED lighting fixtures, complete with drivers",
            "unit": "nr",
            "client_qty": 1450,
            "master_package": "MEP Works",
            "line_cost": 290000,
            "line_margin": 10.0,
            "line_margin_amount": 29000,
            "line_contingency": 3.0,
            "line_contingency_amount": 8700,
            "line_sell": 327700,
            "is_priced": 1
        },
        
        # Finishes Package
        {
            "item_ref": "6.1.1",
            "description": "Gypsum partition wall, 100mm, insulated",
            "unit": "m²",
            "client_qty": 11260,
            "master_package": "Finishes",
            "line_cost": 1914200,
            "line_margin": 15.0,
            "line_margin_amount": 287130,
            "line_contingency": 3.0,
            "line_contingency_amount": 57426,
            "line_sell": 2258756,
            "is_priced": 1
        },
        {
            "item_ref": "6.2.1",
            "description": "Porcelain floor tile 600x600, fully vitrified",
            "unit": "m²",
            "client_qty": 8480,
            "master_package": "Finishes",
            "line_cost": 1272000,
            "line_margin": 15.0,
            "line_margin_amount": 190800,
            "line_contingency": 3.0,
            "line_contingency_amount": 38160,
            "line_sell": 1500960,
            "is_priced": 1
        },
        {
            "item_ref": "6.3.1",
            "description": "Acoustic spray to ceilings, 3mm thick",
            "unit": "m²",
            "client_qty": 4250,
            "master_package": "Finishes",
            "line_cost": 297500,
            "line_margin": 15.0,
            "line_margin_amount": 44625,
            "line_contingency": 3.0,
            "line_contingency_amount": 8925,
            "line_sell": 351050,
            "is_priced": 1
        }
    ]
    
    for line in boq_lines:
        bid.append("boq_lines", line)
    
    # Calculate package totals
    for pkg in bid.master_packages:
        pkg_total_cost = 0
        pkg_total_sell = 0
        pkg_material = 0
        pkg_manpower = 0
        pkg_equipment = 0
        pkg_subcontractor = 0
        pkg_prime = 0
        
        for line in bid.boq_lines:
            if line.master_package == pkg.package_name:
                pkg_total_cost += line.line_cost or 0
                pkg_total_sell += line.line_sell or 0
                
                # Estimate cost category distribution based on package type
                if pkg.package_name == "Preliminaries":
                    pkg_manpower += line.line_cost * 0.7
                    pkg_material += line.line_cost * 0.3
                elif pkg.package_name in ["Substructure", "Superstructure"]:
                    pkg_material += line.line_cost * 0.6
                    pkg_manpower += line.line_cost * 0.25
                    pkg_equipment += line.line_cost * 0.15
                elif pkg.package_name == "Façade & Cladding":
                    pkg_material += line.line_cost * 0.55
                    pkg_subcontractor += line.line_cost * 0.35
                    pkg_manpower += line.line_cost * 0.1
                elif pkg.package_name == "MEP Works":
                    pkg_material += line.line_cost * 0.5
                    pkg_subcontractor += line.line_cost * 0.35
                    pkg_manpower += line.line_cost * 0.15
                else:  # Finishes
                    pkg_material += line.line_cost * 0.5
                    pkg_manpower += line.line_cost * 0.5
        
        pkg.material_cost = pkg_material
        pkg.manpower_cost = pkg_manpower
        pkg.equipment_cost = pkg_equipment
        pkg.subcontractor_cost = pkg_subcontractor
        pkg.prime_cost = pkg_prime
        pkg.total_cost = pkg_total_cost
        pkg.total_sell = pkg_total_sell
        pkg.total_margin = pkg_total_sell - pkg_total_cost
        pkg.margin_percent = (pkg.total_margin / pkg_total_cost * 100) if pkg_total_cost else 0
    
    # Calculate bid totals
    total_cost = sum([pkg.total_cost or 0 for pkg in bid.master_packages])
    total_sell = sum([pkg.total_sell or 0 for pkg in bid.master_packages])
    commission_amount = total_sell * (bid.commission_rate / 100)
    grand_total = total_sell + commission_amount
    
    bid.total_cost = total_cost
    bid.total_sell = total_sell
    bid.total_margin = total_sell - total_cost
    bid.material_cost = sum([pkg.material_cost or 0 for pkg in bid.master_packages])
    bid.manpower_cost = sum([pkg.manpower_cost or 0 for pkg in bid.master_packages])
    bid.equipment_cost = sum([pkg.equipment_cost or 0 for pkg in bid.master_packages])
    bid.subcontractor_cost = sum([pkg.subcontractor_cost or 0 for pkg in bid.master_packages])
    bid.prime_cost = sum([pkg.prime_cost or 0 for pkg in bid.master_packages])
    bid.bid_total = grand_total
    bid.total_priced_value = total_sell
    
    # Save the bid
    bid.save()
    frappe.db.commit()
    
    # Print summary
    print("\n" + "=" * 60)
    print("✅ Sample Bid Created Successfully!")
    print("=" * 60)
    print(f"📋 Bid Code: {bid.bid_code}")
    print(f"🏗️ Project: {bid.project_name}")
    print(f"👥 Client: {bid.client_name}")
    print(f"\n📊 Summary:")
    print(f"   Total Line Items: {len(bid.boq_lines)}")
    print(f"   Master Packages: {len(bid.master_packages)}")
    print(f"\n💰 Financials:")
    print(f"   Total Cost:     AED {total_cost:,.2f}")
    print(f"   Total Sell:     AED {total_sell:,.2f}")
    print(f"   Total Margin:   AED {bid.total_margin:,.2f} ({bid.total_margin/total_cost*100:.1f}%)")
    print(f"   Commission:     AED {commission_amount:,.2f} ({bid.commission_rate}%)")
    print(f"   GRAND TOTAL:    AED {grand_total:,.2f}")
    print("\n📦 Package Breakdown:")
    for pkg in bid.master_packages:
        print(f"   • {pkg.package_name}: AED {pkg.total_sell:,.2f}")
    print("\n" + "=" * 60)
    print(f"🔗 View your bid at: /app/bid/{bid.name}")
    print("=" * 60)
    
    return bid

if __name__ == "__main__":
    run()