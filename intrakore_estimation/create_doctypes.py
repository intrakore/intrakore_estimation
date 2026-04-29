#!/usr/bin/env python3
"""
Fix Package Names and Create Missing Packages
Run with: bench --site techfordai.local execute intrakore_estimation.fix_packages
"""

import frappe
import time

def fix_and_create_packages():
    """Fix package names to be Frappe-compatible and create missing ones"""
    
    # Package names (safe for Frappe - only letters, numbers, hyphens)
    packages = [
        "Prelims",
        "Enabling-Works",
        "Substructure", 
        "Superstructure",
        "Facade-and-Cladding",
        "Roofing-and-Waterproofing",
        "Internal-Finishes",
        "Joinery",
        "MEP-Mechanical",
        "MEP-Electrical",
        "MEP-Plumbing",
        "External-Works",
        "Landscaping",
        "Provisional-Sums",
    ]
    
    print("\n" + "="*60)
    print("📦 Creating/Verifying Packages")
    print("="*60)
    
    created = 0
    existing = 0
    
    for pkg_name in packages:
        try:
            if frappe.db.exists("Package", pkg_name):
                print(f"  ⚠️ Package already exists: {pkg_name}")
                existing += 1
            else:
                doc = frappe.new_doc("Package")
                doc.package_name = pkg_name
                doc.color_code = "#6b7a99"
                doc.is_active = 1
                doc.insert(ignore_permissions=True)
                print(f"  ✅ Created package: {pkg_name}")
                created += 1
                frappe.db.commit()
                time.sleep(0.2)
                
        except Exception as e:
            print(f"  ❌ Failed to create {pkg_name}: {e}")
    
    print(f"\n{'='*60}")
    print(f"📊 Summary:")
    print(f"  ✅ Created: {created}")
    print(f"  ⚠️  Already exists: {existing}")
    print(f"{'='*60}")
    
    # Show all packages (simple query without description field)
    print("\n📋 Current Package List:")
    try:
        packages_list = frappe.get_all("Package", fields=["name"])
        for p in packages_list:
            print(f"  - {p['name']}")
    except Exception as e:
        print(f"  Could not list packages: {e}")
    
    return created


def run():
    """Main function"""
    print("\n🚀 Setting up Packages...")
    create_count = fix_and_create_packages()
    print("\n🎉 Package setup complete!")
    return create_count


if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        print(f"❌ Error: {e}")