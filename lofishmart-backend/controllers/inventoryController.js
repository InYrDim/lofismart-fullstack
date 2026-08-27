const { MoreThanOrEqual } = require('typeorm');
const AppDataSource = require("../config/data-source");
const generateId = require("../middleware/generateId");
const Purchase = require("../db/entities/Purchase");
const Stock = require("../db/entities/Stock");
const Reject = require("../db/entities/Reject");
const Product = require("../db/entities/Product");
const StockOpname = require("../db/entities/StockOpname");
const StockOpnameDetail = require("../db/entities/StockOpnameDetail");
const StockTransfer = require("../db/entities/StockTransfer");

const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), "upload");
const rejectDir = path.join(baseDir, "reject");
const purchaseDir = path.join(baseDir, "purchase");

if (!fs.existsSync(purchaseDir)) {
    fs.mkdirSync(purchaseDir, { recursive: true });
}

exports.receiveFromSupplier = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const {
            supplier_id,
            warehouse_id, // GUDANG market ID
            product_id,
            purchased_qty,
            accepted_qty,
            rejected_qty,
            reject_reason,
            price,
            batch,
            unit // 1=KG, 2=Pieces
        } = req.body;

        const userId = req.user?.id || req.body.user_id; // Dari JWT middleware

        // 0. Validate Unit against Product Config
        const product = await queryRunner.manager.findOne(Product, { where: { id: product_id } });
        if (!product) {
            throw new Error("Product not found");
        }
        if (product.unit !== (unit || '1')) {
            const error = new Error(`Gagal menyimpan. Satuan ukur tidak cocok dengan profil produk asal (${product.unit === '1' ? 'KG' : 'Ekor/Pcs'}).`);
            error.statusCode = 400;
            throw error;
        }

        // 1. Create Purchase record
        const purchaseId = generateId(16);
        const purchaseData = {
            id: purchaseId,
            batch: batch || null,
            qty: parseFloat(purchased_qty),
            price: parseFloat(price) || 0,
            user: userId ? { id: userId } : null,
            product: { id: product_id },
            warehouse: { id: warehouse_id },
            supplier: { id: supplier_id },
            unit: unit || '1'
        };

        // Handle Image Proof Upload
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const fileName = `purchase-${purchaseId}${ext}`;
            const filePath = path.join(purchaseDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);
            purchaseData.image_proof = `purchase/${fileName}`;
        }

        const purchase = queryRunner.manager.create(Purchase, purchaseData);
        await queryRunner.manager.save(Purchase, purchase);

        // 2. Create/Update Stock record for accepted quantity
        // Cari stock gudang yang sudah ada untuk produk ini
        let existingStock = await queryRunner.manager.findOne(Stock, {
            where: {
                warehouse: { id: warehouse_id },
                product: { id: product_id },
                unit: unit || '1' // Stok dipisahkan berdasarkan satuannya
            }
        });

        if (existingStock) {
            existingStock.qty += parseFloat(accepted_qty);
            await queryRunner.manager.save(Stock, existingStock);
        } else {
            const stockId = generateId(16);
            const stockData = {
                id: stockId,
                batch: batch || null,
                qty: parseFloat(accepted_qty),
                user: userId ? { id: userId } : null,
                product: { id: product_id },
                warehouse: { id: warehouse_id },
                purchase: { id: purchaseId }, // Tautkan dengan purchase ini
                unit: unit || '1'
            };
            existingStock = queryRunner.manager.create(Stock, stockData);
            await queryRunner.manager.save(Stock, existingStock);
        }

        // 3. Create Reject record if there are rejected items
        if (parseFloat(rejected_qty) > 0) {
            // Karena relasi Reject butuh Stock ID di skema, kita pakai existingStock ID yang menerima (atau simpan dummy)
            const rejectId = generateId(16);
            const rejectData = {
                id: rejectId,
                qty: parseFloat(rejected_qty),
                desc: reject_reason || "Rejected upon receipt from supplier",
                status: '3', // 3 = other, bisa di map ke frontend
                user: userId ? { id: userId } : null,
                stock: { id: existingStock.id }, // Tautkan reject ke stok penerima
                unit: unit || '1'
            };

            const reject = queryRunner.manager.create(Reject, rejectData);
            await queryRunner.manager.save(Reject, reject);
        }

        await queryRunner.commitTransaction();

        return res.status(201).json({
            message: "Stock successfully received and validated from supplier",
            data: {
                purchaseId,
                acceptedStockId: existingStock.id
            }
        });

    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error("Error receiving from supplier:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

exports.receiveBulkFromSupplier = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const {
            supplier_id,
            warehouse_id, // GUDANG market ID
            items // array of { product_id, purchased_qty, accepted_qty, rejected_qty, reject_reason, price, batch, unit }
        } = req.body;

        const userId = req.user?.id || req.body.user_id;

        // Parse items if stringified (happens with FormData)
        let processedItems = items;
        if (typeof items === 'string') {
            try {
                processedItems = JSON.parse(items);
            } catch (e) {
                const error = new Error("Invalid items format. Must be a valid JSON array.");
                error.statusCode = 400;
                throw error;
            }
        }

        if (!processedItems || !Array.isArray(processedItems) || processedItems.length === 0) {
            const error = new Error("Items array is required and cannot be empty.");
            error.statusCode = 400;
            throw error;
        }

        const purchaseIds = [];
        const acceptedStockIds = [];

        for (const item of processedItems) {
            const {
                product_id,
                purchased_qty,
                accepted_qty,
                rejected_qty,
                reject_reason,
                price,
                batch,
                unit
            } = item;

            // 0. Validate Unit against Product Config
            const product = await queryRunner.manager.findOne(Product, { where: { id: product_id } });
            if (!product) {
                const error = new Error(`Product with ID ${product_id} not found`);
                error.statusCode = 404;
                throw error;
            }
            if (product.unit !== (unit || '1')) {
                const error = new Error(`Gagal menyimpan "${product.name}". Satuan ukur tidak cocok dengan profil produk asal (${product.unit === '1' ? 'KG' : 'Ekor/Pcs'}).`);
                error.statusCode = 400;
                throw error;
            }

            // 1. Create Purchase record
            const purchaseId = generateId(16);
            const purchaseData = {
                id: purchaseId,
                batch: batch || null,
                qty: parseFloat(purchased_qty),
                price: parseFloat(price) || 0,
                user: userId ? { id: userId } : null,
                product: { id: product_id },
                warehouse: { id: warehouse_id },
                supplier: { id: supplier_id },
                unit: unit || '1'
            };

            // Handle Image Proof Upload (One proof for the entire bulk transaction)
            if (req.file) {
                // We use the same file for all items in this bulk, but save it once
                // The filename will be based on the FIRST purchase ID or a custom bulk ID
                const ext = path.extname(req.file.originalname);
                const fileName = `purchase-bulk-${req.file.fieldname}-${Date.now()}${ext}`;
                const filePath = path.join(purchaseDir, fileName);
                
                // Only write once
                if (!req.bulkFileName) {
                    fs.writeFileSync(filePath, req.file.buffer);
                    req.bulkFileName = `purchase/${fileName}`;
                }
                purchaseData.image_proof = req.bulkFileName;
            }

            const purchase = queryRunner.manager.create(Purchase, purchaseData);
            await queryRunner.manager.save(Purchase, purchase);
            purchaseIds.push(purchaseId);

            // 2. Create/Update Stock record for accepted quantity
            let existingStock = await queryRunner.manager.findOne(Stock, {
                where: {
                    warehouse: { id: warehouse_id },
                    product: { id: product_id },
                    unit: unit || '1'
                }
            });

            if (existingStock) {
                existingStock.qty += parseFloat(accepted_qty);
                await queryRunner.manager.save(Stock, existingStock);
            } else {
                const stockId = generateId(16);
                const stockData = {
                    id: stockId,
                    batch: batch || null,
                    qty: parseFloat(accepted_qty),
                    user: userId ? { id: userId } : null,
                    product: { id: product_id },
                    warehouse: { id: warehouse_id },
                    purchase: { id: purchaseId },
                    unit: unit || '1'
                };
                existingStock = queryRunner.manager.create(Stock, stockData);
                await queryRunner.manager.save(Stock, existingStock);
            }
            acceptedStockIds.push(existingStock.id);

            // 3. Create Reject record if there are rejected items
            if (parseFloat(rejected_qty) > 0) {
                const rejectId = generateId(16);
                const rejectData = {
                    id: rejectId,
                    qty: parseFloat(rejected_qty),
                    desc: reject_reason || "Rejected upon bulk receipt from supplier",
                    status: '3', // 3 = other
                    user: userId ? { id: userId } : null,
                    stock: { id: existingStock.id },
                    unit: unit || '1'
                };

                const reject = queryRunner.manager.create(Reject, rejectData);
                await queryRunner.manager.save(Reject, reject);
            }
        }

        await queryRunner.commitTransaction();

        return res.status(201).json({
            message: "Bulk stock successfully received and validated from supplier",
            data: {
                purchaseIds,
                acceptedStockIds
            }
        });

    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error("Error receiving bulk from supplier:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

exports.transferToMarket = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const {
            source_stock_id, // Dari gudang
            market_id,       // ID Market tujuan
            product_id,
            transfer_qty,
            accepted_qty,
            rejected_qty,
            reject_reason,
            unit // 1=KG, 2=Pieces
        } = req.body;

        const userId = req.user?.id || req.body.user_id;

        // 0. Validate Unit against Product Config
        const product = await queryRunner.manager.findOne(Product, { where: { id: product_id } });
        if (!product) {
            throw new Error("Product not found");
        }
        if (product.unit !== (unit || '1')) {
            const error = new Error(`Gagal mentransfer. Satuan ukur tidak cocok dengan profil produk asal (${product.unit === '1' ? 'KG' : 'Ekor/Pcs'}).`);
            error.statusCode = 400;
            throw error;
        }

        // 1. Reduce stock from the source (Gudang)
        const sourceStock = await queryRunner.manager.findOne(Stock, {
            where: { id: source_stock_id }
        });

        if (!sourceStock) {
            throw new Error("Source stock not found");
        }

        if (sourceStock.qty < parseFloat(transfer_qty)) {
            throw new Error("Insufficient stock in warehouse to transfer");
        }

        sourceStock.qty -= parseFloat(transfer_qty);
        await queryRunner.manager.save(Stock, sourceStock);

        // 2. Increase stock in destination (Market) for accepted quantity
        let targetStock = await queryRunner.manager.findOne(Stock, {
            where: {
                market: { id: market_id },
                product: { id: product_id },
                unit: unit || '1' // Pastikan transfer unit match
            }
        });

        if (targetStock) {
            targetStock.qty += parseFloat(accepted_qty);
            await queryRunner.manager.save(Stock, targetStock);
        } else {
            const targetStockId = generateId(16);
            const targetStockData = {
                id: targetStockId,
                qty: parseFloat(accepted_qty),
                user: userId ? { id: userId } : null,
                product: { id: product_id },
                market: { id: market_id },
                unit: unit || '1'
            };
            targetStock = queryRunner.manager.create(Stock, targetStockData);
            await queryRunner.manager.save(Stock, targetStock);
        }

        // 3. Log the rejected quantity at destination
        if (parseFloat(rejected_qty) > 0) {
            const rejectId = generateId(16);
            const rejectData = {
                id: rejectId,
                qty: parseFloat(rejected_qty),
                desc: reject_reason || "Rejected upon transfer to market",
                status: '3', // 3 = other
                user: userId ? { id: userId } : null,
                stock: { id: targetStock.id }, // Tautkan ke stok market
                unit: unit || '1'
            };

            const reject = queryRunner.manager.create(Reject, rejectData);
            await queryRunner.manager.save(Reject, reject);
        }

        await queryRunner.commitTransaction();

        return res.status(200).json({
            message: "Stock successfully transferred and validated at market",
            data: {
                sourceStockId: source_stock_id,
                targetStockId: targetStock.id
            }
        });

    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error("Error transferring to market:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

exports.getInventoryDashboard = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userMarketId = req.user?.market_id;
        console.log("=== req.user ===", req.user);

        // Roles that see only their own outlet
        const outletScopedRoles = ['SPVR', 'GDNG', 'KSR', 'TMBG'];
        const isOutletScoped = outletScopedRoles.includes(userRole);

        // Scoped users (Supervisor, etc.) are restricted to their assigned market.
        // Admin/Managers see all items on the dashboard summary.
        const targetMarketId = isOutletScoped ? userMarketId : null;

        const stockRepo = AppDataSource.getRepository(Stock);
        const stocks = await stockRepo.find({
            where: targetMarketId ? [
                { market: { id: targetMarketId } },
                { warehouse: { id: targetMarketId } },
            ] : undefined,
            relations: ['market', 'warehouse', 'product'],
        });

        const marketData = {};

        stocks.forEach(stock => {
            let locId = "Gudang";
            let locName = "Gudang Utama";

            if (stock.market && stock.market.id) {
                locId = stock.market.id;
                locName = stock.market.name || `Market ${stock.market.id}`;
            } else if (stock.warehouse && stock.warehouse.id) {
                locId = stock.warehouse.id;
                locName = stock.warehouse.name || 'Gudang Utama';
            }

            if (!marketData[locId]) {
                marketData[locId] = { marketId: locId, marketName: locName };
            }

            const productName = stock.product?.name || "Unknown Product";

            if (!marketData[locId][productName]) {
                marketData[locId][productName] = 0;
            }
            marketData[locId][productName] += stock.qty;
        });

        res.status(200).json({
            message: "Dashboard data fetched",
            data: Object.values(marketData),
            // Let frontend know if this is scoped or full view
            scoped: isOutletScoped,
            market_id: userMarketId || null,
        });
    } catch (err) {
        console.error("Error fetching dashboard:", err);
        res.status(500).json({ message: err.message });
    }
};


exports.requestReject = async (req, res, next) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const {
            market_id,
            product_id,
            qty,
            desc,
            unit
        } = req.body;

        console.log("=== requestReject payload ===", req.body);

        const userId = req.user?.id;
        const parsedMarketId = market_id === 'null' || market_id === 'undefined' ? null : market_id;
        const targetMarketId = parsedMarketId || req.user?.market_id;

        if (!targetMarketId) {
            const error = new Error("Market ID is required");
            error.statusCode = 400;
            throw error;
        }

        // Find the stock
        const stock = await queryRunner.manager.findOne(Stock, {
            where: [
                { market: { id: targetMarketId }, product: { id: product_id }, unit: unit || '1' },
                { warehouse: { id: targetMarketId }, product: { id: product_id }, unit: unit || '1' }
            ]
        });

        if (!stock) {
            const error = new Error("Stock not found for this product and market");
            error.statusCode = 404;
            throw error;
        }

        const rejectId = generateId(16);
        let fileName = null;

        // Handle image upload
        if (req.file) {
            if (!fs.existsSync(rejectDir)) {
                fs.mkdirSync(rejectDir, { recursive: true });
            }
            const fileExtension = path.extname(req.file.originalname);
            fileName = `${rejectId}${fileExtension}`;
            const filePath = path.join(rejectDir, fileName);
            fs.writeFileSync(filePath, req.file.buffer);
        }

        const rejectData = {
            id: rejectId,
            qty: parseFloat(qty),
            desc: desc || "Reject requested",
            status: '3', // 3 = other
            unit: unit || '1',
            approval_status: 'PENDING',
            image_proof: fileName,
            user: userId ? { id: userId } : null,
            stock: { id: stock.id }
        };

        const reject = queryRunner.manager.create(Reject, rejectData);
        await queryRunner.manager.save(Reject, reject);

        await queryRunner.commitTransaction();

        return res.status(201).json({
            message: "Reject request submitted successfully",
            data: reject
        });

    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error("Error requesting reject:", err);
        if (next) return next(err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

exports.getRejectList = async (req, res, next) => {
    try {
        const userRole = req.user?.role;
        const userMarketId = req.user?.market_id;

        const outletScopedRoles = ['SPVR', 'GDNG', 'KSR', 'TMBG'];
        const isOutletScoped = outletScopedRoles.includes(userRole);

        let where = {};
        if (isOutletScoped && userMarketId) {
            where = [
                { stock: { market: { id: userMarketId } } },
                { stock: { warehouse: { id: userMarketId } } }
            ];
        }

        const rejectRepo = AppDataSource.getRepository(Reject);
        const rejects = await rejectRepo.find({
            where,
            relations: ['user', 'approved_by', 'stock', 'stock.product', 'stock.market', 'stock.warehouse'],
            order: { created_at: 'DESC' }
        });

        return res.status(200).json({
            message: "Reject list fetched successfully",
            data: rejects
        });
    } catch (err) {
        console.error("Error fetching reject list:", err);
        if (next) return next(err);
        return res.status(500).json({ message: err.message });
    }
};

exports.approveReject = async (req, res, next) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;
        const { action } = req.body; // 'APPROVED' or 'REJECTED'

        if (!['APPROVED', 'REJECTED'].includes(action)) {
            const error = new Error("Invalid action. Must be APPROVED or REJECTED");
            error.statusCode = 400;
            throw error;
        }

        const userId = req.user?.id;

        const reject = await queryRunner.manager.findOne(Reject, {
            where: { id },
            relations: ['stock']
        });

        if (!reject) {
            const error = new Error("Reject record not found");
            error.statusCode = 404;
            throw error;
        }

        if (reject.approval_status !== 'PENDING') {
            const error = new Error(`Reject is already ${reject.approval_status}`);
            error.statusCode = 400;
            throw error;
        }

        reject.approval_status = action;
        reject.approved_by = { id: userId };

        if (action === 'APPROVED') {
            const stock = reject.stock;
            if (!stock) {
                const error = new Error("Related stock not found");
                error.statusCode = 404;
                throw error;
            }

            if (stock.qty < reject.qty) {
                const error = new Error("Insufficient stock to approve this reject");
                error.statusCode = 400;
                throw error;
            }

            stock.qty -= reject.qty;
            await queryRunner.manager.save(Stock, stock);
        }

        await queryRunner.manager.save(Reject, reject);

        await queryRunner.commitTransaction();

        return res.status(200).json({
            message: `Reject request ${action.toLowerCase()} successfully`,
            data: reject
        });

    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error("Error approving reject:", err);
        if (next) return next(err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

exports.getPurchaseHistory = async (req, res, next) => {
    try {
        const { warehouse_id } = req.query;
        const purchaseRepo = AppDataSource.getRepository(Purchase);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const where = {
            created_at: MoreThanOrEqual(thirtyDaysAgo)
        };

        if (warehouse_id && warehouse_id !== 'all') {
            where.warehouse = { id: warehouse_id };
        }

        // Fetch purchases from the last 30 days
        const purchases = await purchaseRepo.find({
            where,
            relations: ['product', 'supplier', 'warehouse'],
            order: { created_at: 'DESC' }
        });

        return res.status(200).json({
            message: "Purchase history fetched successfully",
            data: purchases
        });
    } catch (err) {
        console.error("Error fetching purchase history:", err);
        if (next) return next(err);
        return res.status(500).json({ message: err.message });
    }
};

exports.approveStockOpname = async (req, res, next) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const opname = await queryRunner.manager.findOne(StockOpname, {
            where: { id },
            relations: ['market']
        });

        if (!opname) {
            const error = new Error("Sesi Stock Opname tidak ditemukan");
            error.statusCode = 404;
            throw error;
        }

        if (opname.status === '2') {
            const error = new Error("Sesi Stock Opname ini sudah disetujui sebelumnya");
            error.statusCode = 400;
            throw error;
        }

        // 1. Ambil semua detail hitungan
        const details = await queryRunner.manager.find(StockOpnameDetail, {
            where: { stockOpname: { id } },
            relations: ['product']
        });

        const marketId = opname.market?.id;

        for (const detail of details) {
            // 2. Cari stok asli di market tersebut
            let stock = await queryRunner.manager.findOne(Stock, {
                where: [
                    { market: { id: marketId }, product: { id: detail.product.id } },
                    { warehouse: { id: marketId }, product: { id: detail.product.id } }
                ]
            });

            if (stock) {
                // 3. Jika ada selisih kurang, buat record Reject sebagai log
                const diff = detail.actual_stock - stock.qty;
                if (diff < 0) {
                    const rejectId = generateId(16);
                    const rejectData = {
                        id: rejectId,
                        qty: Math.abs(diff),
                        desc: `Selisih Opname (${opname.id}): ${detail.adjustment_type === '1' ? 'Expired' : detail.adjustment_type === '2' ? 'Broken' : 'Lainnya'}`,
                        status: '3', // 3 = other
                        approval_status: 'APPROVED',
                        approved_by: { id: userId },
                        stock: { id: stock.id },
                        unit: stock.unit
                    };
                    const reject = queryRunner.manager.create(Reject, rejectData);
                    await queryRunner.manager.save(Reject, reject);
                }

                // 4. Update stok utama ke angka fisik
                stock.qty = detail.actual_stock;
                await queryRunner.manager.save(Stock, stock);
            }
        }

        // 5. Finalisasi status opname
        opname.status = '2'; // Approved
        opname.approved_at = new Date();
        await queryRunner.manager.save(StockOpname, opname);

        await queryRunner.commitTransaction();

        return res.status(200).json({
            message: "Stock Opname berhasil disetujui & stok disinkronisasi",
            data: opname
        });

    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error("Error approving stock opname:", err);
        if (next) return next(err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

// ==========================================
// STOCK TRANSFER ORDER (3-STATUS FLOW)
// ==========================================

/**
 * Buat transfer order baru dari gudang ke outlet.
 * Stok gudang dikurangi saat dibuat (status: SENDING).
 */
exports.createTransferOrder = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { source_stock_id, target_market_id, product_id, qty, unit, notes } = req.body;
        const userId = req.user?.id;

        if (!source_stock_id || !target_market_id || !product_id || !qty) {
            const error = new Error('source_stock_id, target_market_id, product_id, dan qty wajib diisi');
            error.statusCode = 400;
            throw error;
        }

        const sourceStock = await queryRunner.manager.findOne(Stock, {
            where: { id: source_stock_id },
            relations: ['product', 'warehouse'],
        });

        if (!sourceStock) {
            const error = new Error('Stok gudang tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        const transferQty = parseFloat(qty);
        if (sourceStock.qty < transferQty) {
            const error = new Error(`Stok gudang tidak mencukupi. Tersedia: ${sourceStock.qty} ${sourceStock.unit === '1' ? 'kg' : 'ekor'}`);
            error.statusCode = 400;
            throw error;
        }

        // Kurangi stok gudang (barang sudah "berangkat")
        sourceStock.qty -= transferQty;
        await queryRunner.manager.save(Stock, sourceStock);

        // Buat transfer order
        const transferId = generateId(16);
        const transfer = queryRunner.manager.create(StockTransfer, {
            id: transferId,
            qty: transferQty,
            unit: unit || sourceStock.unit || '1',
            status: 'SENDING',
            notes: notes || null,
            source_stock: { id: source_stock_id },
            target_market: { id: target_market_id },
            product: { id: product_id },
            created_by: userId ? { id: userId } : null,
        });
        await queryRunner.manager.save(StockTransfer, transfer);
        await queryRunner.commitTransaction();

        return res.status(201).json({
            message: 'Transfer order berhasil dibuat',
            data: { transferId, status: 'SENDING' },
        });
    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error('Error creating transfer order:', err);
        return res.status(err.statusCode || 500).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

/**
 * Buat multiple transfer order dalam satu transaksi (bulk).
 * Semua item dalam satu request akan dibuat sebagai transfer order terpisah
 * namun dalam satu grup (transfer_group) untuk memudahkan tracking.
 */
exports.bulkCreateTransferOrder = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { items, notes } = req.body;
        const userId = req.user?.id;
        const transferGroup = require('crypto').randomUUID();

        if (!items || !Array.isArray(items) || items.length === 0) {
            const error = new Error('items wajib diisi (array dengan minimal 1 item)');
            error.statusCode = 400;
            throw error;
        }

        const targetMarketId = items[0].target_market_id;
        if (!targetMarketId) {
            const error = new Error('target_market_id wajib diisi');
            error.statusCode = 400;
            throw error;
        }

        // Validasi semua item punya target_market_id yang sama
        for (const item of items) {
            if (item.target_market_id !== targetMarketId) {
                const error = new Error('Semua item harus memiliki target_market_id yang sama');
                error.statusCode = 400;
                throw error;
            }
            if (!item.source_stock_id || !item.product_id || !item.qty) {
                const error = new Error('source_stock_id, product_id, dan qty wajib diisi untuk setiap item');
                error.statusCode = 400;
                throw error;
            }
        }

        const transferIds = [];

        for (const item of items) {
            const { source_stock_id, product_id, qty, unit } = item;

            const sourceStock = await queryRunner.manager.findOne(Stock, {
                where: { id: source_stock_id },
                relations: ['product', 'warehouse'],
            });

            if (!sourceStock) {
                const error = new Error(`Stok tidak ditemukan untuk product_id: ${product_id}`);
                error.statusCode = 404;
                throw error;
            }

            const transferQty = parseFloat(qty);
            if (sourceStock.qty < transferQty) {
                const error = new Error(`Stok tidak mencukupi untuk ${sourceStock.product?.name || product_id}. Tersedia: ${sourceStock.qty} ${sourceStock.unit === '1' ? 'kg' : 'ekor'}`);
                error.statusCode = 400;
                throw error;
            }

            // Kurangi stok
            sourceStock.qty -= transferQty;
            await queryRunner.manager.save(Stock, sourceStock);

            // Buat transfer order
            const transferId = generateId(16);
            const transfer = queryRunner.manager.create(StockTransfer, {
                id: transferId,
                qty: transferQty,
                unit: unit || sourceStock.unit || '1',
                status: 'SENDING',
                notes: notes || null,
                transfer_group: transferGroup,
                source_stock: { id: source_stock_id },
                target_market: { id: targetMarketId },
                product: { id: product_id },
                created_by: userId ? { id: userId } : null,
            });
            await queryRunner.manager.save(StockTransfer, transfer);
            transferIds.push(transferId);
        }

        await queryRunner.commitTransaction();

        return res.status(201).json({
            message: `${transferIds.length} transfer order berhasil dibuat`,
            data: { transferIds, count: transferIds.length, status: 'SENDING', transfer_group: transferGroup },
        });
    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error('Error bulk creating transfer orders:', err);
        return res.status(err.statusCode || 500).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

/**
 * Ambil list transfer orders.
 * Admin/Manager: semua | GDNG: dari gudang ini | SPVR: ke outlet ini.
 */
exports.getTransferOrders = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userMarketId = req.user?.market_id;
        const { status } = req.query;

        const repo = AppDataSource.getRepository(StockTransfer);
        const qb = repo.createQueryBuilder('st')
            .leftJoinAndSelect('st.source_stock', 'source_stock')
            .leftJoinAndSelect('source_stock.warehouse', 'warehouse')
            .leftJoinAndSelect('st.target_market', 'target_market')
            .leftJoinAndSelect('st.product', 'product')
            .leftJoinAndSelect('st.created_by', 'created_by')
            .leftJoinAndSelect('st.verified_by', 'verified_by')
            .orderBy('st.created_at', 'DESC');

        if (status) {
            qb.andWhere('st.status = :status', { status });
        }

        if (userRole === 'SPVR' && userMarketId) {
            qb.andWhere('st.target_market_id = :marketId', { marketId: userMarketId });
        } else if (userRole === 'GDNG' && userMarketId) {
            qb.andWhere('warehouse.id = :marketId', { marketId: userMarketId });
        }

        const transfers = await qb.getMany();

        return res.status(200).json({
            message: 'Transfer orders fetched successfully',
            data: transfers,
        });
    } catch (err) {
        console.error('Error fetching transfer orders:', err);
        return res.status(500).json({ message: err.message });
    }
};

/**
 * Update status transfer order.
 * SENDING -> WAITING_VERIFICATION: GDNG/Admin konfirmasi kirim
 * WAITING_VERIFICATION -> DONE: SPVR verifikasi terima, stok outlet bertambah
 */
exports.updateTransferStatus = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;
        const { status, verified_qty, verified_notes } = req.body;
        const userId = req.user?.id;

        const validTransitions = {
            SENDING: 'WAITING_VERIFICATION',
            WAITING_VERIFICATION: 'DONE',
        };

        const transfer = await queryRunner.manager.findOne(StockTransfer, {
            where: { id },
            relations: ['source_stock', 'source_stock.warehouse', 'target_market', 'product'],
        });

        if (!transfer) {
            const error = new Error('Transfer order tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        const expectedNext = validTransitions[transfer.status];
        if (!expectedNext || expectedNext !== status) {
            const error = new Error(`Transisi status tidak valid: ${transfer.status} -> ${status}`);
            error.statusCode = 400;
            throw error;
        }

        transfer.status = status;

        if (status === 'WAITING_VERIFICATION') {
            transfer.sent_at = new Date();
        }

        if (status === 'DONE') {
            const acceptedQty = parseFloat(verified_qty ?? transfer.qty);

            let targetStock = await queryRunner.manager.findOne(Stock, {
                where: {
                    market: { id: transfer.target_market.id },
                    product: { id: transfer.product.id },
                    unit: transfer.unit,
                },
            });

            if (targetStock) {
                targetStock.qty += acceptedQty;
                await queryRunner.manager.save(Stock, targetStock);
            } else {
                const newStockId = generateId(16);
                targetStock = queryRunner.manager.create(Stock, {
                    id: newStockId,
                    qty: acceptedQty,
                    unit: transfer.unit,
                    product: { id: transfer.product.id },
                    market: { id: transfer.target_market.id },
                    user: userId ? { id: userId } : null,
                });
                await queryRunner.manager.save(Stock, targetStock);
            }

            transfer.verified_qty = acceptedQty;
            transfer.verified_notes = verified_notes || null;
            transfer.verified_at = new Date();
            transfer.verified_by = userId ? { id: userId } : null;
        }

        await queryRunner.manager.save(StockTransfer, transfer);
        await queryRunner.commitTransaction();

        return res.status(200).json({
            message: `Status transfer berhasil diubah ke ${status}`,
            data: transfer,
        });
    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error('Error updating transfer status:', err);
        return res.status(err.statusCode || 500).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

/**
 * Batalkan transfer order (hanya saat SENDING). Stok gudang dikembalikan.
 */
exports.cancelTransfer = async (req, res) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const { id } = req.params;

        const transfer = await queryRunner.manager.findOne(StockTransfer, {
            where: { id },
            relations: ['source_stock'],
        });

        if (!transfer) {
            const error = new Error('Transfer order tidak ditemukan');
            error.statusCode = 404;
            throw error;
        }

        if (transfer.status !== 'SENDING') {
            const error = new Error(`Transfer hanya bisa dibatalkan saat status SENDING. Status saat ini: ${transfer.status}`);
            error.statusCode = 400;
            throw error;
        }

        if (transfer.source_stock) {
            transfer.source_stock.qty += transfer.qty;
            await queryRunner.manager.save(Stock, transfer.source_stock);
        }

        transfer.status = 'CANCELLED';
        await queryRunner.manager.save(StockTransfer, transfer);
        await queryRunner.commitTransaction();

        return res.status(200).json({
            message: 'Transfer order dibatalkan dan stok gudang dikembalikan',
            data: { id: transfer.id, status: 'CANCELLED' },
        });
    } catch (err) {
        await queryRunner.rollbackTransaction();
        console.error('Error cancelling transfer:', err);
        return res.status(err.statusCode || 500).json({ message: err.message });
    } finally {
        await queryRunner.release();
    }
};

const transferProofDir = path.join(baseDir, "transfers");

if (!fs.existsSync(transferProofDir)) {
    fs.mkdirSync(transferProofDir, { recursive: true });
}

exports.uploadTransferProof = async (req, res) => {
    try {
        const { id } = req.params;

        const transfer = await AppDataSource.getRepository(StockTransfer).findOne({
            where: { id },
        });

        if (!transfer) {
            return res.status(404).json({ message: 'Transfer order tidak ditemukan' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'File bukti tidak ditemukan' });
        }

        const ext = path.extname(req.file.originalname);
        const fileName = `transfer-proof-${id}${ext}`;
        const filePath = path.join(transferProofDir, fileName);

        fs.writeFileSync(filePath, req.file.buffer);

        transfer.image_proof = `transfers/${fileName}`;
        await AppDataSource.getRepository(StockTransfer).save(transfer);

        return res.status(200).json({
            message: 'Bukti penerimaan berhasil diupload',
            data: { image_proof: transfer.image_proof },
        });
    } catch (err) {
        console.error('Error uploading transfer proof:', err);
        return res.status(500).json({ message: err.message });
    }
};

exports.getTransferReport = async (req, res) => {
    try {
        const { id } = req.params;
        const repo = AppDataSource.getRepository(StockTransfer);

        const transfer = await repo.createQueryBuilder('st')
            .leftJoinAndSelect('st.source_stock', 'source_stock')
            .leftJoinAndSelect('source_stock.warehouse', 'warehouse')
            .leftJoinAndSelect('st.target_market', 'target_market')
            .leftJoinAndSelect('st.product', 'product')
            .leftJoinAndSelect('st.created_by', 'created_by')
            .leftJoinAndSelect('st.verified_by', 'verified_by')
            .where('st.id = :id', { id })
            .getOne();

        if (!transfer) {
            return res.status(404).json({ message: 'Transfer order tidak ditemukan' });
        }

        return res.status(200).json({
            message: 'Transfer report fetched successfully',
            data: transfer,
        });
    } catch (err) {
        console.error('Error fetching transfer report:', err);
        return res.status(500).json({ message: err.message });
    }
};