import type { Transaction, SellingProductDetail, SellingServiceDetail } from "@/types";
import { PrintService, generateReportHtml } from "@/lib/print";

export const ReportService = {
	/**
	 * Generates HTML for Sales Recap and triggers print.
	 */
	printSalesRecap: (
		transactions: Transaction[],
		dateRange: string,
		marketName: string,
		userName: string,
	) => {
		const totalSales = transactions.reduce((sum, t) => sum + t.total_price, 0);
		const totalTransactions = transactions.length;
		const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;
		const paidCount = transactions.filter((t) => t.is_paid === "1").length;
		const unpaidCount = transactions.filter((t) => t.is_paid === "2").length;

		const formatCurrency = (val: number) =>
			new Intl.NumberFormat("id-ID", {
				style: "currency",
				currency: "IDR",
				minimumFractionDigits: 0,
			}).format(val);

		const paymentSummary = transactions.reduce(
			(acc, t) => {
				const method = t.payment_method || "Unknown";
				if (!acc[method]) acc[method] = 0;
				acc[method] += t.total_price;
				return acc;
			},
			{} as Record<string, number>,
		);

		const paymentRows = Object.entries(paymentSummary)
			.map(
				([method, amount]) => `
        <tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">${method}</td>
          <td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827;">${formatCurrency(amount)}</td>
        </tr>`,
			)
			.join("");

		const transactionRows = transactions
			.map(
				(t) => `
        <tr>
          <td style="padding: 5px 8px; border-bottom: 1px solid #f3f4f6; font-family: 'Courier New', monospace; font-size: 10px; color: #2563eb;">${t.code}</td>
          <td style="padding: 5px 8px; border-bottom: 1px solid #f3f4f6; font-size: 11px; color: #6b7280;">${new Date(t.transaction_date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}<br><span style="font-size: 10px;">${new Date(t.transaction_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span></td>
          <td style="padding: 5px 8px; border-bottom: 1px solid #f3f4f6; font-size: 11px; color: #374151;">${t.customer_name || "Umum"}</td>
          <td style="padding: 5px 8px; border-bottom: 1px solid #f3f4f6; font-size: 11px; color: #374151;">${t.cashier_name || "-"}</td>
          <td style="padding: 5px 8px; border-bottom: 1px solid #f3f4f6; font-size: 11px; color: #374151;">${t.payment_method || "-"}</td>
          <td style="padding: 5px 8px; border-bottom: 1px solid #f3f4f6; font-size: 11px; text-align: right; font-weight: 600; color: #111827;">${formatCurrency(t.total_price)}</td>
        </tr>`,
			)
			.join("");

		const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Rekap Penjualan - ${dateRange}</title>
  <style>
    @page { margin: 15mm 20mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #111827;
      background: #fff;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="text-align: center; padding-bottom: 14px;">
    <h1 style="font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #111827; margin-bottom: 4px;">Lofish Mart</h1>
    <h2 style="font-size: 14px; font-weight: 700; color: #374151; margin-bottom: 6px;">Rekap Penjualan</h2>
    <table style="margin: 0 auto; font-size: 11px; color: #6b7280; border-collapse: collapse;">
      <tr>
        <td style="padding: 1px 8px; text-align: right; color: #9ca3af;">Outlet</td>
        <td style="padding: 1px 8px; font-weight: 600; color: #374151;">${marketName}</td>
        <td style="padding: 1px 16px; text-align: right; color: #9ca3af;">Periode</td>
        <td style="padding: 1px 8px; font-weight: 600; color: #374151;">${dateRange}</td>
      </tr>
      <tr>
        <td style="padding: 1px 8px; text-align: right; color: #9ca3af;">Dicetak</td>
        <td style="padding: 1px 8px; font-weight: 600; color: #374151;">${userName}</td>
        <td style="padding: 1px 16px; text-align: right; color: #9ca3af;">Tgl Cetak</td>
        <td style="padding: 1px 8px; font-weight: 600; color: #374151;">${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
      </tr>
    </table>
  </div>

  <hr style="border: none; border-top: 2px solid #374151; margin: 14px 0;">

  <!-- KPI Cards -->
  <div style="display: flex; gap: 10px; margin-bottom: 18px;">
    <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; text-align: center;">
      <div style="font-size: 9px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Transaksi</div>
      <div style="font-size: 20px; font-weight: 800; color: #1d4ed8;">${totalTransactions}</div>
    </div>
    <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; text-align: center;">
      <div style="font-size: 9px; color: #22c55e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Lunas</div>
      <div style="font-size: 20px; font-weight: 800; color: #15803d;">${paidCount}</div>
    </div>
    <div style="flex: 1; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; text-align: center;">
      <div style="font-size: 9px; color: #ef4444; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Hutang</div>
      <div style="font-size: 20px; font-weight: 800; color: #b91c1c;">${unpaidCount}</div>
    </div>
    <div style="flex: 1; background: #faf5ff; border: 1px solid #d8b4fe; border-radius: 8px; padding: 12px; text-align: center;">
      <div style="font-size: 9px; color: #a855f7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Revenue</div>
      <div style="font-size: 20px; font-weight: 800; color: #7e22ce;">${formatCurrency(totalSales)}</div>
    </div>
  </div>

  <hr style="border: none; border-top: 1px solid #d1d5db; margin: 14px 0;">

  <!-- Payment Summary -->
  <div style="margin-bottom: 18px;">
    <h3 style="font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Rincian Pembayaran</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 6px 12px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Metode</th>
          <th style="padding: 6px 12px; text-align: right; border-bottom: 2px solid #d1d5db; font-size: 10px; text-transform: uppercase; color: #6b7280;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${paymentRows}
      </tbody>
      <tfoot>
        <tr style="background: #f9fafb; font-weight: 700;">
          <td style="padding: 8px 12px; border-top: 2px solid #374151; color: #111827;">Grand Total</td>
          <td style="padding: 8px 12px; text-align: right; border-top: 2px solid #374151; color: #1d4ed8;">${formatCurrency(totalSales)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Stats -->
  <div style="margin-bottom: 18px;">
    <table style="width: auto; font-size: 11px; border-collapse: collapse;">
      <tr>
        <td style="padding: 2px 16px 2px 0; color: #6b7280;">Rata-rata per Transaksi</td>
        <td style="padding: 2px 0; font-weight: 600;">${formatCurrency(Math.round(avgTransaction))}</td>
      </tr>
    </table>
  </div>

  <hr style="border: none; border-top: 1px solid #d1d5db; margin: 14px 0;">

  <!-- Transactions -->
  <div style="margin-bottom: 18px;">
    <h3 style="font-size: 12px; font-weight: 700; color: #111827; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Daftar Transaksi</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
      <thead>
        <tr style="background: #f3f4f6;">
          <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 9px; text-transform: uppercase; color: #6b7280;">Kode</th>
          <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 9px; text-transform: uppercase; color: #6b7280;">Tgl</th>
          <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 9px; text-transform: uppercase; color: #6b7280;">Pelanggan</th>
          <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 9px; text-transform: uppercase; color: #6b7280;">Kasir</th>
          <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #d1d5db; font-size: 9px; text-transform: uppercase; color: #6b7280;">Metode</th>
          <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #d1d5db; font-size: 9px; text-transform: uppercase; color: #6b7280;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${transactionRows}
      </tbody>
    </table>
  </div>

  <hr style="border: none; border-top: 2px solid #374151; margin: 14px 0;">

  <!-- Signature -->
  <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px;">
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 50px;">Mengetahui,</p>
      <p style="border-top: 1px solid #111827; padding-top: 4px; display: inline-block;">( __________ )</p>
    </div>
    <div style="text-align: center; width: 45%;">
      <p style="margin-bottom: 50px;">Pencetak,</p>
      <p style="border-top: 1px solid #111827; padding-top: 4px; display: inline-block;">(${userName})</p>
    </div>
  </div>

  <div style="text-align: center; font-size: 10px; color: #9ca3af; margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
    Dicetak pada: ${new Date().toLocaleString("id-ID")}
  </div>

</body>
</html>`;

		PrintService.printReport(htmlContent, `Rekap Penjualan - ${dateRange}`);
	},

	/**
	 * Generates a comprehensive sales report with per-transaction product & service details.
	 */
	printComprehensiveReport: (
		products: SellingProductDetail[],
		services: SellingServiceDetail[],
		params: {
			dateRange: string;
			marketName: string;
			userName: string;
			companyName?: string;
			companyAddress?: string;
			companyPhone?: string;
		},
	) => {
		const html = generateReportHtml({
			products,
			services,
			dateRange: params.dateRange,
			marketName: params.marketName,
			userName: params.userName,
			companyName: params.companyName || "Lofish Mart",
			companyAddress: params.companyAddress,
			companyPhone: params.companyPhone,
			printDate: new Date().toLocaleString("id-ID", {
				day: "2-digit",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}),
		});

		PrintService.printReport(html, `Laporan Penjualan - ${params.dateRange}`);
	},
};
