"""Extract the complete Field Mapping table (Table 7) from the document."""
import csv
from docx import Document

doc_path = r'input/Aultman Health_I8_Cerner_GLTrans_Analysis and Design Specification_v1.1.docx'
doc = Document(doc_path)

table = doc.tables[6]  # Table 7 (0-indexed)

# Extract all rows
all_rows = []
for row in table.rows:
    cells = [cell.text.strip() for cell in row.cells]
    all_rows.append(cells)

# Print headers
headers = all_rows[0]
print("Headers:", headers)
print(f"Total data rows: {len(all_rows) - 1}")
print()

# Print all data rows
for i, row in enumerate(all_rows[1:], 1):
    print(f"Row {i}: {row}")

# Also save to CSV for reference
with open('temp/field_mapping_raw.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(all_rows)

print(f"\nSaved to temp/field_mapping_raw.csv")
