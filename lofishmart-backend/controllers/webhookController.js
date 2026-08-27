const websocket = require("../websocket");
const AppDataSource = require("../config/data-source");
const Selling = require("../db/entities/Selling");

/**
 * Handle Xendit Webhook Callbacks
 * Endpoint: POST /webhook/xendit
 */
exports.handleXenditWebhook = async (req, res) => {
	try {
		// Verify callback token
		const callbackToken = req.headers["x-callback-token"];
		const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;

		if (!expectedToken) {
			console.error("Webhook: XENDIT_WEBHOOK_TOKEN not configured");
			return res.status(500).json({ message: "Server configuration error" });
		}

		if (callbackToken !== expectedToken) {
			console.warn("Webhook: Invalid callback token");
			return res.status(401).json({ message: "Unauthorized" });
		}

		const event = req.body;
		console.log("Webhook: Received Xendit event:", event.event || event.type);

		// Handle different event types
		const eventType = event.event || event.type;

		console.log("Webhook: Event type:", eventType);

		if (eventType === "qr.payment") {
			if (event.data.status === "SUCCEEDED") {
				await handlePaymentSuccess(event);
			} else if (event.data.status === "EXPIRED") {
				await handlePaymentExpired(event);
			}
		}

		// Always respond 200 to acknowledge receipt
		res.status(200).json({ received: true });
	} catch (err) {
		console.error("Webhook: Error processing:", err.message);
		// Still return 200 to prevent Xendit retries
		res.status(200).json({ received: true, error: err.message });
	}
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(event) {
	const data = event.data || event;
	const { reference_id, external_id, amount, status, qr_id } = data;

	// Xendit uses reference_id for transaction identifier
	const transactionId = reference_id || external_id;

	console.log(`Webhook: Payment success for ${transactionId}`);

	try {
		// Update transaction in database
		const repo = AppDataSource.getRepository(Selling);
		const transaction = await repo.findOne({
			where: { id: transactionId },
		});

		if (transaction) {
			transaction.is_paid = 3;
			await repo.save(transaction);
			console.log(`Webhook: Updated transaction ${transactionId} to paid`);
		} else {
			console.log(`Webhook: Transaction ${transactionId} not found`);
		}

		// Broadcast to WebSocket clients
		websocket.broadcast("payment.success", {
			reference_id: transactionId,
			amount,
			status: status || "PAID",
			qr_id,
		});
	} catch (err) {
		console.error("Webhook: Error updating transaction:", err.message);
	}
}

/**
 * Handle expired payment
 */
async function handlePaymentExpired(event) {
	const data = event.data || event;
	const { reference_id, external_id, qr_id } = data;

	const transactionId = reference_id || external_id;

	console.log(`Webhook: Payment expired for ${transactionId}`);

	// Broadcast to WebSocket clients
	websocket.broadcast("payment.expired", {
		reference_id: transactionId,
		status: "EXPIRED",
		qr_id,
	});
}
