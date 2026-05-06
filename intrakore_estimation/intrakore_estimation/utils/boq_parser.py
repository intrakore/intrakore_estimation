# intrakore_estimation/utils/boq_parser.py
import re
import pandas as pd
import openpyxl
from typing import Dict, List, Any, Tuple, Optional
from collections import OrderedDict
import os

class BOQParser:
    """BOQ parser - extracts index sheet and valid line items only"""
    
    def __init__(self):
        self.column_mapping = {}
        self.detected_format = None
    
    def parse_file(self, file_path: str) -> Dict[str, Any]:
        """Parse BOQ file - main entry point"""
        parser = UniversalBOQParser()
        return parser.parse_file(file_path)
    
    def to_json(self, parse_result: Dict) -> Dict:
        """Convert to JSON"""
        parser = UniversalBOQParser()
        return parser.to_json(parse_result)


class UniversalBOQParser:
    """Universal BOQ parser - extracts index and line items separately"""
    
    # Unit mappings for standardization
    UNIT_MAPPINGS = {
        'sqms': 'm²', 'sqm': 'm²', 'm2': 'm²', 'm²': 'm²',
        'lmtr': 'm', 'lm': 'm', 'l.m': 'm', 'l/m': 'm', 'm': 'm',
        'nos': 'nr', 'nos.': 'nr', 'each': 'nr', 'nr': 'nr', 'no': 'nr',
        'lot': 'lot', 'job': 'job', 'set': 'set', 'sets': 'set',
        'hour': 'hr', 'hours': 'hr', 'hr': 'hr',
        'day': 'day', 'days': 'day', 'week': 'week', 'month': 'mo',
        'kg': 'kg', 'tonne': 'tonne', 't': 'tonne',
        'm³': 'm³', 'm3': 'm³', 'lit': 'L', 'litre': 'L'
    }
    
    # Valid units for line items (must have quantity AND unit)
    VALID_UNITS = {'m²', 'm', 'nr', 'kg', 'tonne', 'm³', 'L', 'hr', 'day', 'week', 'month', 'lot', 'set', 'job'}
    
    # Package name mapping - convert spaces to hyphens
    @staticmethod
    def sanitize_package_name(package_name: str) -> str:
        """Convert package name to valid format: replace spaces with hyphens"""
        if not package_name or package_name == 'Unassigned':
            return 'Unassigned'
        # Replace spaces with hyphens
        name = package_name.replace(' ', '-')
        # Replace & with 'and'
        name = name.replace('&', 'and')
        # Remove any other special characters, keep letters, numbers, hyphens
        name = re.sub(r'[^a-zA-Z0-9-]', '', name)
        # Remove multiple consecutive hyphens
        name = re.sub(r'-+', '-', name)
        # Remove leading/trailing hyphens
        name = name.strip('-')
        return name if name else 'Unassigned'
    
    @staticmethod
    def format_quantity(quantity: float) -> float:
        """Format quantity to remove .0 if it's a whole number"""
        if quantity is None:
            return 0
        # If it's a whole number (e.g., 134.0), return as int (134)
        if isinstance(quantity, float) and quantity == int(quantity):
            return int(quantity)
        # If it's a float with .100, round to 2 decimals
        if isinstance(quantity, float):
            # Check if it's essentially a whole number but with .100
            rounded = round(quantity, 2)
            if rounded == int(rounded):
                return int(rounded)
            return rounded
        return quantity
        
    # Cost Library with components by keyword
    COST_LIBRARY = {
        "concrete": [
            {"name": "Ready-mix concrete", "category": "Material", "unit": "m³"},
            {"name": "Concrete pump hire", "category": "Equipment", "unit": "day"},
            {"name": "Concrete vibrator", "category": "Equipment", "unit": "day"},
            {"name": "Concrete placing gang", "category": "Manpower", "unit": "hour"}
        ],
        "reinforced concrete": [
            {"name": "Ready-mix concrete", "category": "Material", "unit": "m³"},
            {"name": "Steel reinforcement", "category": "Material", "unit": "tonne"},
            {"name": "Formwork system", "category": "Material", "unit": "m²"},
            {"name": "Concrete placing gang", "category": "Manpower", "unit": "hour"},
            {"name": "Steel fixer gang", "category": "Manpower", "unit": "hour"},
            {"name": "Concrete pump hire", "category": "Equipment", "unit": "day"}
        ],
        "rebar": [
            {"name": "Steel reinforcement B500B", "category": "Material", "unit": "tonne"},
            {"name": "Steel fixer gang", "category": "Manpower", "unit": "hour"},
            {"name": "Rebar cutting & bending", "category": "Equipment", "unit": "tonne"}
        ],
        "steel": [
            {"name": "Steel sections", "category": "Material", "unit": "tonne"},
            {"name": "Fabrication", "category": "Subcontractor", "unit": "tonne"},
            {"name": "Erection & welding", "category": "Manpower", "unit": "tonne"},
            {"name": "Mobile crane hire", "category": "Equipment", "unit": "hour"}
        ],
        "formwork": [
            {"name": "Formwork plywood", "category": "Material", "unit": "m²"},
            {"name": "Carpenter gang", "category": "Manpower", "unit": "hour"},
            {"name": "Formwork accessories", "category": "Material", "unit": "m²"}
        ],
        "excavation": [
            {"name": "Excavator hire", "category": "Equipment", "unit": "hour"},
            {"name": "Dump truck hire", "category": "Equipment", "unit": "hour"},
            {"name": "Excavation labor", "category": "Manpower", "unit": "hour"}
        ],
        "tile": [
            {"name": "Porcelain/Ceramic tile", "category": "Material", "unit": "m²"},
            {"name": "Tile adhesive", "category": "Material", "unit": "kg"},
            {"name": "Grout", "category": "Material", "unit": "kg"},
            {"name": "Tiling labor", "category": "Manpower", "unit": "m²"}
        ],
        "marble": [
            {"name": "Marble tile", "category": "Material", "unit": "m²"},
            {"name": "Marble adhesive", "category": "Material", "unit": "kg"},
            {"name": "Marble fixing labor", "category": "Manpower", "unit": "m²"},
            {"name": "Polishing & sealing", "category": "Subcontractor", "unit": "m²"}
        ],
        "door": [
            {"name": "Door leaf", "category": "Material", "unit": "nr"},
            {"name": "Door frame", "category": "Material", "unit": "nr"},
            {"name": "Door hardware", "category": "Material", "unit": "set"},
            {"name": "Door installation labor", "category": "Manpower", "unit": "nr"}
        ],
        "paint": [
            {"name": "Paint material", "category": "Material", "unit": "litre"},
            {"name": "Primer", "category": "Material", "unit": "litre"},
            {"name": "Painting labor", "category": "Manpower", "unit": "m²"}
        ]
    }
    
    # Package keywords mapping (returns sanitized package names)
    PACKAGE_KEYWORDS = {
        'concrete': 'Concrete-Works',
        'rebar': 'Reinforcement',
        'steel': 'Structural-Steel',
        'formwork': 'Formwork',
        'excavation': 'Substructure',
        'piling': 'Substructure',
        'tile': 'Flooring-Works',
        'marble': 'Flooring-Works',
        'carpet': 'Flooring-Works',
        'flooring': 'Flooring-Works',
        'paint': 'Wall-Finishes',
        'plaster': 'Wall-Finishes',
        'drywall': 'Wall-Finishes',
        'gypsum': 'Wall-Finishes',
        'door': 'Doors-and-Hardware',
        'hardware': 'Doors-and-Hardware',
        'lighting': 'MEP-Works',
        'socket': 'MEP-Works',
        'switch': 'MEP-Works',
        'fcu': 'MEP-Works',
        'hvac': 'MEP-Works',
        'plumbing': 'MEP-Works',
        'electrical': 'MEP-Works',
        'glass': 'Glass-and-Mirrors',
        'mirror': 'Glass-and-Mirrors',
        'curtain wall': 'Facade-and-Cladding',
        'cladding': 'Facade-and-Cladding',
        'waterproofing': 'Roofing-and-Waterproofing',
        'roof': 'Roofing-and-Waterproofing',
        'sanitary': 'Sanitaryware',
        'toilet': 'Sanitaryware',
        'basin': 'Sanitaryware',
        'joinery': 'Joinery-and-Carpentry',
        'cabinet': 'Joinery-and-Carpentry',
        'wardrobe': 'Joinery-and-Carpentry',
        'vanity': 'Joinery-and-Carpentry',
        'kitchen': 'Joinery-and-Carpentry',
        'furniture': 'Furniture',
        'signage': 'Signage-and-Art',
        'landscape': 'Landscaping',
        'preliminaries': 'Preliminaries',
        'insurance': 'Preliminaries',
        'bond': 'Preliminaries',
        'permit': 'Preliminaries',
        'safety': 'Preliminaries',
        'security': 'Preliminaries',
        'cleaning': 'Preliminaries',
        'mobilization': 'Preliminaries'
    }
        
    def __init__(self):
        self.column_mapping = {}
        self.current_bill = None
        self.current_section = None
        self.index_packages = []

    def parse_file(self, file_path: str) -> Dict[str, Any]:
        """Main entry point - parse any BOQ file format"""
        if not os.path.exists(file_path):
            return {'error': f'File not found: {file_path}'}
        
        result = {
            'bills': [],
            'total_lines': 0,
            'total_headers': 0,
            'total_totals': 0,
            'sheets': [],
            'index': {
                'raw_content': '',
                'sections': [],
                'packages': []
            },
            'line_items': [],
            'confidence': 100,
            'file_type': 'unknown'
        }
        
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
            return self._parse_single_sheet(df, os.path.basename(file_path))
        else:
            excel_file = pd.ExcelFile(file_path)
            
            # Step 1: Parse Index sheet first to extract structure
            index_data = self._parse_index_sheet(excel_file)
            result['index'] = index_data
            
            # Step 2: Parse all other sheets
            for sheet_name in excel_file.sheet_names:
                if sheet_name.lower() in ['index', 'grand summary', 'gs/1', 'summary', 'summary (2)']:
                    continue
                    
                df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
                sheet_result = self._parse_sheet(df, sheet_name, index_data)
                sheet_result['sheet_name'] = sheet_name
                
                for row in sheet_result.get('rows', []):
                    if row.get('type') == 'line':
                        result['line_items'].append(row)
                
                result['sheets'].append(sheet_result)
                result['total_lines'] += sheet_result['total_lines']
                result['total_headers'] += sheet_result['total_headers']
                result['total_totals'] += sheet_result['total_totals']
                result['bills'].append({
                    'name': sheet_name,
                    'lines': sheet_result['total_lines']
                })
            
            if len(result['sheets']) > 0:
                result['file_type'] = 'excel'
            
            return result

    def _parse_index_sheet(self, excel_file: pd.ExcelFile) -> Dict[str, Any]:
        """Parse Index sheet to extract section names and suggested packages"""
        index_data = {
            'raw_content': '',
            'sections': [],
            'packages': []
        }
        
        if 'Index' not in excel_file.sheet_names:
            index_data['raw_content'] = "No Index sheet found in this BOQ file."
            return index_data
        
        try:
            df = pd.read_excel(excel_file, sheet_name='Index', header=None)
            lines = []
            
            for idx, row in df.iterrows():
                col_a = str(row[0]).strip() if len(row) > 0 and pd.notna(row[0]) else ""
                col_b = str(row[1]).strip() if len(row) > 1 and pd.notna(row[1]) else ""
                
                if col_a:
                    row_text = f"{col_a} | {col_b}" if col_b else col_a
                    lines.append(row_text)
                
                section_match = re.match(r'^SECTION\s+(\d+)\s*-\s*(.+)$', col_a, re.IGNORECASE)
                if section_match:
                    section_num = section_match.group(1)
                    section_name = section_match.group(2).strip()
                    full_section = f"SECTION {section_num} - {section_name}"
                    
                    package_name = self._extract_package_from_section(section_name)
                    sanitized_package = self.sanitize_package_name(package_name)
                    
                    index_data['sections'].append({
                        'section_num': section_num,
                        'section_name': full_section,
                        'short_name': section_name,
                        'suggested_package': sanitized_package,
                        'page_ref': col_b if col_b else ''
                    })
                    
                    if sanitized_package and sanitized_package not in index_data['packages']:
                        index_data['packages'].append(sanitized_package)
            
            if lines:
                index_data['raw_content'] = "=== BOQ INDEX ===\n" + "\n".join(lines)
            else:
                index_data['raw_content'] = "Index sheet is empty."
                
        except Exception as e:
            index_data['raw_content'] = f"Error reading Index sheet: {str(e)}"
        
        return index_data

    def _extract_package_from_section(self, section_name: str) -> str:
        """Extract package name from section name"""
        section_upper = section_name.upper()
        
        package_mapping = {
            'PRELIMINARIES': 'Preliminaries',
            'FINISHES': 'Finishes',
            'DOORS': 'Doors-and-Hardware',
            'JOINERY': 'Joinery-and-Carpentry',
            'FURNITURE': 'Furniture',
            'LIGHTING': 'MEP-Works',
            'POWER': 'MEP-Works',
            'HARDWARE': 'Doors-and-Hardware',
            'SANITARYWARE': 'Sanitaryware',
            'MIRRORS': 'Glass-and-Mirrors',
            'SUBSTRUCTURE': 'Substructure',
            'SUPERSTRUCTURE': 'Superstructure',
            'CONCRETE': 'Concrete-Works',
            'STEEL': 'Structural-Steel',
            'FLOORING': 'Flooring-Works',
            'WALL': 'Wall-Finishes',
            'CEILING': 'Ceiling-Works',
            'MEP': 'MEP-Works',
            'FACADE': 'Facade-and-Cladding',
            'CLADDING': 'Facade-and-Cladding',
            'GLAZING': 'Glass-and-Mirrors',
            'ROOFING': 'Roofing-and-Waterproofing',
            'WATERPROOFING': 'Roofing-and-Waterproofing'
        }
        
        for key, package in package_mapping.items():
            if key in section_upper:
                return package
        
        return "Unassigned"

    def _detect_package(self, description: str, index_packages: List[str] = None) -> str:
        """Detect package using keywords"""
        desc_lower = description.lower()
        
        # Check index packages first
        if index_packages:
            for pkg in index_packages:
                if pkg.lower().replace('-', ' ') in desc_lower:
                    return pkg
        
        # Check keyword mapping
        for keyword, package in self.PACKAGE_KEYWORDS.items():
            if keyword in desc_lower:
                return package
        
        return "Unassigned"

    def _suggest_components(self, description: str, quantity: float, unit: str) -> List[Dict]:
        """Suggest cost components based on line item description"""
        desc_lower = description.lower()
        suggested = []
        added_components = set()
        
        for keyword, components in self.COST_LIBRARY.items():
            if keyword in desc_lower:
                for comp in components:
                    comp_key = f"{comp['name']}_{comp['category']}"
                    if comp_key not in added_components:
                        est_qty = quantity
                        if comp['unit'] == 'tonne' and 'm³' in unit:
                            est_qty = quantity * 2.4
                        elif comp['unit'] == 'm²' and 'm³' in unit:
                            est_qty = quantity * 10
                        
                        suggested.append({
                            "component_name": comp["name"],
                            "cost_category": comp["category"],
                            "suggested_quantity": self.format_quantity(est_qty),
                            "suggested_unit": comp["unit"],
                            "notes": f"Auto-suggested from keyword: '{keyword}'"
                        })
                        added_components.add(comp_key)
        
        return suggested

    def _parse_sheet(self, df: pd.DataFrame, sheet_name: str, index_data: Dict = None) -> Dict[str, Any]:
        """Parse a single sheet using Index data for context"""
        result = {
            'rows': [],
            'total_lines': 0,
            'total_headers': 0,
            'total_totals': 0,
            'ambiguous_rows': []
        }
        
        header_row_idx, col_indices = self._find_header_row(df)
        
        if header_row_idx is None:
            return self._auto_parse_sheet(df, sheet_name, index_data)
        
        current_bill = sheet_name
        current_section = None
        index_packages = index_data.get('packages', []) if index_data else []
        
        for idx in range(header_row_idx + 1, len(df)):
            row = df.iloc[idx]
            
            item_val = self._get_cell_value(row, col_indices.get('item'))
            desc_val = self._get_cell_value(row, col_indices.get('description'))
            qty_val = self._get_cell_value(row, col_indices.get('quantity'))
            unit_val = self._get_cell_value(row, col_indices.get('unit'))
            
            if not desc_val and not item_val:
                continue
            
            if item_val and item_val.isupper() and len(item_val) > 5 and not qty_val and not unit_val:
                current_section = item_val
                result['rows'].append({
                    'id': idx,
                    'type': 'section',
                    'text': item_val,
                    'bill': current_bill,
                    'confidence': 90
                })
                result['total_headers'] += 1
                continue
            
            if item_val and re.search(r'(collection|total|subtotal|carried)', item_val.lower()):
                result['rows'].append({
                    'id': idx,
                    'type': 'total',
                    'text': item_val,
                    'confidence': 95
                })
                result['total_totals'] += 1
                continue
            
            has_valid_qty = qty_val and self._is_valid_quantity(qty_val)
            has_valid_unit = unit_val and self._is_valid_unit(unit_val)
            
            if has_valid_qty and has_valid_unit:
                description = self._clean_description(desc_val)
                if not description and item_val:
                    description = item_val
                
                qty_parsed = self._parse_quantity(qty_val)
                qty_parsed = self.format_quantity(qty_parsed)  # Fix decimal issue
                unit_std = self.UNIT_MAPPINGS.get(unit_val.lower(), unit_val)
                item_ref = self._clean_item_ref(item_val) or f"ITEM_{idx}"
                
                detected_package = self._detect_package(description, index_packages)
                sanitized_package = self.sanitize_package_name(detected_package)
                
                suggested_comps = self._suggest_components(description, qty_parsed, unit_std)
                
                line_item = {
                    'id': idx,
                    'type': 'line',
                    'item_ref': item_ref,
                    'description': description[:500],
                    'unit': unit_std,
                    'quantity': qty_parsed,
                    'original_qty': str(qty_val),
                    'original_unit': unit_val,
                    'bill': current_bill,
                    'section': current_section,
                    'package': sanitized_package,
                    'suggested_components': suggested_comps,
                    'warnings': [],
                    'confidence': 95
                }
                
                if 'pc rate' in description.lower():
                    line_item['warnings'].append('PC Rate item')
                if 'by others' in description.lower() or 'by client' in description.lower():
                    line_item['warnings'].append('Client supply item')
                
                result['rows'].append(line_item)
                result['total_lines'] += 1
                
            elif desc_val and (has_valid_qty or has_valid_unit):
                result['ambiguous_rows'].append({
                    'id': idx,
                    'item': item_val,
                    'description': desc_val[:100],
                    'qty': qty_val,
                    'unit': unit_val,
                    'issue': 'Missing quantity or unit'
                })
        
        return result

    def _auto_parse_sheet(self, df: pd.DataFrame, sheet_name: str, index_data: Dict = None) -> Dict[str, Any]:
        """Auto-detect and parse sheet when no header row found"""
        result = {
            'rows': [],
            'total_lines': 0,
            'total_headers': 0,
            'total_totals': 0,
            'ambiguous_rows': []
        }
        
        current_bill = sheet_name
        current_section = None
        index_packages = index_data.get('packages', []) if index_data else []
        
        for idx, row in df.iterrows():
            non_empty = [i for i, cell in enumerate(row) if pd.notna(cell) and str(cell).strip()]
            
            if len(non_empty) >= 2:
                qty_val = None
                unit_val = None
                desc_val = None
                item_val = None
                package_val = None
                
                for col_idx in non_empty:
                    cell_val = str(row.iloc[col_idx]).strip()
                    if re.match(r'^[\d,]+(?:\.\d+)?$', cell_val):
                        qty_val = cell_val
                    elif cell_val.lower() in self.VALID_UNITS or cell_val.lower() in self.UNIT_MAPPINGS:
                        unit_val = cell_val
                    elif len(cell_val) > 10 and not re.match(r'^[A-Z\.]+$', cell_val):
                        desc_val = cell_val
                    elif len(cell_val) < 15 and not desc_val:
                        item_val = cell_val
                    elif cell_val in self.PACKAGE_KEYWORDS.values():
                        package_val = cell_val
                
                if qty_val and unit_val:
                    description = self._clean_description(desc_val or item_val or "")
                    if description:
                        item_ref = self._clean_item_ref(item_val) or f"AUTO_{idx}"
                        qty_parsed = self._parse_quantity(qty_val)
                        qty_parsed = self.format_quantity(qty_parsed)
                        unit_std = self.UNIT_MAPPINGS.get(unit_val.lower(), unit_val)
                        
                        detected_package = package_val or self._detect_package(description, index_packages)
                        sanitized_package = self.sanitize_package_name(detected_package)
                        suggested_comps = self._suggest_components(description, qty_parsed, unit_std)
                        
                        line_item = {
                            'id': idx,
                            'type': 'line',
                            'item_ref': item_ref,
                            'description': description[:500],
                            'unit': unit_std,
                            'quantity': qty_parsed,
                            'original_qty': qty_val,
                            'original_unit': unit_val,
                            'bill': current_bill,
                            'section': current_section,
                            'package': sanitized_package,
                            'suggested_components': suggested_comps,
                            'warnings': ['Auto-detected - verify data'],
                            'confidence': 75
                        }
                        result['rows'].append(line_item)
                        result['total_lines'] += 1
        
        return result

    def _find_header_row(self, df: pd.DataFrame) -> Tuple[Optional[int], Dict[str, int]]:
        """Find the header row containing Item, Description, Unit, Qty columns"""
        col_indices = {'item': None, 'description': None, 'unit': None, 'quantity': None}
        
        for idx in range(min(30, len(df))):
            row = df.iloc[idx]
            row_text_lower = ' '.join([str(cell).lower() for cell in row if pd.notna(cell)])
            
            has_item = 'item' in row_text_lower or 'ref' in row_text_lower or 'no.' in row_text_lower
            has_desc = 'description' in row_text_lower or 'desc' in row_text_lower or 'particulars' in row_text_lower
            has_qty = 'qty' in row_text_lower or 'quantity' in row_text_lower
            has_unit = 'unit' in row_text_lower or 'uom' in row_text_lower
            
            if has_item and has_desc and (has_qty or has_unit):
                for col_idx, cell in enumerate(row):
                    if pd.isna(cell):
                        continue
                    cell_lower = str(cell).lower().strip()
                    
                    if 'item' in cell_lower or 'ref' in cell_lower or 'no.' in cell_lower:
                        col_indices['item'] = col_idx
                    elif 'description' in cell_lower or 'desc' in cell_lower or 'particulars' in cell_lower:
                        col_indices['description'] = col_idx
                    elif 'qty' in cell_lower or 'quantity' in cell_lower:
                        col_indices['quantity'] = col_idx
                    elif 'unit' in cell_lower or 'uom' in cell_lower:
                        col_indices['unit'] = col_idx
                
                if col_indices['description'] is not None and (col_indices['quantity'] is not None or col_indices['unit'] is not None):
                    return idx, col_indices
        
        return None, col_indices

    def _is_valid_quantity(self, qty: str) -> bool:
        if not qty:
            return False
        qty_str = str(qty).strip()
        if re.match(r'^[\d,]+(?:\.\d+)?$', qty_str):
            return True
        if qty_str.startswith('='):
            return True
        return False

    def _is_valid_unit(self, unit: str) -> bool:
        if not unit:
            return False
        unit_lower = unit.lower().strip()
        return unit_lower in self.VALID_UNITS or unit_lower in self.UNIT_MAPPINGS

    def _clean_item_ref(self, item_ref: str) -> str:
        if not item_ref:
            return ""
        cleaned = item_ref.strip()[:30]
        if len(cleaned) > 20 and ' ' in cleaned:
            return ""
        return cleaned

    def _clean_description(self, desc: str) -> str:
        if not desc:
            return ""
        desc = desc.replace('<br>', ' ').replace('<br/>', ' ').replace('\n', ' ')
        desc = re.sub(r'\s+', ' ', desc)
        return desc.strip()

    def _parse_quantity(self, qty: Any) -> float:
        """Parse quantity from various formats - returns whole numbers as ints"""
        if not qty:
            return 0
        
        if isinstance(qty, (int, float)):
            # Return as int if it's a whole number
            if qty == int(qty):
                return int(qty)
            return qty
        
        qty_str = str(qty).strip()
        
        # Handle Excel formulas
        if qty_str.startswith('='):
            numbers = re.findall(r'[\d,]+(?:\.\d+)?', qty_str)
            if numbers:
                total = sum(float(n.replace(',', '')) for n in numbers)
                # Return as int if whole number
                if total == int(total):
                    return int(total)
                return round(total, 2)
            return 0
        
        # Extract first number
        numbers = re.findall(r'[\d,]+(?:\.\d+)?', qty_str)
        if numbers:
            # Remove commas and convert to float
            value = float(numbers[0].replace(',', ''))
            # Return as int if whole number
            if value == int(value):
                return int(value)
            return value
        
        return 0

    def create_package_if_not_exists(self, package_name: str) -> str:
        """Create package in database if it doesn't exist, return sanitized name"""
        import frappe
        
        if not package_name or package_name == 'Unassigned':
            return 'Unassigned'
        
        # Sanitize the package name first
        sanitized = self.sanitize_package_name(package_name)
        
        try:
            # Check if package exists in Frappe
            if not frappe.db.exists("Package", sanitized):
                # Create new package
                new_package = frappe.get_doc({
                    "doctype": "Package",
                    "package_name": sanitized,
                    "package_code": sanitized[:4].upper().replace('-', ''),
                    "color": "#3b82f6",
                    "description": f"{sanitized.replace('-', ' ')} work package",
                    "is_active": 1,
                    "default_margin": 10
                })
                new_package.insert()
                frappe.db.commit()
                print(f"✅ Created package: {sanitized}")
            return sanitized
        except Exception as e:
            print(f"Error creating package {sanitized}: {e}")
            return 'Unassigned'

    def _get_cell_value(self, row: pd.Series, idx: Optional[int]) -> str:
        if idx is None or idx >= len(row):
            return ""
        val = row.iloc[idx]
        if pd.isna(val):
            return ""
        return str(val).strip()

    def _parse_single_sheet(self, df: pd.DataFrame, sheet_name: str) -> Dict[str, Any]:
        result = {
            'sheets': [{
                'sheet_name': sheet_name,
                'rows': [],
                'total_lines': 0,
                'total_headers': 0,
                'total_totals': 0
            }],
            'total_lines': 0,
            'total_headers': 0,
            'total_totals': 0,
            'index': {'raw_content': '', 'sections': [], 'packages': []},
            'line_items': [],
            'file_type': 'csv'
        }
        
        for idx, row in df.iterrows():
            if len(row) >= 3:
                qty_val = None
                unit_val = None
                desc_val = None
                
                for col_idx, cell in enumerate(row):
                    cell_str = str(cell) if pd.notna(cell) else ""
                    if self._is_valid_quantity(cell_str):
                        qty_val = cell_str
                    elif self._is_valid_unit(cell_str):
                        unit_val = cell_str
                    elif len(cell_str) > 10:
                        desc_val = cell_str
                
                if qty_val and unit_val and desc_val:
                    description = self._clean_description(desc_val)
                    item_ref = str(row.iloc[0])[:30] if len(row) > 0 else f"ITEM_{idx}"
                    qty_parsed = self._parse_quantity(qty_val)
                    qty_parsed = self.format_quantity(qty_parsed)
                    unit_std = self.UNIT_MAPPINGS.get(unit_val.lower(), unit_val)
                    
                    detected_package = self._detect_package(description, [])
                    sanitized_package = self.sanitize_package_name(detected_package)
                    suggested_comps = self._suggest_components(description, qty_parsed, unit_std)
                    
                    line_item = {
                        'id': idx,
                        'type': 'line',
                        'item_ref': item_ref,
                        'description': description[:500],
                        'unit': unit_std,
                        'quantity': qty_parsed,
                        'original_qty': qty_val,
                        'original_unit': unit_val,
                        'package': sanitized_package,
                        'suggested_components': suggested_comps,
                        'warnings': []
                    }
                    result['sheets'][0]['rows'].append(line_item)
                    result['line_items'].append(line_item)
                    result['total_lines'] += 1
        
        return result

    def to_json(self, parse_result: Dict) -> Dict:
        """Convert parse result to JSON-serializable format"""
        return {
            'bills': parse_result.get('bills', []),
            'total_lines': parse_result.get('total_lines', 0),
            'total_headers': parse_result.get('total_headers', 0),
            'total_totals': parse_result.get('total_totals', 0),
            'confidence': parse_result.get('confidence', 0),
            'file_type': parse_result.get('file_type', 'unknown'),
            'index': parse_result.get('index', {}),
            'line_items': parse_result.get('line_items', []),
            'sheets': parse_result.get('sheets', [])
        }


# Legacy function for backward compatibility
def parse_boq_file(file_path: str) -> Dict[str, Any]:
    """Parse any BOQ file format - main entry point"""
    parser = BOQParser()
    return parser.parse_file(file_path)