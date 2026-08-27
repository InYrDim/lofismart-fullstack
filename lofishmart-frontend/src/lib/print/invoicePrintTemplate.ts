import type { SalesInvoice, PurchaseInvoice, Invoice, InvoiceItem } from "@/types/invoice";
import { formatInvoiceCurrency, formatInvoiceDateTime } from "../invoice";

function statusLabel(isPaid: string): string {
	switch (isPaid) {
		case "1": return "LUNAS";
		case "2": return "HUTANG";
		case "3": return "DP";
		default: return "UNPAID";
	}
}

function statusColor(isPaid: string): string {
	switch (isPaid) {
		case "1": return "#16a34a";
		case "2": return "#dc2626";
		case "3": return "#f59e0b";
		default: return "#6b7280";
	}
}

function generateItemsTableHtml(items: InvoiceItem[], label: string): string {
	if (items.length === 0) {
		return `
      <h3 class="section-title">${label}</h3>
      <p class="text-gray-400" style="font-size: 12px; margin: 4px 0 12px;">&mdash;</p>`;
	}

	const rows = items
		.map(
			(item: InvoiceItem) => `
        <tr>
          <td class="item-name">${item.name}${item.grade ? ` (${item.grade})` : ""}${item.size ? ` - ${item.size}` : ""}</td>
          <td class="text-center">${item.qty} ${item.unit}</td>
          <td class="text-right">${formatInvoiceCurrency(item.price)}</td>
          <td class="text-right">${formatInvoiceCurrency(item.subtotal)}</td>
        </tr>`,
		)
		.join("");

	return `
      <h3 class="section-title">${label}</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Harga</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>`;
}

function generateSalesInvoiceHtml(invoice: SalesInvoice): string {
	const productItems = invoice.items.filter((i) => i.type !== "SERVICE");
	const serviceItems = invoice.items.filter((i) => i.type === "SERVICE");

	return `
    <div class="invoice">
      <div class="invoice-header">
        <div class="header-left">
          ${invoice.company.logo ? `<img src="${invoice.company.logo}" alt="Logo" class="logo"/>` : ""}
          <div>
            <h1>${invoice.company.name}</h1>
            <p>${invoice.company.address}</p>
            <p>Telp: ${invoice.company.phone}</p>
          </div>
        </div>
        <div class="header-right">
          <h2>FAKTUR PENJUALAN</h2>
          <p class="invoice-number">${invoice.invoiceNumber}</p>
        </div>
      </div>

      <div class="info-row">
        <div class="info-col">
          <p><strong>Tanggal:</strong> ${formatInvoiceDateTime(invoice.date)}</p>
          <p><strong>Market:</strong> ${invoice.marketName}</p>
          <p><strong>Kasir:</strong> ${invoice.cashierName}</p>
        </div>
        <div class="info-col">
          <p><strong>Pelanggan:</strong> ${invoice.customerName}</p>
          <p><strong>Pembayaran:</strong> ${invoice.paymentMethod}</p>
          <p><strong>Status:</strong> <span class="status-badge" style="color: ${statusColor(invoice.isPaid)}">${statusLabel(invoice.isPaid)}</span></p>
        </div>
      </div>

      ${generateItemsTableHtml(productItems, "Produk")}
      ${generateItemsTableHtml(serviceItems, "Layanan")}

      <div class="summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${formatInvoiceCurrency(invoice.subtotal)}</span>
        </div>
        ${invoice.itemDiscount > 0 ? `
        <div class="summary-row">
          <span>Diskon Item</span>
          <span class="text-red">-${formatInvoiceCurrency(invoice.itemDiscount)}</span>
        </div>` : ""}
        ${invoice.voucherDiscount > 0 ? `
        <div class="summary-row">
          <span>Diskon Voucher</span>
          <span class="text-red">-${formatInvoiceCurrency(invoice.voucherDiscount)}</span>
        </div>` : ""}
        ${invoice.tax > 0 ? `
        <div class="summary-row">
          <span>Pajak</span>
          <span>${formatInvoiceCurrency(invoice.tax)}</span>
        </div>` : ""}
        <div class="summary-row total">
          <span>Total</span>
          <span>${formatInvoiceCurrency(invoice.total)}</span>
        </div>
        <div class="summary-row">
          <span>Dibayar</span>
          <span>${formatInvoiceCurrency(invoice.payedMoney)}</span>
        </div>
        <div class="summary-row">
          <span>Kembali</span>
          <span>${formatInvoiceCurrency(invoice.changeMoney)}</span>
        </div>
      </div>

      ${invoice.note ? `<div class="note"><strong>Catatan:</strong> ${invoice.note}</div>` : ""}

      <div class="footer">
        <p>Dicetak pada: ${formatInvoiceDateTime(invoice.createdAt)}</p>
      </div>
    </div>

    <style>
      .invoice { font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1f2937; }
      .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px; }
      .header-left { display: flex; gap: 12px; align-items: center; }
      .header-left h1 { font-size: 18px; font-weight: 700; margin: 0; }
      .header-left p { font-size: 12px; color: #6b7280; margin: 2px 0; }
      .header-right { text-align: right; }
      .header-right h2 { font-size: 16px; font-weight: 700; margin: 0; text-transform: uppercase; }
      .invoice-number { font-size: 14px; font-family: monospace; color: #6b7280; }
      .logo { width: 64px; height: 64px; object-fit: contain; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; }
      .info-col p { margin: 4px 0; }
      .status-badge { font-weight: 600; }
      .items-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
      .items-table th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
      .items-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
      .item-name { font-weight: 500; }
      .section-title { font-size: 13px; font-weight: 700; margin: 12px 0 6px; text-transform: uppercase; color: #374151; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-red { color: #dc2626; }
      .summary { margin-left: auto; width: 300px; font-size: 13px; }
      .summary-row { display: flex; justify-content: space-between; padding: 4px 0; }
      .total { font-weight: 700; font-size: 15px; border-top: 2px solid #1f2937; padding-top: 8px; margin-top: 8px; }
      .note { margin-top: 16px; padding: 8px; background: #f9fafb; border-radius: 4px; font-size: 12px; }
      .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    </style>
  `;
}

function generatePurchaseInvoiceHtml(invoice: PurchaseInvoice): string {
	const itemsHtml = invoice.items
		.map(
			(item: InvoiceItem) => `
        <tr>
          <td class="item-name">${item.name}</td>
          <td class="text-center">${item.qty} ${item.unit}</td>
          <td class="text-right">${formatInvoiceCurrency(item.price)}</td>
          <td class="text-right">${formatInvoiceCurrency(item.subtotal)}</td>
        </tr>`,
		)
		.join("");

	return `
    <div class="invoice">
      <div class="invoice-header">
        <div class="header-left">
          ${invoice.company.logo ? `<img src="${invoice.company.logo}" alt="Logo" class="logo"/>` : ""}
          <div>
            <h1>${invoice.company.name}</h1>
            <p>${invoice.company.address}</p>
            <p>Telp: ${invoice.company.phone}</p>
          </div>
        </div>
        <div class="header-right">
          <h2>FAKTUR PEMBELIAN</h2>
          <p class="invoice-number">${invoice.invoiceNumber}</p>
        </div>
      </div>

      <div class="info-row">
        <div class="info-col">
          <p><strong>Tanggal:</strong> ${formatInvoiceDateTime(invoice.date)}</p>
          <p><strong>Supplier:</strong> ${invoice.supplierName}</p>
          <p><strong>Gudang:</strong> ${invoice.warehouseName}</p>
        </div>
        <div class="info-col">
          <p><strong>User:</strong> ${invoice.userName}</p>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Harga</th>
            <th class="text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row total">
          <span>Total</span>
          <span>${formatInvoiceCurrency(invoice.total)}</span>
        </div>
      </div>

      ${invoice.note ? `<div class="note"><strong>Catatan:</strong> ${invoice.note}</div>` : ""}

      <div class="footer">
        <p>Dicetak pada: ${formatInvoiceDateTime(invoice.createdAt)}</p>
      </div>
    </div>

    <style>
      .invoice { font-family: 'Inter', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1f2937; }
      .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px; }
      .header-left { display: flex; gap: 12px; align-items: center; }
      .header-left h1 { font-size: 18px; font-weight: 700; margin: 0; }
      .header-left p { font-size: 12px; color: #6b7280; margin: 2px 0; }
      .header-right { text-align: right; }
      .header-right h2 { font-size: 16px; font-weight: 700; margin: 0; text-transform: uppercase; }
      .invoice-number { font-size: 14px; font-family: monospace; color: #6b7280; }
      .logo { width: 64px; height: 64px; object-fit: contain; }
      .info-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; }
      .info-col p { margin: 4px 0; }
      .items-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
      .items-table th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
      .items-table td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
      .item-name { font-weight: 500; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .summary { margin-left: auto; width: 300px; font-size: 13px; }
      .summary-row { display: flex; justify-content: space-between; padding: 4px 0; }
      .total { font-weight: 700; font-size: 15px; border-top: 2px solid #1f2937; padding-top: 8px; margin-top: 8px; }
      .note { margin-top: 16px; padding: 8px; background: #f9fafb; border-radius: 4px; font-size: 12px; }
      .footer { margin-top: 24px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    </style>
  `;
}

/**
 * Generates the HTML string for printing an invoice.
 * Used by PrintService to open a print dialog.
 */
export function generateInvoicePrintHtml(invoice: Invoice): string {
	if (invoice.type === "SALES") {
		return generateSalesInvoiceHtml(invoice);
	}
	return generatePurchaseInvoiceHtml(invoice);
}
