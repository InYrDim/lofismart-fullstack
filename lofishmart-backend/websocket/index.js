const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const userController = require("../controllers/userController");

// Store connected clients
const clients = new Map();

let wss = null;

/**
 * Initialize WebSocket server attached to HTTP server
 * @param {http.Server} server - The HTTP server instance
 */
function init(server) {
	wss = new WebSocket.Server({ server, path: "/ws/transaction" });

	wss.on("connection", async (ws, req) => {
		console.log("WebSocket: New connection attempt");

		// Extract token from query string: ws://host?token=xxx
		const url = new URL(req.url, `http://${req.headers.host}`);
		const token = url.searchParams.get("token");

		console.log("WebSocket: Token:", token);

		if (!token) {
			ws.close(4001, "Token required");
			return;
		}

		try {
			// Authenticate using same logic as API
			const session = await userController.sessionById(token);
			if (!session) {
				ws.close(4001, "Invalid or expired session");
				return;
			}

			const decoded = jwt.verify(
				session.payload,
				process.env.JWT_SECRET || "secretKey123",
			);

			// Store client with user info
			const clientId = `${decoded.userId}_${Date.now()}`;
			clients.set(clientId, {
				ws,
				userId: decoded.userId,
				marketId: decoded.marketId,
				permissions: decoded.hasPermit || [],
			});

			console.log(`WebSocket: Client ${clientId} connected`);

			ws.on("message", (message) => {
				console.log(`WebSocket: Message from ${clientId}:`, message.toString());
			});

			ws.on("close", () => {
				clients.delete(clientId);
				console.log(`WebSocket: Client ${clientId} disconnected`);
			});

			ws.on("error", (err) => {
				console.error(`WebSocket: Error for ${clientId}:`, err.message);
				clients.delete(clientId);
			});

			// Send connection success
			ws.send(JSON.stringify({ type: "connected", clientId }));
		} catch (err) {
			console.error("WebSocket: Auth error:", err.message);
			ws.close(4001, "Authentication failed");
		}
	});

	console.log("✅ WebSocket server initialized");
}

/**
 * Broadcast message to all connected clients
 * @param {string} type - Event type
 * @param {object} data - Event data
 * @param {object} filter - Optional filter { marketId, userId }
 */
function broadcast(event, data, filter = {}) {
	const message = JSON.stringify({
		event,
		data,
		timestamp: new Date().toISOString(),
	});

	clients.forEach((client) => {
		// Apply filters if provided
		if (filter.marketId && client.marketId !== filter.marketId) return;
		if (filter.userId && client.userId !== filter.userId) return;

		if (client.ws.readyState === WebSocket.OPEN) {
			client.ws.send(message);
		}
	});
}

/**
 * Get count of connected clients
 */
function getClientCount() {
	return clients.size;
}

module.exports = {
	init,
	broadcast,
	getClientCount,
};
