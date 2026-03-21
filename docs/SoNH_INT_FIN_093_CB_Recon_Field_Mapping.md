# Field Mapping — INT_FIN_093 CB Recon (Citizens Bank)

The file being received from Citizens Bank is fixed length with the following format and will be mapped to FSM's format below.

Position 40–47 (Batch and Sequence Number) will not be mapped to FSM.

Sample record:
```
33118329320000262751R00000002873501092645236521
```

## CashLedgerBankUpdate Business Class

> Note: Use the Description column in the bank format below for the mapping.

| FSM Field | Type | Field Size | Required | Remarks | Sample Value | Bank Values / Fields |
|---|---|---|---|---|---|---|
| CashManagementGroup | AlphaUpper | 4 | Yes | Default value of "SONH" | | |
| RunGroup | AlphaUpper | 30 | Yes | | 0042_CBrecon_20250701 | `<CashCode>_<*BankAbbreviation>recon_YYYYMMDD` *Citizens Bank = CB |
| CashManagementAccount | AlphaUpper | 35 | Yes | | 3311832932 | Account Number |
| Sequence Number | Numeric | 10 | Yes | IPA to assign sequence number based on the detail record sequence | 1 | |
| TransactionAmount | Decimal | 16.2 | No | With 2 decimals | 000000028735 (read as 287.35) | Dollar Amount |
| CashLedgerUpdateAction | Numeric | 2 | Yes | If status of bank = "P", mark update action as 4 = "Paid". If "R", mark update action as 6 = "Reconcile" | R | Status Code |
| ActionDate | YYYYMMDD | 8 | Yes | Need to transform the date format from the bank field from MMDDYY to YYYYMMDD | 010926 | Paid Date |
| CheckNumber | AlphaUpper | 22 | Yes | | 0000262751 (read as 262751) | Check Serial Number |
| CashCode | AlphaUpper | 20 | No | FSM Cash Code associated with the Account Record `CashCode.CashCode` where `CashCode.BankAccountNumber = CashLedgerBankUpdate.CashManagementAccount` | 0042 | |
| BankTransactionCode | AlphaUpper | 10 | No | Default value of "CHK" | CHK | |

## Extract Sample

| Field | Value |
|---|---|
| Account Number | 3311832932 |
| Check Serial Number | 0000262751 |
| Status Code | R |
| Dollar Amount | 000000028735 |
| Paid Date | 010926 |
| Batch and Sequence Number | 45236521 |
