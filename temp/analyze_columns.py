"""Analyze the input file columns and correlate with the field mapping spec."""

# Parse first data row to count columns
with open('input/CernerGLTrans_20251025.txt', 'r') as f:
    first_line = f.readline().strip()

# Split by comma
fields = first_line.split(',')
print(f"Total columns in input file: {len(fields)}")
print()
for i, val in enumerate(fields):
    col_letter = chr(65 + i) if i < 26 else chr(65 + i // 26 - 1) + chr(65 + i % 26)
    print(f"  Column {i+1} ({col_letter}): '{val.strip()}'")
