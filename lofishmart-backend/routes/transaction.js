var express = require("express");
var router = express.Router();

const transactionController = require("../controllers/transactionController");

const auth = require("../middleware/auth");

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.redirect("/transaction/selling/list");
});

router.get(
	"/purchase/list",
	auth(["purchase"]),
	transactionController.purchaseList,
);
router.get(
	"/purchase/byid/:id",
	auth(["purchase"]),
	transactionController.purchaseById,
);
router.post(
	"/purchase/create",
	auth(["purchase-edit"]),
	transactionController.purchaseCreate,
);
router.patch(
	"/purchase/update/:id",
	auth(["purchase-edit"]),
	transactionController.purchaseUpdate,
);
router.delete(
	"/purchase/delete/:id",
	auth(["purchase-edit"]),
	transactionController.purchaseDelete,
);

// Selling Transaction
router.get(
	"/selling/list",
	auth(["selling", "purchase"]),
	transactionController.sellingList,
);
router.get(
	"/selling/byid/:id",
	auth(["selling", "purchase"]),
	transactionController.sellingById,
);
router.post(
	"/selling/create",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.createTransaction,
);
router.patch(
	"/selling/update/:id",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.sellingUpdate,
);
router.delete(
	"/selling/delete/:id",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.sellingDelete,
);

// Selling Product Detail
router.get(
	"/selling/product/detail/list",
	auth(["selling", "purchase"]),
	transactionController.sellingProductDetailList,
);
router.post(
	"/selling/product/detail/create",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.sellingProductDetailCreate,
);
router.patch(
	"/selling/product/detail/update/:id",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.sellingProductDetailUpdate,
);
router.delete(
	"/selling/product/detail/delete/:id",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.sellingProductDetailDelete,
);

// Selling Service Detail
router.get(
	"/selling/service/detail/list",
	auth(["selling", "purchase"]),
	transactionController.sellingServiceDetailList,
);
router.post(
	"/selling/service/detail/create",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.sellingServiceDetailCreate,
);
router.patch(
	"/selling/service/detail/update/:id",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.sellingServiceDetailUpdate,
);
router.delete(
	"/selling/service/detail/delete/:id",
	auth(["selling-edit", "purchase-edit"]),
	transactionController.sellingServiceDetailDelete,
);

module.exports = router;
