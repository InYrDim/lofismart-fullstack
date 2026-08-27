import type { SellingProductDetail, SellingServiceDetail } from "@/types";
import { formatQty } from "@/utils/format";

function formatIDR(value: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(value);
}

function formatDateID(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function formatDateTimeID(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function getStatusLabel(isPaid: string): string {
	switch (isPaid) {
		case "1": return "Lunas";
		case "2": return "Hutang";
		case "3": return "DP";
		default: return "Belum Lunas";
	}
}

function renderProductTable(products: SellingProductDetail[]): string {
	if (products.length === 0) return "";

	const rows = products
		.map(
			(p) => `
      <tr>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb;">${p.stock_name || "-"}</td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${[p.grade, p.size].filter(Boolean).join(" / ") || "-"}
        </td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${p.qty}</td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${p.total_weight ? `${formatQty(p.total_weight)} kg` : "-"}
        </td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${formatIDR(p.price_value ?? p.mod_price)}
        </td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
          ${formatIDR(p.total_price)}
        </td>
      </tr>`,
		)
		.join("");

	const productTotal = products.reduce((s, p) => s + p.total_price, 0);
	const productQty = products.reduce((s, p) => s + p.qty, 0);
	const productWeight = products.reduce((s, p) => s + (p.total_weight || 0), 0);

	return `
    <div style="margin-bottom: 6px; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">PRODUK</div>
    <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Nama Produk</th>
          <th style="padding: 6px 8px; text-align: center; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Grade/Size</th>
          <th style="padding: 6px 8px; text-align: center; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Qty</th>
          <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Berat</th>
          <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Harga</th>
          <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="background: #f9fafb; font-weight: 700;">
          <td colspan="2" style="padding: 6px 8px; text-align: right; border-top: 2px solid #d1d5db;">Subtotal Produk</td>
          <td style="padding: 6px 8px; text-align: center; border-top: 2px solid #d1d5db;">${productQty}</td>
          <td style="padding: 6px 8px; text-align: right; border-top: 2px solid #d1d5db;">${formatQty(productWeight)} kg</td>
          <td style="padding: 6px 8px; border-top: 2px solid #d1d5db;"></td>
          <td style="padding: 6px 8px; text-align: right; border-top: 2px solid #d1d5db;">${formatIDR(productTotal)}</td>
        </tr>
      </tfoot>
    </table>`;
}

function renderServiceTable(services: SellingServiceDetail[]): string {
	if (services.length === 0) return "";

	const rows = services
		.map(
			(s) => `
      <tr>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb;">
          ${s.service_name || "Layanan"}
        </td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${s.qty}</td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatIDR(s.mod_price)}</td>
        <td style="padding: 4px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${formatIDR(s.total_price)}</td>
      </tr>`,
		)
		.join("");

	const serviceTotal = services.reduce((s, sv) => s + sv.total_price, 0);
	const serviceQty = services.reduce((s, sv) => s + sv.qty, 0);

	return `
    <div style="margin-bottom: 6px; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">LAYANAN</div>
    <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 8px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Layanan</th>
          <th style="padding: 6px 8px; text-align: center; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Qty</th>
          <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Harga</th>
          <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="background: #f9fafb; font-weight: 700;">
          <td style="padding: 6px 8px; text-align: right; border-top: 2px solid #d1d5db;" colspan="2">Subtotal Layanan</td>
          <td style="padding: 6px 8px; border-top: 2px solid #d1d5db;"></td>
          <td style="padding: 6px 8px; text-align: right; border-top: 2px solid #d1d5db;">${formatIDR(serviceTotal)}</td>
        </tr>
      </tfoot>
    </table>`;
}

function renderTransactionBlock(
	sellingId: string,
	products: SellingProductDetail[],
	services: SellingServiceDetail[],
): string {
	const sample = products[0] || services[0];
	if (!sample) return "";

	const productTotal = products.reduce((s, p) => s + p.total_price, 0);
	const serviceTotal = services.reduce((s, sv) => s + sv.total_price, 0);
	const blockTotal = productTotal + serviceTotal;

	const productQty = products.reduce((s, p) => s + p.qty, 0);
	const serviceQty = services.reduce((s, sv) => s + sv.qty, 0);
	const totalQty = productQty + serviceQty;

	const productWeight = products.reduce((s, p) => s + (p.total_weight || 0), 0);

	return `
    <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; margin-bottom: 16px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 2px solid #374151;">
        <div style="font-weight: 700; font-size: 13px; color: #111827;">
          #${sellingId}
        </div>
        <div style="font-size: 11px; color: #6b7280;">
          ${formatDateTimeID(sample.created_at)}
        </div>
      </div>
      <table style="width: 100%; font-size: 11px; margin-bottom: 8px; border-collapse: collapse;">
        <tr>
          <td style="padding: 2px 4px; color: #6b7280; width: 90px;">Kasir</td>
          <td style="padding: 2px 4px; font-weight: 500;">${sample.selling_user_name || "-"}</td>
          <td style="padding: 2px 4px; color: #6b7280; width: 80px;">Metode</td>
          <td style="padding: 2px 4px; font-weight: 500;">${sample.selling_payment_name || "-"}</td>
        </tr>
        <tr>
          <td style="padding: 2px 4px; color: #6b7280;">Status</td>
          <td style="padding: 2px 4px; font-weight: 500;">${getStatusLabel(sample.selling_is_paid)}</td>
          <td style="padding: 2px 4px; color: #6b7280;">Qty</td>
          <td style="padding: 2px 4px; font-weight: 500;">${totalQty} item</td>
        </tr>
        ${productWeight > 0 ? `
        <tr>
          <td style="padding: 2px 4px; color: #6b7280;">Berat</td>
          <td style="padding: 2px 4px; font-weight: 500;" colspan="3">${formatQty(productWeight)} kg</td>
        </tr>` : ""}
      </table>

      ${renderProductTable(products)}
      ${renderServiceTable(services)}

      <div style="text-align: right; font-size: 13px; font-weight: 700; color: #111827; padding-top: 8px; border-top: 2px solid #374151; margin-top: 8px;">
        Total Transaksi: ${formatIDR(blockTotal)}
      </div>
    </div>`;
}

export interface ReportPrintParams {
	products: SellingProductDetail[];
	services: SellingServiceDetail[];
	dateRange: string;
	marketName: string;
	userName: string;
	companyName: string;
	companyAddress?: string;
	companyPhone?: string;
	printDate: string;
}

function groupBySellingId<T extends { selling_id: string }>(
	items: T[],
): Map<string, T[]> {
	const map = new Map<string, T[]>();
	for (const item of items) {
		const existing = map.get(item.selling_id);
		if (existing) {
			existing.push(item);
		} else {
			map.set(item.selling_id, [item]);
		}
	}
	return map;
}

interface GrandTotals {
	totalTransactions: number;
	totalQty: number;
	totalWeight: number;
	totalRevenue: number;
}

function calculateGrandTotals(
	products: SellingProductDetail[],
	services: SellingServiceDetail[],
): GrandTotals {
	const allSellingIds = new Set([
		...products.map((p) => p.selling_id),
		...services.map((s) => s.selling_id),
	]);

	const totalQty =
		products.reduce((s, p) => s + p.qty, 0) +
		services.reduce((s, sv) => s + sv.qty, 0);

	const totalWeight = products.reduce((s, p) => s + (p.total_weight || 0), 0);

	const totalRevenue =
		products.reduce((s, p) => s + p.total_price, 0) +
		services.reduce((s, sv) => s + sv.total_price, 0);

	return {
		totalTransactions: allSellingIds.size,
		totalQty,
		totalWeight,
		totalRevenue,
	};
}

interface PaymentSummary {
	[method: string]: number;
}

function calculatePaymentSummary(
	products: SellingProductDetail[],
	services: SellingServiceDetail[],
): PaymentSummary {
	const summary: PaymentSummary = {};

	for (const p of products) {
		const method = p.selling_payment_name || "Unknown";
		summary[method] = (summary[method] || 0) + p.total_price;
	}

	for (const sv of services) {
		const method = sv.selling_payment_name || "Unknown";
		summary[method] = (summary[method] || 0) + sv.total_price;
	}

	return summary;
}

function renderPaymentSummary(summary: PaymentSummary, grandTotal: number): string {
	const entries = Object.entries(summary);
	if (entries.length === 0) return "";

	const rows = entries
		.map(
			([method, amount]) => `
      <tr>
        <td style="padding: 4px 12px; border-bottom: 1px solid #e5e7eb;">${method}</td>
        <td style="padding: 4px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${formatIDR(amount)}</td>
      </tr>`,
		)
		.join("");

	return `
    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 8px 0; padding-bottom: 6px; border-bottom: 2px solid #374151; text-transform: uppercase; letter-spacing: 0.5px;">
        Rincian Pembayaran
      </h3>
      <table style="width: 350px; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="padding: 6px 12px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Metode</th>
            <th style="padding: 6px 12px; text-align: right; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="background: #f9fafb; font-weight: 700;">
            <td style="padding: 6px 12px; border-top: 2px solid #374151;">Grand Total</td>
            <td style="padding: 6px 12px; text-align: right; border-top: 2px solid #374151;">${formatIDR(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>`;
}

function renderKPICards(totals: GrandTotals): string {
	return `
    <div style="display: flex; gap: 12px; margin-bottom: 24px;">
      <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 10px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Transaksi</div>
        <div style="font-size: 22px; font-weight: 800; color: #1d4ed8;">${totals.totalTransactions}</div>
      </div>
      <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 10px; color: #22c55e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Qty</div>
        <div style="font-size: 22px; font-weight: 800; color: #15803d;">${totals.totalQty} <span style="font-size: 12px; font-weight: 400;">items</span></div>
      </div>
      ${totals.totalWeight > 0 ? `
      <div style="flex: 1; background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 10px; color: #ca8a04; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Berat</div>
        <div style="font-size: 22px; font-weight: 800; color: #a16207;">${formatQty(totals.totalWeight)} <span style="font-size: 12px; font-weight: 400;">kg</span></div>
      </div>` : ""}
      <div style="flex: 1; background: #faf5ff; border: 1px solid #d8b4fe; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 10px; color: #a855f7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Revenue</div>
        <div style="font-size: 22px; font-weight: 800; color: #7e22ce;">${formatIDR(totals.totalRevenue)}</div>
      </div>
    </div>`;
}

export function generateReportHtml(params: ReportPrintParams): string {
	const { products, services, dateRange, marketName, userName, companyName, companyAddress, companyPhone, printDate } = params;

	const productGroups = groupBySellingId(products);
	const serviceGroups = groupBySellingId(services);

	const allSellingIds = new Set([
		...productGroups.keys(),
		...serviceGroups.keys(),
	]);

	const totals = calculateGrandTotals(products, services);
	const paymentSummary = calculatePaymentSummary(products, services);

	const transactionBlocks = Array.from(allSellingIds)
		.sort()
		.map((sellingId) => {
			const txProducts = productGroups.get(sellingId) || [];
			const txServices = serviceGroups.get(sellingId) || [];
			return renderTransactionBlock(sellingId, txProducts, txServices);
		})
		.join("");

	return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan Penjualan - ${dateRange}</title>
  <style>
    @page {
      margin: 15mm 20mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #111827;
      background: #fff;
      padding: 0;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-break { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="text-align: center; padding-bottom: 16px; border-bottom: 3px double #374151; margin-bottom: 20px;">
    <h1 style="font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin-bottom: 4px;">${companyName}</h1>
    ${companyAddress ? `<p style="font-size: 11px; color: #6b7280;">${companyAddress}</p>` : ""}
    ${companyPhone ? `<p style="font-size: 11px; color: #6b7280;">Telp: ${companyPhone}</p>` : ""}
  </div>

  <!-- Title -->
  <div style="text-align: center; margin-bottom: 20px;">
    <h2 style="font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #111827; margin-bottom: 4px;">Laporan Penjualan</h2>
    <p style="font-size: 12px; color: #6b7280; font-weight: 500;">Periode: ${dateRange}</p>
  </div>

  <!-- Info -->
  <table style="width: 100%; font-size: 11px; margin-bottom: 20px; border-collapse: collapse;">
    <tr>
      <td style="padding: 2px 8px; color: #6b7280; width: 100px;">Outlet</td>
      <td style="padding: 2px 8px; font-weight: 600;">${marketName}</td>
      <td style="padding: 2px 8px; color: #6b7280; width: 100px;">Dicetak oleh</td>
      <td style="padding: 2px 8px; font-weight: 600;">${userName}</td>
    </tr>
    <tr>
      <td style="padding: 2px 8px; color: #6b7280;">Tanggal Cetak</td>
      <td style="padding: 2px 8px; font-weight: 600;">${printDate}</td>
      <td style="padding: 2px 8px; color: #6b7280;"></td>
      <td style="padding: 2px 8px;"></td>
    </tr>
  </table>

  <!-- KPI Cards -->
  ${renderKPICards(totals)}

  <!-- Payment Summary -->
  ${renderPaymentSummary(paymentSummary, totals.totalRevenue)}

  <!-- Transaction Details -->
  <h3 style="font-size: 13px; font-weight: 700; color: #111827; margin: 0 0 12px 0; padding-bottom: 6px; border-bottom: 2px solid #374151; text-transform: uppercase; letter-spacing: 0.5px;">
    Rincian per Transaksi
  </h3>

  ${transactionBlocks}

  <!-- Grand Total Footer -->
  <div style="margin-top: 20px; padding-top: 12px; border-top: 3px double #374151;">
    <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
      <tr style="font-weight: 700;">
        <td style="padding: 4px 8px; text-align: right; width: 80%;">Grand Total Qty</td>
        <td style="padding: 4px 8px; text-align: right;">${totals.totalQty} items</td>
      </tr>
      ${totals.totalWeight > 0 ? `
      <tr style="font-weight: 700;">
        <td style="padding: 4px 8px; text-align: right;">Grand Total Berat</td>
        <td style="padding: 4px 8px; text-align: right;">${formatQty(totals.totalWeight)} kg</td>
      </tr>` : ""}
      <tr style="font-weight: 800; font-size: 15px;">
        <td style="padding: 8px 8px; text-align: right; border-top: 2px solid #111827;">Grand Total Revenue</td>
        <td style="padding: 8px 8px; text-align: right; border-top: 2px solid #111827; color: #1d4ed8;">${formatIDR(totals.totalRevenue)}</td>
      </tr>
    </table>
  </div>

  <!-- Signature Footer -->
  <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 60px;">Mengetahui,</p>
      <p style="border-top: 1px solid #111827; padding-top: 4px; display: inline-block;">(${userName})</p>
    </div>
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 60px;">Pencetak,</p>
      <p style="border-top: 1px solid #111827; padding-top: 4px; display: inline-block;">(${userName})</p>
    </div>
  </div>

  <div style="text-align: center; font-size: 10px; color: #9ca3af; margin-top: 20px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
    Dicetak pada: ${printDate}
  </div>

</body>
</html>`;
}
