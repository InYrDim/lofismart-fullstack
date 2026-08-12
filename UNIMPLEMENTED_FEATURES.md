# Unimplemented Features

## Transfer Order Printing on Gudang Transfer Page

The clearest currently unimplemented feature is printing transfer orders from the dedicated Gudang transfer page.

### Evidence

- `lofishmart-frontend/src/routes/_protected.kelolagudang.transfers.lazy.tsx` passes an empty `onPrint` handler to `TransferOrderList`.
- `lofishmart-frontend/src/components/markets/TransferOrderList.tsx` already renders print actions such as `Cetak Surat Jalan` and `Cetak Bukti Terima`.
- `lofishmart-frontend/src/components/inventory/InventoryMain.tsx` already implements the working pattern by storing `printData` and rendering `TransferPrintView`.
- `.agents/tasks/active/2026-04-30-ST-03-stock-transfer.md` explicitly marked print reports / Surat Jalan as out of scope for the original stock-transfer task.

### Current Behavior

Users can see transfer-order print buttons, but on the dedicated Gudang transfer route the click path does not open or render a print view because the route-level print handler is still a TODO.

### Suggested Implementation

Reuse the existing `TransferPrintView` integration from `InventoryMain`:

1. Import `TransferPrintView` in `_protected.kelolagudang.transfers.lazy.tsx`.
2. Add `printData` state with `{ transfer, type }`.
3. Replace the empty `onPrint` handler with a handler that sets `printData`.
4. Render `TransferPrintView` when `printData` is present.

## Secondary Gap: Product List Filtering

`lofishmart-backend/controllers/productController.js` still contains a TODO to remove unfiltered product loading once proper product filtering exists. This is more of an API refinement than a clearly missing user-facing feature.
