// Helper to get WS URL
const getWebSocketURL = () => {
	// If explicitly set in env (e.g. dev mode), use it
	if (import.meta.env.VITE_WEBSOCKET_URL) {
		return import.meta.env.VITE_WEBSOCKET_URL;
	}
	// Fallback to current host (for production/monolith where frontend is served by backend)
	const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

	const wsUrl = `${protocol}//${window.location.host}/ws/transaction`;

	console.log("WebSocket URL:", wsUrl);

	return wsUrl;
};

export const CONFIG = {
	QRIS_TIMEOUT_MINUTES: 1,
	WEBSOCKET_URL: getWebSocketURL(),
};
