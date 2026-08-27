const AppDataSource = require("../config/data-source");

// Entities / Model
const Selling = require("../db/entities/Selling");
const SellingProductDetail = require("../db/entities/SellingProductDetail");
const SellingServiceDetail = require("../db/entities/SellingServiceDetail");
const CashDrawer = require("../db/entities/CashDrawer");
const PaymentMethod = require("../db/entities/PeymentMethod");
const WeightScale = require("../db/entities/WeightScale");
const Voucher = require("../db/entities/Voucher");
const Purchase = require("../db/entities/Purchase");
const ChartItem = require("../db/entities/CartItem");
const Stock = require("../db/entities/Stock");
const Price = require("../db/entities/Price");

const generateId = require("../middleware/generateId");

async function findAndReduceStock(
	queryRunner,
	priceId,
	stockId,
	marketId,
	qty,
) {
	if (qty <= 0) return true;

	if (priceId) {
		const price = await queryRunner.manager.findOne(Price, {
			where: { id: priceId },
			relations: ["product"],
		});

		if (price && price.product && price.product.is_non_stock === "2") {
			return true;
		}
	}

	let targetProductId = null;
	let stocks = [];

	if (stockId) {
		const stockRecord = await queryRunner.manager.findOne(Stock, {
			where: { id: stockId },
		});
		if (stockRecord) {
			stocks = [stockRecord];
		}
	}

	if (stocks.length === 0 && priceId) {
		const price = await queryRunner.manager.findOne(Price, {
			where: { id: priceId },
			relations: ["product"],
		});

		if (price && price.product) {
			targetProductId = price.product.id;

			stocks = await queryRunner.manager.find(Stock, {
				where: [
					{ product: { id: targetProductId }, market: { id: marketId } },
					{ product: { id: targetProductId }, warehouse: { id: marketId } },
				],
				order: { qty: "DESC" },
			});
		}
	}

	if (stocks.length === 0) {
		throw new Error(`Stok tidak ditemukan untuk produk`);
	}

	const totalAvailable = stocks.reduce((sum, s) => sum + s.qty, 0);
	if (totalAvailable < qty) {
		throw new Error(
			`Stok tidak cukup. Tersedia: ${totalAvailable}, Dibutuhkan: ${qty}`,
		);
	}

	let remainingQty = qty;
	for (const stock of stocks) {
		if (remainingQty <= 0) break;

		const deductQty = Math.min(stock.qty, remainingQty);
		stock.qty = stock.qty - deductQty;
		remainingQty = remainingQty - deductQty;

		await queryRunner.manager.save(Stock, stock);
	}

	return remainingQty === 0;
}

async function reduceStockForSelling(queryRunner, sellingId, marketId) {
	const details = await queryRunner.manager.find(SellingProductDetail, {
		where: { selling: { id: sellingId } },
		relations: ["price", "stock"],
	});

	for (const detail of details) {
		await findAndReduceStock(
			queryRunner,
			detail.price?.id,
			detail.stock?.id,
			marketId,
			detail.qty,
		);
	}
}

// Selling
exports.createTransaction = async (req, res) => {
	const queryRunner = AppDataSource.createQueryRunner();

	await queryRunner.connect();
	await queryRunner.startTransaction();

	try {
		const {
			date,
			total_price,
			payed_money,
			change_money,
			is_paid,
			payment_method_id,
			market_id,
			user_id,
			items, // Array of { stock_id, qty, price, total_price, note }
			// New fields
			payment_id,
			total_weight_qty,
			totol_pcs_qty,
			price,
			per_item_disc,
			voucher_disc,
			total_disc,
			tax_price,
			online_order,
			note,
			member_id,
			voucher_id,
		} = req.body;

		const parsedItems = JSON.parse(items);

		if (
			!parsedItems ||
			!Array.isArray(parsedItems) ||
			parsedItems.length === 0
		) {
			return res
				.status(400)
				.json({ message: "Transaction must include at least one item." });
		}

		// 1. Create Selling (Header)
		const sellingId = generateId(20);
		const sellingData = {
			id: sellingId,
			date,
			total_price,
			payed_money,
			change_money,
			is_paid,
			payment: payment_method_id, // Relation
			market: market_id, // Relation
			user: user_id, // Relation
			// New fields
			payment_id,
			total_weight_qty,
			totol_pcs_qty,
			price,
			per_item_disc,
			voucher_disc,
			total_disc,
			tax_price,
			online_order,
			note,
			member: member_id, // Relation
			voucher: voucher_id, // Relation
		};

		// Create and save selling within transaction
		const selling = queryRunner.manager.create(Selling, sellingData);
		await queryRunner.manager.save(Selling, selling);

		// 2. Process Items
		if (parsedItems && parsedItems.length > 0) {
			for (const item of parsedItems) {
				const detailId = generateId(24);

				const isServiceItem = item.type === "SERVICE" || item.service_id;

				if (isServiceItem) {
					// a. Create SellingServiceDetail untuk item layanan
					const detailData = {
						id: detailId,
						selling: sellingId,
						service: item.service_id || item.price_id,
						qty: item.qty,
						mod_price: item.mod_price,
						total_price: item.total_price,
						note: item.note,
					};

					const detail = queryRunner.manager.create(
						SellingServiceDetail,
						detailData,
					);
					await queryRunner.manager.save(SellingServiceDetail, detail);
				} else {
					// a. Create SellingProductDetail untuk produk fisik
					const detailData = {
						id: detailId,
						selling: sellingId,
						stock: item.stock || item.stock_id,
						price: item.price || item.price_id,
						qty: item.qty,
						mod_price: item.mod_price,
						total_price: item.total_price,
						note: item.note,
						total_weight: item.total_weight,
					};

					const detail = queryRunner.manager.create(
						SellingProductDetail,
						detailData,
					);
					await queryRunner.manager.save(SellingProductDetail, detail);
				}
			}
		}

		// 3. Kurangi stock HANYA jika transaksi langsung PAID (is_paid = "3")
		// Untuk QRIS/delayed payment, stock dikurangi nanti ketika is_paid diupdate menjadi "3"
		if (is_paid === "3") {
			await reduceStockForSelling(queryRunner, sellingId, market_id);
		}

		await queryRunner.commitTransaction();

		return res.status(201).json({
			message: "Transaction created successfully",
			data: selling,
		});
	} catch (err) {
		if (err instanceof SyntaxError) {
			return res
				.status(400)
				.json({ message: "Transaction must include at least one item." });
		}

		await queryRunner.rollbackTransaction();
		console.error(err);
		res.status(500).json({ message: err.message });
	} finally {
		await queryRunner.release();
	}
};

exports.sellingList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Selling);
		const detailRepo = AppDataSource.getRepository(SellingProductDetail);

		let {
			page = 1,
			limit = 20,
			start_date,
			end_date,
			is_paid,
			user_id,
			market_id,
		} = req.query;

		// Scoped user check (SPVR / KSR)
		const userRole = req.user?.role?.id || req.user?.role;
		const isSPVR = userRole === 'SPVR';
		const isKSR = userRole === 'KSR';
		if (isSPVR || isKSR) {
			if (!req.user.market_id) {
				return res.status(403).json({ message: `Forbidden: Market ID is required for ${userRole} role.` });
			}
			market_id = req.user.market_id;
		}

		let query = repo
			.createQueryBuilder("selling")
			.leftJoinAndSelect("selling.user", "user")
			.leftJoinAndSelect("selling.market", "market")
			.leftJoinAndSelect("selling.payment", "payment")
			.leftJoinAndSelect("selling.member", "member")
			.leftJoinAndSelect("selling.voucher", "voucher")
			.orderBy("selling.created_at", "DESC");
			
		// ✅ FIX: Tambahkan waktu untuk mencakup seluruh hari
		if (start_date) {
			query = query.andWhere("DATE(selling.created_at) >= :start_date", {
				start_date,
			});
		}
		if (end_date) {
			// ✅ Ubah <= menjadi DATE() comparison atau tambahkan 23:59:59
			query = query.andWhere("DATE(selling.created_at) <= :end_date", {
				end_date,
			});
		}

		if (is_paid) {
			query = query.andWhere("selling.is_paid = :is_paid", { is_paid });
		}
		if (user_id) {
			query = query.andWhere("selling.user_id = :user_id", { user_id });
		}
		if (market_id) {
			query = query.andWhere("selling.market_id = :market_id", { market_id });
		}

		const skip = (page - 1) * limit;
		query = query.skip(skip).take(parseInt(limit));

		const total = await query.getCount();
		const transactions = await query.getMany();

		const transactionsWithItems = await Promise.all(
			transactions.map(async (transaction) => {
				const items = await detailRepo.find({
					where: { selling: { id: transaction.id } },
					relations: ["stock", "price"],
				});
				return {
					...transaction,
					items,
				};
			}),
		);

		res.json({
			data: transactionsWithItems,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.sellingCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Selling);
		const data = repo.create(req.body);
		await repo.save(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.sellingById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Selling);
		const detailRepo = AppDataSource.getRepository(SellingProductDetail);
		const id = req.params.id;

		// Get transaction with relations
		const transaction = await repo.findOne({
			where: { id },
			relations: ["user", "market", "payment", "member", "voucher"],
		});

		if (!transaction) {
			return res.status(404).json({ message: "Transaction not found" });
		}

		// Get items
		const items = await detailRepo.find({
			where: { selling: { id } },
			relations: ["stock", "price"],
		});

		res.json({
			...transaction,
			items,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.sellingUpdate = async (req, res) => {
	const queryRunner = AppDataSource.createQueryRunner();

	try {
		await queryRunner.connect();
		await queryRunner.startTransaction();

		const repo = queryRunner.manager.getRepository(Selling);
		const id = req.params.id;
		const newIsPaid = req.body.is_paid;

		// 1. Find existing with market relation
		const existing = await repo.findOne({
			where: { id },
			relations: ["market"],
		});

		if (!existing) {
			await queryRunner.rollbackTransaction();
			return res.status(404).json({ message: "Data not found" });
		}

		const oldIsPaid = existing.is_paid;
		const marketId = existing.market?.id;

		// 2. Merge request body to entity
		repo.merge(existing, req.body);

		// 3. Save the updated entity
		const updated = await repo.save(existing);

		// 4. Jika transisi dari non-"3" ke "3", kurangi stock
		// (artinya pembayaran baru saja selesai/berhasil)
		if (newIsPaid === "3" && oldIsPaid !== "3" && marketId) {
			await reduceStockForSelling(queryRunner, id, marketId);
		}

		await queryRunner.commitTransaction();
		res.json(updated);
	} catch (err) {
		await queryRunner.rollbackTransaction();
		console.error(err);
		res.status(500).json({ message: err.message });
	} finally {
		await queryRunner.release();
	}
};

exports.sellingDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Selling);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.sellingSoftDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Selling);
		const result = await repo.softDelete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data soft-deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// SellingProductDetail
exports.sellingProductDetailList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(SellingProductDetail);
		let { selling_id, market_id, user_id, stock_id, price_id, start_date, end_date } = req.query;

		// Scoped user check (SPVR)
		const isSPVR = req.user?.role?.id === 'SPVR' || req.user?.role === 'SPVR';
		if (isSPVR) {
			if (!req.user.market_id) {
				return res.status(403).json({ message: "Forbidden: Market ID is required for SPVR role." });
			}
			market_id = req.user.market_id;
		}

		let query = repo
			.createQueryBuilder("detail")
			.leftJoinAndSelect("detail.selling", "selling")
			.leftJoinAndSelect("detail.stock", "stock")
			.leftJoinAndSelect("detail.price", "price")
			.leftJoinAndSelect("price.grade", "grade")
			.leftJoinAndSelect("price.product", "product")
			.leftJoinAndSelect("price.size", "size")
			.orderBy("detail.created_at", "DESC");

		if (selling_id) {
			query = query.andWhere("selling.id = :selling_id", { selling_id });
		}
		if (market_id) {
			query = query.andWhere("selling.market_id = :market_id", { market_id });
		}
		if (user_id) {
			query = query.andWhere("selling.user_id = :user_id", { user_id });
		}
		if (stock_id) {
			query = query.andWhere("detail.stock_id = :stock_id", { stock_id });
		}
		if (price_id) {
			query = query.andWhere("detail.price_id = :price_id", { price_id });
		}
		if (start_date) {
			query = query.andWhere("selling.created_at >= :start_date", { start_date });
		}
		if (end_date) {
			query = query.andWhere("selling.created_at <= :end_date", { end_date });
		}



		const data = await query.getMany();

		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.sellingProductDetailCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(SellingProductDetail);
		const data = repo.create(req.body);
		await repo.save(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.sellingProductDetailUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(SellingProductDetail);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		repo.merge(data, req.body);

		// 3. Save the updated entity
		const updated = await repo.save(data);

		res.json(updated);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.sellingProductDetailDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(SellingProductDetail);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// SellingServiceDetail
exports.sellingServiceDetailList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(SellingServiceDetail);
		const data = await repo.find();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.sellingServiceDetailCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(SellingServiceDetail);
		const data = repo.create(req.body);
		await repo.save(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.sellingServiceDetailUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(SellingServiceDetail);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		repo.merge(data, req.body);

		// 3. Save the updated entity
		const updated = await repo.save(data);

		res.json(updated);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.sellingServiceDetailDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(SellingServiceDetail);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// CashDrawer
exports.cashDrawerList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(CashDrawer);
		const data = await repo.find();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.cashDrawerCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(CashDrawer);
		const data = repo.create(req.body);
		await repo.save(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.cashDrawerUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(CashDrawer);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		repo.merge(data, req.body);

		// 3. Save the updated entity
		const updated = await repo.save(data);

		res.json(updated);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.cashDrawerDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(CashDrawer);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// PaymentMethod
exports.paymentMethodList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(PaymentMethod);
		const data = await repo.find();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.paymentMethodCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(PaymentMethod);
		const data = repo.create(req.body);
		await repo.save(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.paymentMethodUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(PaymentMethod);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		repo.merge(data, req.body);

		// 3. Save the updated entity
		const updated = await repo.save(data);

		res.json(updated);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.paymentMethodDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(PaymentMethod);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// WeightScale
exports.weightScaleList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(WeightScale);
		const data = await repo.find();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.weightScaleCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(WeightScale);
		const data = repo.create(req.body);
		await repo.save(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.weightScaleUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(WeightScale);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		repo.merge(data, req.body);

		// 3. Save the updated entity
		const updated = await repo.save(data);

		res.json(updated);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.weightScaleDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(WeightScale);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Voucher
exports.voucherList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Voucher);
		const data = await repo.find();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.voucherCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Voucher);
		const data = repo.create(req.body);
		await repo.save(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.voucherUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Voucher);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		repo.merge(data, req.body);

		// 3. Save the updated entity
		const updated = await repo.save(data);

		res.json(updated);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.voucherDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Voucher);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.voucherSoftDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Voucher);
		const result = await repo.softDelete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data soft-deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Purchase
exports.purchaseList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Purchase);
		const data = await repo.find();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.purchaseById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Purchase);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.purchaseCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Purchase);
		const id = generateId(16);
		const purchaseData = {
			id: id,
			...req.body,
		};
		const data = repo.create(purchaseData);
		await repo.save(data);

		return res.status(201).json({
			message: "Purchase created successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.purchaseUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Purchase);
		const id = req.params.id;
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		const updated = repo.merge(data, req.body);
		await repo.save(updated);
		return res.status(200).json({
			message: "Purchase updated successfully",
			data: updated,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.purchaseDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Purchase);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// ChartItem
exports.chartItemList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(ChartItem);
		const data = await repo.find();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.chartItemCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(ChartItem);
		const data = repo.create(req.body);
		await repo.save(data);
		res.json(data);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.chartItemUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(ChartItem);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		repo.merge(data, req.body);

		// 3. Save the updated entity
		const updated = await repo.save(data);

		res.json(updated);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.chartItemDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(ChartItem);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
