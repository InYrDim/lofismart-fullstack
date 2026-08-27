var express = require("express");
var router = express.Router();

const webhookController = require("../controllers/webhookController");

// Xendit Webhook - NO authentication (uses callback token verification)
router.post("/xendit", webhookController.handleXenditWebhook);

module.exports = router;
