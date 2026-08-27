import { storage } from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface RequestOptions extends RequestInit {
	headers?: Record<string, string>;
}

class ApiClient {
	private async request<T>(
		endpoint: string,
		options: RequestOptions = {},
	): Promise<T> {
		const token = storage.getToken();
		const headers: Record<string, string> = { ...options.headers };

		if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
			headers["Content-Type"] = "application/json";
		}

		if (token && endpoint !== "/login") {
			headers["Authorization"] = token;
		}

		const config: RequestInit = {
			...options,
			headers,
		};

		try {
			const response = await fetch(`${BASE_URL}${endpoint}`, config);

			if (response.status === 401 && endpoint !== "/login") {
				storage.clear();
				window.location.href = "/"; // Force redirect to login
				throw new Error("Unauthorized");
			}

			// Some APIs might return empty body on success (e.g. 204)
			if (response.status === 204) {
				return {} as T;
			}

			const data = await response.json();

			if (!response.ok) {
				// Handle specific market error
				if (
					data.message === "User or Market not identifying. Please relogin." ||
					data.message?.includes("Market not identifying")
				) {
					window.location.href = "/settings?highlight=market";
					throw new Error("Silakan atur Market ID terlebih dahulu.");
				}

				throw new Error(data.message || "An error occurred");
			}

			return data;
		} catch (error) {
			// Detect connection refused / network errors (server unreachable)
			if (error instanceof TypeError && error.message === "Failed to fetch") {
				console.error(
					"ERR_CONNECTION_REFUSED: Server is not reachable at",
					BASE_URL,
				);
				throw new Error(
					"Tidak dapat terhubung ke server. Pastikan server sedang berjalan.",
				);
			}
			console.error("API Request Error:", error);
			throw error;
		}
	}

	get<T>(endpoint: string, headers?: Record<string, string>) {
		return this.request<T>(endpoint, { method: "GET", headers });
	}

	post<T>(endpoint: string, body: unknown, headers?: Record<string, string>) {
		const isFormData = body instanceof FormData;
		return this.request<T>(endpoint, {
			method: "POST",
			body: isFormData ? (body as FormData) : JSON.stringify(body),
			headers,
		});
	}

	put<T>(endpoint: string, body: unknown, headers?: Record<string, string>) {
		const isFormData = body instanceof FormData;
		return this.request<T>(endpoint, {
			method: "PUT",
			body: isFormData ? (body as FormData) : JSON.stringify(body),
			headers,
		});
	}

	patch<T>(endpoint: string, body: unknown, headers?: Record<string, string>) {
		const isFormData = body instanceof FormData;
		return this.request<T>(endpoint, {
			method: "PATCH",
			body: isFormData ? (body as FormData) : JSON.stringify(body),
			headers,
		});
	}

	delete<T>(endpoint: string, headers?: Record<string, string>) {
		return this.request<T>(endpoint, { method: "DELETE", headers });
	}
}

export const api = new ApiClient();
