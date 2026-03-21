"""
Generate the CSV mapping file for Cerner GL Transaction Interface.

Analysis from the Word document field mapping (Table 7):
- Target business class: GLTransactionInterface
- Input file: comma-delimited, 36 columns (A through AJ)
- Single business class requirement

Column mapping from spec (Column Letter -> Column Number):
  A=1 (Run Group), B=2 (Sequence Number), C=3 (Company), D=4 (Old Company),
  E=5 (Old-Acct-Nbr), F=6 (source code), G=7 (Date), H=8 (Reference),
  I=9 (Description), J=10 (Currency_code), K=11 (Units Amount),
  L=12 (Tran Amount), M=13, N=14, O=15 (System), P=16 (program_code),
  Q=17 (Auto Rev), R=18 (Posting Date), S=19 (Activity/Project),
  T=20 (Acct-Category), U=21 (Document-NBR)
"""
import csv

# Define the mapping rows based on the field mapping table from the Word doc
# Format: TargetFieldName, InputColumnNumber, MappingLogic, Required, DataType, MinLength, MaxLength, MinValue, MaxValue, ValidValues, Pattern
mappings = [
    # Row 2: FinanceEnterpriseGroup - Hardcoded 'AHF'
    ["FinanceEnterpriseGroup", "", "Hardcode 'AHF'", "Y", "string", "", "4", "", "", "", ""],
    # Row 3: RunGroup - Column A (1)
    ["GLTransactionInterface.RunGroup", "1", "Column1", "Y", "string", "", "30", "", "", "", ""],
    # Row 4: SequenceNumber - Increment by 1
    ["GLTransactionInterface.SequenceNumber", "", "Increment By 1", "Y", "integer", "", "12", "", "", "", ""],
    # Row 6: AccountingEntity - Column C (3), Remove leading zeroes
    ["AccountingEntity", "3", "RemoveLeadingZeroes(Column3)", "Y", "string", "", "12", "", "", "", ""],
    # Row 7: Status - Hardcoded '0' (Unreleased)
    ["Status", "", "Hardcode '0'", "", "integer", "", "1", "", "", "0,1,2", ""],
    # Row 8: OrganizationCode - Blank
    ["OrganizationCode", "", "", "", "string", "", "40", "", "", "", ""],
    # Row 9: ToAccountingEntity - Column C (3)
    ["ToAccountingEntity", "3", "Column3", "", "string", "", "12", "", "", "", ""],
    # Row 10: AccountingUnit - Not Applicable (blank)
    ["AccountingUnit", "", "", "", "string", "", "25", "", "", "", ""],
    # Row 11: AccountCode - Column E (5), First 6 digits
    ["AccountCode", "5", "Left(Column5,6)", "Y", "string", "", "26", "", "", "", ""],
    # Row 12: GeneralLedgerEvent - Column F (6), TC default if blank
    ["GeneralLedgerEvent", "6", "If Column6 == '' Then 'TC' Else Column6", "", "string", "", "15", "", "", "", ""],
    # Row 13: JournalCode - Column P (16)
    ["JournalCode", "16", "Trim(Column16)", "", "string", "", "6", "", "", "", ""],
    # Row 14: TransactionDate - Column G (7), YYYYMMDD format
    ["TransactionDate", "7", "DateReformat(Column7,'MMDDYYYY','YYYYMMDD')", "", "string", "8", "8", "", "", "", ""],
    # Row 15: Reference - Column H (8)
    ["Reference", "8", "Column8", "", "string", "", "40", "", "", "", ""],
    # Row 16: Description - Column I (9)
    ["Description", "9", "Column9", "", "string", "", "60", "", "", "", ""],
    # Row 17: CurrencyCode - Column J (10)
    ["CurrencyCode", "10", "Column10", "", "string", "", "5", "", "", "", ""],
    # Row 18: UnitsAmount - Column K (11)
    ["UnitsAmount", "11", "Column11", "", "decimal", "", "", "", "", "", ""],
    # Row 19: TransactionAmount - Column L (12)
    ["TransactionAmount", "12", "Column12", "", "decimal", "", "", "", "", "", ""],
    # Row 48: System - Column O (15), GL default if blank
    ["System", "15", "If Column15 == '' Then 'GL' Else Column15", "", "string", "", "2", "", "", "", ""],
    # Row 49: AutoReverse - Hardcoded 'N'
    ["AutoReverse", "17", "Hardcode 'N'", "", "string", "", "", "", "", "", ""],
    # Row 50: PostingDate - Column R (18), YYYYMMDD format
    ["PostingDate", "18", "DateReformat(Column18,'MMDDYYYY','YYYYMMDD')", "Y", "string", "8", "8", "", "", "", ""],
    # Row 51: Project - Column S (19) (Activity)
    ["Project", "19", "Column19", "", "string", "", "25", "", "", "", ""],
    # Row 52: FinanceDimension1 - Column D (4), Last 5 digits
    ["FinanceDimension1", "4", "Right(Column4,5)", "", "string", "", "15", "", "", "", ""],
    # Row 53: FinanceDimension2 - blank
    ["FinanceDimension2", "", "", "", "string", "", "15", "", "", "", ""],
    # Row 54: FinanceDimension3 - Column T (20) (Acct-Category)
    ["FinanceDimension3", "20", "Column20", "", "string", "", "15", "", "", "", ""],
    # Row 55-61: FinanceDimension4-10 - blank
    ["FinanceDimension4", "", "", "", "string", "", "15", "", "", "", ""],
    ["FinanceDimension5", "", "", "", "string", "", "15", "", "", "", ""],
    ["FinanceDimension6", "", "", "", "string", "", "15", "", "", "", ""],
    ["FinanceDimension7", "", "", "", "string", "", "15", "", "", "", ""],
    ["FinanceDimension8", "", "", "", "string", "", "15", "", "", "", ""],
    ["FinanceDimension9", "", "", "", "string", "", "15", "", "", "", ""],
    ["FinanceDimension10", "", "", "", "string", "", "15", "", "", "", ""],
    # Row 63: DocumentNumber - Column U (21)
    ["DocumentNumber", "21", "Column21", "", "string", "", "30", "", "", "", ""],
]

headers = [
    "TargetFieldName", "InputColumnNumber", "MappingLogic", "Required",
    "DataType", "MinLength", "MaxLength", "MinValue", "MaxValue",
    "ValidValues", "Pattern"
]

output_path = 'output/Aultman_Health_I8_CernerGLTrans_Mapping.csv'

with open(output_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(headers)
    writer.writerows(mappings)

print(f"Mapping file generated: {output_path}")
print(f"Total mapping rows: {len(mappings)}")
