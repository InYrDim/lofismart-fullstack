import type { SalesInvoice, InvoiceItem } from "@/types/invoice";
import { formatInvoiceCurrency, formatInvoiceDateTime } from "../invoice";

function generateReceiptItemsSection(items: InvoiceItem[], label: string): string {
	if (items.length === 0) {
		return `<div class="section-label">${label}: &mdash;</div>`;
	}

	const rows = items
		.map(
			(item) => `
    <tr>
      <td class="name" colspan="2">${item.name}${item.grade ? ` (${item.grade})` : ""}</td>
    </tr>
    <tr>
      <td style="padding-left: 2px;">
        ${item.qty} ${item.unit === "KG" ? "KG" : "PCS"} ${item.discount > 0 ? `(disc ${formatInvoiceCurrency(item.discount).replace("Rp", "")})` : ""}
      </td>
      <td style="text-align: right;">
        ${formatInvoiceCurrency(item.subtotal).replace("Rp", "")}
      </td>
    </tr>`,
		)
		.join("");

	return `<div class="section-label">${label}</div>
  <table class="items">
    ${rows}
  </table>`;
}

/**
 * Generate an HTML receipt optimized for 58mm thermal printers.
 * Uses monospace font, minimal padding, and compact layout.
 */
export function generateReceiptHtml(invoice: SalesInvoice): string {
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Struk - ${invoice.invoiceNumber}</title>
  <style>
    @page {
      width: 58mm;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Courier New', 'Consolas', monospace;
      font-size: 10px;
      line-height: 1.3;
      width: 58mm;
      padding: 4mm 3mm;
      color: #000;
    }
    .center {
      text-align: center;
    }
    .bold {
      font-weight: bold;
    }
    .header {
      margin-bottom: 4px;
    }
    .header h1 {
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header .info {
      font-size: 9px;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 4px 0;
    }
    .divider-solid {
      border-top: 1px solid #000;
      margin: 4px 0;
    }
    table.items {
      width: 100%;
      font-size: 10px;
    }
    table.items td {
      vertical-align: top;
    }
    table.items .name {
      max-width: 52mm;
      overflow: hidden;
      white-space: nowrap;
    }
    table.items .qty {
      text-align: right;
      padding-right: 2px;
    }
    table.items .price {
      text-align: right;
      padding-right: 2px;
    }
    table.items .subtotal {
      text-align: right;
    }
    .summary {
      width: 100%;
      font-size: 10px;
    }
    .summary td {
      padding: 1px 0;
    }
    .summary .label {
      text-align: left;
    }
    .summary .value {
      text-align: right;
    }
    .summary .total td {
      font-weight: bold;
      font-size: 12px;
    }
    .section-label {
      font-size: 9px;
      font-weight: bold;
      margin-top: 2px;
      margin-bottom: 1px;
    }
    .footer {
      text-align: center;
      font-size: 9px;
      margin-top: 4px;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header center">
    <h1>${invoice.company.name}</h1>
    ${invoice.company.address ? `<div class="info">${invoice.company.address}</div>` : ""}
    ${invoice.company.phone ? `<div class="info">Telp: ${invoice.company.phone}</div>` : ""}
  </div>

  <div class="divider"></div>

  <div class="header">
    <div class="info">
      ${formatInvoiceDateTime(invoice.date)}<br>
      Kasir: ${invoice.cashierName}
    </div>
    <div class="info bold">
      No: ${invoice.invoiceNumber}
    </div>
    ${invoice.customerName !== "Umum" ? `<div class="info">Pel: ${invoice.customerName}</div>` : ""}
  </div>

  <div class="divider-solid"></div>

  ${generateReceiptItemsSection(invoice.items.filter((i) => i.type !== "SERVICE"), "PRODUK")}
  ${generateReceiptItemsSection(invoice.items.filter((i) => i.type === "SERVICE"), "LAYANAN")}

  <div class="divider"></div>

  <table class="summary">
    <tr>
      <td class="label">Subtotal</td>
      <td class="value">${formatInvoiceCurrency(invoice.subtotal).replace("Rp", "")}</td>
    </tr>
    ${invoice.itemDiscount > 0 ? `
    <tr>
      <td class="label">Diskon Item</td>
      <td class="value">(${formatInvoiceCurrency(invoice.itemDiscount).replace("Rp", "")})</td>
    </tr>` : ""}
    ${invoice.voucherDiscount > 0 ? `
    <tr>
      <td class="label">Diskon Voucher</td>
      <td class="value">(${formatInvoiceCurrency(invoice.voucherDiscount).replace("Rp", "")})</td>
    </tr>` : ""}
    ${invoice.tax > 0 ? `
    <tr>
      <td class="label">Pajak</td>
      <td class="value">${formatInvoiceCurrency(invoice.tax).replace("Rp", "")}</td>
    </tr>` : ""}
    <tr class="total">
      <td class="label">TOTAL</td>
      <td class="value">${formatInvoiceCurrency(invoice.total).replace("Rp", "")}</td>
    </tr>
    <tr>
      <td class="label">Tunai</td>
      <td class="value">${formatInvoiceCurrency(invoice.payedMoney).replace("Rp", "")}</td>
    </tr>
    <tr>
      <td class="label">Kembali</td>
      <td class="value">${formatInvoiceCurrency(invoice.changeMoney).replace("Rp", "")}</td>
    </tr>
    <tr>
      <td class="label">Pembayaran</td>
      <td class="value">${invoice.paymentMethod}</td>
    </tr>
  </table>

  <div class="divider-solid"></div>

  <div class="footer">
    <p>Terima kasih telah berbelanja</p>
    <p>Barang yang sudah dibeli tidak dapat</p>
    <p>dikembalikan atau ditukar</p>
    <p style="margin-top: 2px;">${formatInvoiceDateTime(invoice.createdAt)}</p>
  </div>
  <script>
    window.onload = () => {
      setTimeout(() => { window.print(); window.close(); }, 300);
    };
  </script>
</body>
</html>`;
}
