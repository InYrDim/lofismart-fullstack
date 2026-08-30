import { toast } from "sonner";
import type { Invoice, SalesInvoice } from "@/types/invoice";
import { generateInvoicePrintHtml } from "./invoicePrintTemplate";
import { generateReceiptHtml } from "./receiptPrintTemplate";

export const PrintService = {
	/**
	 * Print a full-page invoice (A4/letter format).
	 */
	printInvoice: (invoice: Invoice) => {
		const html = generateInvoicePrintHtml(invoice);
		const title =
			invoice.type === "SALES"
				? `Faktur Penjualan - ${invoice.invoiceNumber}`
				: `Faktur Pembelian - ${invoice.invoiceNumber}`;
		PrintService._printFullPage(html, title);
	},

	printReceipt: (invoice: SalesInvoice) => {
		const html = generateReceiptHtml(invoice);
		
		const iframe = document.createElement("iframe");
		iframe.style.position = "absolute";
		iframe.style.width = "0";
		iframe.style.height = "0";
		iframe.style.border = "none";
		document.body.appendChild(iframe);

		const doc = iframe.contentWindow?.document;
		if (doc) {
			doc.open();
			doc.write(html);
			doc.close();

			iframe.contentWindow?.addEventListener("load", () => {
				setTimeout(() => {
					iframe.contentWindow?.focus();
					iframe.contentWindow?.print();
					setTimeout(() => {
						document.body.removeChild(iframe);
					}, 1000);
				}, 300);
			});
		} else {
			toast.error("Gagal membuat frame cetak.");
			document.body.removeChild(iframe);
		}
	},

	/**
	 * Print a report (full-page format with inline styles).
	 */
	printReport: (htmlContent: string, title: string) => {
		const win = window.open("", "_blank", "width=800,height=600");
		if (!win) {
			toast.error("Please allow popups for this website");
			return;
		}

		win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { margin: 15mm 20mm; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
		win.document.close();
	},

	/**
	 * Internal: print to a new window with full-page styling.
	 */
	_printFullPage: (content: string, title: string) => {
		const win = window.open("", "_blank", "width=800,height=600");
		if (!win) {
			toast.error("Please allow popups for this website");
			return;
		}

		const styles = Array.from(
			document.querySelectorAll('style, link[rel="stylesheet"]'),
		)
			.map((node) => node.outerHTML)
			.join("");

		win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          ${styles}
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
              @page { margin: 1cm; size: auto; }
            }
            body { background: white; padding: 20px; }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
		win.document.close();
	},
};
