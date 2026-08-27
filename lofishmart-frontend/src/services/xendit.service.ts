import { CONFIG } from "@/config";

export const XenditService = {
	generateReferenceId: () => {
		return `order-${Date.now()}-${Math.random()
			.toString(36)
			.substring(2, 6)
			.toUpperCase()}`;
	},
	createQRCode: async (
		amount: number,
		referenceId: string,
		expiresAt?: string,
	) => {
		// The API key is now handled by the server-side proxy
		// const apiKey = import.meta.env.VITE_XENDIT_SECRET_KEY;

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const body: any = {
				reference_id: referenceId,
				type: "DYNAMIC",
				currency: "IDR",
				amount: amount,
			};

			body.expires_at = new Date(
				Date.now() + CONFIG.QRIS_TIMEOUT_MINUTES * 60 * 1000,
			).toISOString();

			if (expiresAt) {
				body.expires_at = expiresAt;
			}

			const headers = new Headers();
			headers.append("Content-Type", "application/json");
			headers.append("api-version", "2022-07-31");

			console.log(import.meta.env.DEV);

			// if development
			if (import.meta.env.DEV) {
				const basicAuth = btoa(import.meta.env.VITE_XENDIT_SECRET_KEY + ":");
				headers.append("Authorization", `Basic ${basicAuth}`);
			}

			const options = {
				method: "POST",
				headers: headers,
				body: JSON.stringify(body),
			};

			const response = await fetch("/xendit-api/qr_codes", options);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.message || `Xendit Error: ${response.statusText}`,
				);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			if (error instanceof TypeError && error.message === "Failed to fetch") {
				console.error("ERR_CONNECTION_REFUSED: Server is not reachable");
				throw new Error(
					"Tidak dapat terhubung ke server. Pastikan server sedang berjalan.",
				);
			}
			console.error("Failed to generate QR Code:", error);
			throw error;
		}
	},
	getQRCode: async (id: string) => {
		try {
			const headers = new Headers();
			headers.append("Content-Type", "application/json");
			headers.append("api-version", "2022-07-31");

			if (import.meta.env.DEV) {
				const basicAuth = btoa(import.meta.env.VITE_XENDIT_SECRET_KEY + ":");
				headers.append("Authorization", `Basic ${basicAuth}`);
			}

			const response = await fetch(`/xendit-api/qr_codes/${id}`, {
				method: "GET",
				headers: headers,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.message || `Xendit Error: ${response.statusText}`,
				);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			if (error instanceof TypeError && error.message === "Failed to fetch") {
				console.error("ERR_CONNECTION_REFUSED: Server is not reachable");
				throw new Error(
					"Tidak dapat terhubung ke server. Pastikan server sedang berjalan.",
				);
			}
			console.error("Failed to get QR Code:", error);
			throw error;
		}
	},
};
