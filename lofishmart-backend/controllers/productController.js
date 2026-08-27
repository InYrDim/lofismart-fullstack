const AppDataSource = require("../config/data-source");

// Entities / Model
const StockOpname = require("../db/entities/StockOpname");
const StockOpnameDetail = require("../db/entities/StockOpnameDetail");
const Price = require("../db/entities/Price");
const Product = require("../db/entities/Product");
const Service = require("../db/entities/Service");
const Stock = require("../db/entities/Stock");
const Reject = require("../db/entities/Reject");
const Grade = require("../db/entities/Grade");
const Size = require("../db/entities/Size");
const Category = require("../db/entities/Category");

const generateId = require("../middleware/generateId");
const watch = require("../middleware/dataChange");

const path = require("path");
const fs = require("fs");

const baseDir = path.join(process.cwd(), "upload");
const productDir = path.join(baseDir, "product");
const serviceDir = path.join(baseDir, "service");
const attachDir = path.join(baseDir, "attachment");

// StockOpname
exports.stockOpnameList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(StockOpname);
		const data = await repo.find();
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.stockOpnameById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(StockOpname);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.stockOpnameCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(StockOpname);
		const id = generateId(16);
		const createData = {
			id: id,
			status: "1", // 1: overview, 2: approved, 3: pending
			...req.body,
		};
		const data = repo.create(createData);
		await repo.save(data);

		return res.status(201).json({
			message: "Stock Opname created successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.stockOpnameUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(StockOpname);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		const updated = repo.merge(data, req.body);

		// 3. Save the updated entity
		await repo.save(updated);

		return res.status(200).json({
			// Gunakan status 200 untuk update yang berhasil
			message: "Stock Opname updated successfully",
			data: updated,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.stockOpnameDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(StockOpname);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// StockOpnameDetail
exports.stockOpnameDetailList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(StockOpnameDetail);
		const data = await repo.find();
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.stockOpnameDetailById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(StockOpnameDetail);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.stockOpnameDetailCreate = async (req, res, next) => {
	// --- Setup Path untuk Penyimpanan Manual ---
	let fileName = null; // Deklarasi di luar try/catch untuk cleanup

	// Pastikan folder produk ada sebelum mencoba menulis file
	if (!fs.existsSync(attachDir)) {
		try {
			fs.mkdirSync(attachDir, {
				recursive: true,
			});
		} catch (dirError) {
			return next(dirError); // Jika gagal buat direktori, hentikan
		}
	}

	try {
		const repo = AppDataSource.getRepository(StockOpnameDetail);
		const id = generateId(16);

		if (req.file) {
			const fileExtension = path.extname(req.file.originalname);
			fileName = `${id}${fileExtension}`;

			const filePath = path.join(attachDir, fileName);

			fs.writeFileSync(filePath, req.file.buffer);
		}

		const createData = {
			id: id,
			...req.body,
			attachment: fileName,
		};

		const data = repo.create(createData);
		await repo.save(data);

		return res.status(201).json({
			message: "Stock Opname Product created successfully",
			data: data,
		});
	} catch (err) {
		// 7. Cleanup/Hapus file yang sudah tersimpan jika penyimpanan DB gagal
		if (fileName) {
			const filePathToClean = path.join(createData, fileName);
			try {
				// Hanya hapus jika file ada
				if (fs.existsSync(filePathToClean)) {
					fs.unlinkSync(filePathToClean);
					console.log(`Cleaned up file ${fileName} due to DB error.`);
				}
			} catch (unlinkError) {
				console.error(`Failed to cleanup file: ${unlinkError.message}`);
			}
		}

		// Teruskan error ke error handler middleware
		next(err);
	}
};

exports.stockOpnameDetailUpdate = async (req, res, next) => {
	// --- Setup Path untuk Penyimpanan Manual ---
	let fileName = null;
	let oldFilePath = null;

	if (!fs.existsSync(attachDir)) {
		try {
			fs.mkdirSync(attachDir, { recursive: true });
		} catch (dirError) {
			return next(dirError);
		}
	}

	try {
		const repo = AppDataSource.getRepository(StockOpnameDetail);
		const id = req.params.id;

		let existingData = await repo.findOne({ where: { id } }); // Gunakan nama variabel unik

		if (!existingData) {
			return res.status(404).json({ message: "Data not found" });
		}

		if (existingData.attachment) {
			oldFilePath = path.join(attachDir, existingData.attachment);
		}

		let updateData = req.body;

		if (req.file) {
			const fileExtension = path.extname(req.file.originalname);
			fileName = `${id}${fileExtension}`;

			const newFilePath = path.join(attachDir, fileName);

			if (oldFilePath && fs.existsSync(oldFilePath)) {
				fs.unlinkSync(oldFilePath);
				console.log(`Old file cleaned up: ${existingData.attachment}`);
			}

			fs.writeFileSync(newFilePath, req.file.buffer);

			updateData.attachment = fileName;
		} else if (
			req.body.attachment === null ||
			req.body.attachment === undefined ||
			req.body.attachment === ""
		) {
			if (oldFilePath && fs.existsSync(oldFilePath)) {
				fs.unlinkSync(oldFilePath);
				console.log(`Old file cleaned up: ${existingData.attachment}`);
			}
			updateData.attachment = null; // Set field image di DB menjadi NULL
		} else {
		}

		const updatedData = repo.merge(existingData, updateData);

		await repo.save(updatedData);

		return res.status(200).json({
			// Gunakan status 200 untuk update yang berhasil
			message: "SO Product updated successfully",
			data: updatedData,
		});
	} catch (err) {
		// --- Cleanup Gambar Baru Jika Gagal DB ---
		// Jika file baru berhasil disimpan ke disk (fileName bukan null)
		// tetapi penyimpanan DB GAGAL, kita harus menghapus file baru tersebut.
		if (fileName) {
			const filePathToClean = path.join(attachDir, fileName);
			try {
				if (fs.existsSync(filePathToClean)) {
					fs.unlinkSync(filePathToClean);
					console.log(`Cleaned up new file ${fileName} due to DB error.`);
				}
			} catch (unlinkError) {
				console.error(`Failed to cleanup file: ${unlinkError.message}`);
			}
		}

		// Teruskan error ke error handler middleware
		next(err);
	}
};

exports.stockOpnameDetailDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(StockOpnameDetail);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Price
exports.priceList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Price);
		const data = await repo.find();
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.priceById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Price);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.getPrice = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Price);
		const barcode = req.body.barcode;
		const weight = Number(req.body.weight);
		const data = await repo.findOne({
			where: {
				barcode: barcode,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		const selling = data.selling;
		const disc = data.disc;

		data.price = Math.ceil((weight * selling - disc) / 1000) * 1000;

		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.priceByProduct = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Price);
		const id = req.params.id;
		const data = await repo.find({
			where: {
				product: { id: id }, // Matches the property name 'product' in relations
			},
		});
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.priceCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Price);
		const { product, grade, size } = req.body;

		if (!product || !grade || !size) {
			return res.status(400).json({
				message: "Product, grade, and size are required",
			});
		}

		const existing = await repo.findOne({
			where: {
				product: { id: product },
				grade: { id: grade },
				size: { id: size },
			},
		});

		if (existing) {
			return res.status(409).json({
				message: `Price untuk kombinasi product+grade+size ini sudah ada`,
				data: existing,
			});
		}

		const id = generateId(16);
		const createData = {
			id: id,
			...req.body,
		};
		const data = repo.create(createData);
		await repo.save(data);

		return res.status(201).json({
			message: "Price created successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.priceUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Price);
		const id = req.params.id;

		const data = await repo.findOne({
			where: { id },
			relations: ["product", "grade", "size"],
		});

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		const updatedProduct = req.body.product || data.product?.id;
		const updatedGrade = req.body.grade || data.grade?.id;
		const updatedSize = req.body.size || data.size?.id;

		if (updatedProduct && updatedGrade && updatedSize) {
			const existing = await repo.findOne({
				where: {
					product: { id: updatedProduct },
					grade: { id: updatedGrade },
					size: { id: updatedSize },
				},
			});

			if (existing && existing.id !== id) {
				return res.status(409).json({
					message: `Price untuk kombinasi product+grade+size ini sudah ada`,
					data: existing,
				});
			}
		}

		const updateData = { ...req.body };

		if (updateData.product) {
			updateData.product = { id: updateData.product };
		}
		if (updateData.grade) {
			updateData.grade = { id: updateData.grade };
		}
		if (updateData.size) {
			updateData.size = { id: updateData.size };
		}

		const updated = repo.merge(data, updateData);
		await repo.save(updated);

		return res.status(200).json({
			message: "Price updated successfully",
			data: updated,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.priceDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Price);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Product
exports.productList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Product);
		// const data = await repo.find({ where: { is_show: '1', is_non_stock: '1' } });
		// TODO: Remove this when we have a way to filter products
		const data = await repo.find();
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.productById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Product);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.productCreate = async (req, res, next) => {
	// --- Setup Path untuk Penyimpanan Manual ---
	let fileName = null; // Deklarasi di luar try/catch untuk cleanup

	// Pastikan folder produk ada sebelum mencoba menulis file
	if (!fs.existsSync(productDir)) {
		try {
			fs.mkdirSync(productDir, {
				recursive: true,
			});
		} catch (dirError) {
			return next(dirError); // Jika gagal buat direktori, hentikan
		}
	}

	try {
		const repo = AppDataSource.getRepository(Product);
		const id = generateId(8); // ⭐ 1. ID DIBUAT PERTAMA

		if (req.file) {
			const fileExtension = path.extname(req.file.originalname);
			// ⭐ 2. NAMA FILE BARU: menggunakan ID
			fileName = `${id}${fileExtension}`;

			const filePath = path.join(productDir, fileName);

			// ⭐ 3. SIMPAN FILE SECARA MANUAL DARI BUFFER
			// Gunakan fs.writeFile (asynchronous) jika Anda tidak ingin memblokir thread
			// atau fs.writeFileSync untuk kesederhanaan.
			fs.writeFileSync(filePath, req.file.buffer);
		}

		// 4. Siapkan Data DB
		// Hapus relasi size dari body karena sudah dipindah ke tabel Price
		if (req.body.size) delete req.body.size;
		if (req.body.size_id) delete req.body.size_id;

		const productData = {
			id: id,
			...req.body,
			image: fileName, // Simpan nama file yang mengandung ID di DB
		};

		const data = repo.create(productData);
		await repo.save(data); // 5. Simpan ke database

		watch("product", "INSERT", data, { image: `upload/product/${fileName}` });

		// 6. Respon Sukses dan return
		return res.status(201).json({
			message: "Product created successfully",
			data: data,
		});
	} catch (err) {
		// 7. Cleanup/Hapus file yang sudah tersimpan jika penyimpanan DB gagal
		if (fileName) {
			const filePathToClean = path.join(productDir, fileName);
			try {
				// Hanya hapus jika file ada
				if (fs.existsSync(filePathToClean)) {
					fs.unlinkSync(filePathToClean);
					console.log(`Cleaned up file ${fileName} due to DB error.`);
				}
			} catch (unlinkError) {
				console.error(`Failed to cleanup file: ${unlinkError.message}`);
			}
		}

		// Teruskan error ke error handler middleware
		next(err);
	}
};

exports.productUpdate = async (req, res, next) => {
	// --- Setup Path untuk Penyimpanan Manual ---
	let fileName = null;
	let oldImagePath = null; // Untuk menyimpan path gambar lama jika perlu dihapus

	// Pastikan folder 'product' ada
	if (!fs.existsSync(productDir)) {
		try {
			fs.mkdirSync(productDir, { recursive: true });
		} catch (dirError) {
			return next(dirError);
		}
	}

	try {
		const repo = AppDataSource.getRepository(Product);
		const id = req.params.id;

		// 1. Find existing
		let existingData = await repo.findOne({ where: { id } }); // Gunakan nama variabel unik

		if (!existingData) {
			return res.status(404).json({ message: "Product not found" });
		}

		// Simpan nama file lama (jika ada) sebelum merge
		if (existingData.image) {
			oldImagePath = path.join(productDir, existingData.image);
		}

		// --- Logika Update Gambar ---
		let updateData = req.body; // Mulai dengan data dari body

		// Hapus relasi size dari body karena sudah dipindah ke tabel Price
		if (updateData.size) delete updateData.size;
		if (updateData.size_id) delete updateData.size_id;

		if (req.file) {
			// Ada file baru yang diunggah

			const fileExtension = path.extname(req.file.originalname);
			// Nama file baru menggunakan ID produk yang sudah ada
			fileName = `${id}${fileExtension}`;

			const newFilePath = path.join(productDir, fileName);

			// Jika ada gambar lama, HAPUS GAMBAR LAMA (Tindakan 1)
			if (oldImagePath && fs.existsSync(oldImagePath)) {
				fs.unlinkSync(oldImagePath);
				console.log(`Old file cleaned up: ${existingData.image}`);
			}

			// Tulis file baru ke disk (Tindakan 2)
			fs.writeFileSync(newFilePath, req.file.buffer);

			// Masukkan nama file baru ke data update
			updateData.image = fileName;
		} else if (req.body.image === null || req.body.image === undefined) {
			// Jika klien secara eksplisit mengirim image: null/undefined/''
			// atau tidak mengirim req.file, dan ingin menghapus gambar

			// Catatan: Biasanya klien tidak mengirim image:null untuk penghapusan.
			// Lebih baik menggunakan field terpisah seperti "delete_image: true"

			// Dalam skenario ini, kita berasumsi image: null berarti hapus gambar lama
			if (oldImagePath && fs.existsSync(oldImagePath)) {
				fs.unlinkSync(oldImagePath);
				console.log(`Old file cleaned up: ${existingData.image}`);
			}
			updateData.image = null; // Set field image di DB menjadi NULL
		} else {
			// Jika req.file KOSONG dan req.body tidak mengubah field 'image',
			// maka field image DIJAGA nilainya (tidak perlu diapa-apakan).
			// Namun, karena repo.merge hanya menggabungkan req.body,
			// dan req.body tidak berisi 'image', nilai lama akan dipertahankan.
			updateData.image = existingData.image;
		}

		// 2. Merge request body (termasuk image baru/null jika ada) ke entity lama
		// Gunakan updateData yang mungkin sudah dimodifikasi
		const updatedData = repo.merge(existingData, updateData);

		// 3. Save the updated entity
		await repo.save(updatedData);

		watch("product", "UPDATE", updatedData, {
			image: `upload/product/${fileName}`,
		});

		return res.status(200).json({
			// Gunakan status 200 untuk update yang berhasil
			message: "Product updated successfully",
			data: updatedData,
		});
	} catch (err) {
		// --- Cleanup Gambar Baru Jika Gagal DB ---
		// Jika file baru berhasil disimpan ke disk (fileName bukan null)
		// tetapi penyimpanan DB GAGAL, kita harus menghapus file baru tersebut.
		if (fileName) {
			const filePathToClean = path.join(productDir, fileName);
			try {
				if (fs.existsSync(filePathToClean)) {
					fs.unlinkSync(filePathToClean);
					console.log(`Cleaned up new file ${fileName} due to DB error.`);
				}
			} catch (unlinkError) {
				console.error(`Failed to cleanup file: ${unlinkError.message}`);
			}
		}

		// Teruskan error ke error handler middleware
		next(err);
	}
};

exports.productDelete = async (req, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Product);
		const id = req.params.id;

		// 1. Cari data produk yang ada untuk mendapatkan nama file gambar
		const productToDelete = await repo.findOne({ where: { id } });

		if (!productToDelete) {
			// Jika data tidak ditemukan, kembalikan 404
			return res.status(404).json({ message: "Product not found" });
		}

		// Simpan nama file gambar lama (jika ada)
		const fileName = productToDelete.image;

		// 2. Hapus entry dari database
		const result = await repo.delete(id);

		if (result.affected === 0) {
			// Ini seharusnya tidak terjadi jika productToDelete ditemukan,
			// tapi ini adalah pemeriksaan keamanan.
			return res
				.status(404)
				.json({ message: "Product not found during delete operation" });
		}

		// 3. Hapus file gambar dari disk (setelah DB berhasil dihapus)
		if (fileName) {
			const filePath = path.join(productDir, fileName);

			// Lakukan penghapusan file
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				console.log(`Successfully deleted image file: ${fileName}`);
			} else {
				console.warn(
					`Image file not found on disk, skipping cleanup: ${fileName}`,
				);
			}
		}

		watch(
			"product",
			"DELETE",
			{ id: id },
			{ image: `upload/product/${fileName}` },
		);

		// 4. Respon Sukses
		res.json({
			message: "Product and associated image deleted successfully",
			data: productToDelete,
		});
	} catch (err) {
		// Teruskan error ke error handler middleware
		next(err);
	}
};

exports.productSoftDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Product);
		const result = await repo.softDelete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		watch("product", "SOFDEL", { id: req.params.id }, null);

		res.json({ message: "Data soft-deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Service
exports.serviceList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Service);
		const data = await repo.find();
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.serviceById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Service);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.serviceCreate = async (req, res, next) => {
	let fileName = null;

	if (!fs.existsSync(serviceDir)) {
		try {
			fs.mkdirSync(serviceDir, {
				recursive: true,
			});
		} catch (dirError) {
			return next(dirError);
		}
	}

	try {
		const repo = AppDataSource.getRepository(Service);
		const id = generateId(6);

		if (req.file) {
			const fileExtension = path.extname(req.file.originalname);
			fileName = `${id}${fileExtension}`;

			const filePath = path.join(serviceDir, fileName);

			fs.writeFileSync(filePath, req.file.buffer);
		}

		const serviceData = {
			id: id,
			...req.body,
			image: fileName,
		};

		const data = repo.create(serviceData);
		await repo.save(data);

		await watch("service", "INSERT", id);

		return res.status(201).json({
			message: "Service created successfully",
			data: data,
		});
	} catch (err) {
		// 7. Cleanup/Hapus file yang sudah tersimpan jika penyimpanan DB gagal
		if (fileName) {
			const filePathToClean = path.join(serviceDir, fileName);
			try {
				// Hanya hapus jika file ada
				if (fs.existsSync(filePathToClean)) {
					fs.unlinkSync(filePathToClean);
					console.log(`Cleaned up file ${fileName} due to DB error.`);
				}
			} catch (unlinkError) {
				console.error(`Failed to cleanup file: ${unlinkError.message}`);
			}
		}

		// Teruskan error ke error handler middleware
		next(err);
	}
};

exports.serviceUpdate = async (req, res, next) => {
	let fileName = null;
	let oldImagePath = null;

	if (!fs.existsSync(serviceDir)) {
		try {
			fs.mkdirSync(serviceDir, { recursive: true });
		} catch (dirError) {
			return next(dirError);
		}
	}

	try {
		const repo = AppDataSource.getRepository(Service);
		const id = req.params.id;

		let existingData = await repo.findOne({ where: { id } });

		if (!existingData) {
			return res.status(404).json({ message: "Service not found" });
		}

		if (existingData.image) {
			oldImagePath = path.join(serviceDir, existingData.image);
		}

		let updateData = req.body;

		if (req.file) {
			const fileExtension = path.extname(req.file.originalname);
			fileName = `${id}${fileExtension}`;

			const newFilePath = path.join(serviceDir, fileName);

			if (oldImagePath && fs.existsSync(oldImagePath)) {
				fs.unlinkSync(oldImagePath);
				console.log(`Old file cleaned up: ${existingData.image}`);
			}

			fs.writeFileSync(newFilePath, req.file.buffer);

			updateData.image = fileName;
		} else if (
			req.body.image === null ||
			req.body.image === undefined ||
			req.body.image === ""
		) {
			if (oldImagePath && fs.existsSync(oldImagePath)) {
				fs.unlinkSync(oldImagePath);
				console.log(`Old file cleaned up: ${existingData.image}`);
			}
			updateData.image = null;
		} else {
			// Jika req.file kosong dan tidak ada sinyal hapus gambar,
			// pertahankan nama file lama agar tidak menimpa dengan value "keep_existing_image" dari frontend.
			updateData.image = existingData.image;
		}

		const updatedData = repo.merge(existingData, updateData);

		await repo.save(updatedData);

		await watch("service", "UPDATE", id);

		return res.status(200).json({
			message: "Service updated successfully",
			data: updatedData,
		});
	} catch (err) {
		if (fileName) {
			const filePathToClean = path.join(serviceDir, fileName);
			try {
				if (fs.existsSync(filePathToClean)) {
					fs.unlinkSync(filePathToClean);
					console.log(`Cleaned up new file ${fileName} due to DB error.`);
				}
			} catch (unlinkError) {
				console.error(`Failed to cleanup file: ${unlinkError.message}`);
			}
		}

		// Teruskan error ke error handler middleware
		next(err);
	}
};

exports.serviceDelete = async (req, res, next) => {
	try {
		const repo = AppDataSource.getRepository(Service);
		const id = req.params.id;

		const existingData = await repo.findOne({
			where: {
				id,
			},
		});

		if (!existingData) {
			return res.status(404).json({
				message: "Service not found",
			});
		}

		const fileName = existingData.image;

		const result = await repo.delete(id);

		if (result.affected === 0) {
			return res.status(404).json({
				message: "Service not found during delete operation",
			});
		}

		if (fileName) {
			const filePath = path.join(serviceDir, fileName);

			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				console.log(`Successfully deleted image file: ${fileName}`);
			} else {
				console.warn(
					`Image file not found on disk, skipping cleanup: ${fileName}`,
				);
			}
		}

		res.json({
			message: "Service and associated image deleted successfully",
			data: existingData,
		});
	} catch (err) {
		next(err);
	}
};

exports.serviceSoftDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Service);
		const result = await repo.softDelete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data soft-deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Stock
exports.stockList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Stock);

		const userRole = req.user?.role;
		const userMarketId = req.user?.market_id;
		const outletScopedRoles = ['SPVR', 'GDNG', 'KSR', 'TMBG'];
		const isOutletScoped = outletScopedRoles.includes(userRole);

		// Also support explicit query param (e.g. admin filtering by outlet)
		const filterMarketId = req.query.market_id || req.query.warehouse_id || null;

		// Scoped users (Supervisor, etc.) are restricted to their assigned market.
		// Admin/Managers can filter by any market.
		let targetMarketId = null;

		if (isOutletScoped) {
			targetMarketId = userMarketId; // Take from fresh req.user
		} else {
			targetMarketId = filterMarketId; // Admin can use query param
		}
		console.log(`[stockList] Role: ${userRole}, MarketID: ${userMarketId}, Scoped: ${isOutletScoped}, Target: ${targetMarketId}`);
		
		let data;
		if (targetMarketId) {
			data = await repo.find({
				where: [
					{ market: { id: targetMarketId } },
					{ warehouse: { id: targetMarketId } },
				],
				relations: ['product', 'market', 'warehouse'],
			});
			console.log(`[stockList] Found ${data.length} records for target ${targetMarketId}`);
		} else if (isOutletScoped) {
			// Scoped user with no market ID: should see nothing for safety
			console.log(`[stockList] Scoped user ${userRole} has no MarketID, returning empty.`);
			data = [];
		} else {
			// Admin/Manager with no filter: return all
			data = await repo.find({
				relations: ['product', 'market', 'warehouse'],
			});
		}

		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.stockById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Stock);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.stockCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Stock);
		const id = generateId(16);
		const stockData = {
			id: id,
			...req.body,
		};
		const data = repo.create(stockData);
		await repo.save(data);

		return res.status(201).json({
			message: "Stock created successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.stockUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Stock);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		const updated = repo.merge(data, req.body);

		// 3. Save the updated entity
		await repo.save(updated);

		return res.status(200).json({
			// Gunakan status 200 untuk update yang berhasil
			message: "Stock updated successfully",
			data: updated,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.stockDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Stock);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Reject
exports.rejectList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Reject);
		const data = await repo.find();
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.rejectById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Reject);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.rejectById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Reject);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.rejectCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Reject);
		const id = generateId(16);
		const rejectData = {
			id: id,
			...req.body,
		};
		const data = repo.create(rejectData);
		await repo.save(data);

		return res.status(201).json({
			message: "Reject created successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.rejectUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Reject);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		const updated = repo.merge(data, req.body);

		// 3. Save the updated entity
		await repo.save(updated);

		return res.status(200).json({
			// Gunakan status 200 untuk update yang berhasil
			message: "Reject updated successfully",
			data: updated,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.rejectDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Reject);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Grade
exports.gradeList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Grade);
		const data = await repo.find();
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.gradeById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Grade);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.gradeCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Grade);
		const data = repo.create(req.body);
		await repo.save(data);

		return res.status(201).json({
			message: "Grade created successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.gradeUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Grade);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		const updated = repo.merge(data, req.body);

		// 3. Save the updated entity
		await repo.save(updated);

		return res.status(200).json({
			// Gunakan status 200 untuk update yang berhasil
			message: "Grade updated successfully",
			data: updated,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.gradeDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Grade);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Grade deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Size
exports.sizeList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Size);
		const data = await repo.find();
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.sizeById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Size);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.sizeCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Size);
		const data = repo.create(req.body);
		await repo.save(data);

		return res.status(201).json({
			message: "Size created successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.sizeUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Size);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		// 2. Merge request body to entity
		const updated = repo.merge(data, req.body);

		// 3. Save the updated entity
		await repo.save(updated);

		return res.status(200).json({
			// Gunakan status 200 untuk update yang berhasil
			message: "Size updated successfully",
			data: updated,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.sizeDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Size);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Size deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Category
exports.categoryList = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Category);
		const data = await repo.find();
		res.json({ data });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.categoryById = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Category);
		const id = req.params.id;
		const data = await repo.findOne({
			where: {
				id,
			},
		});
		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}
		res.json(data);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.categoryCreate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Category);
		const data = repo.create(req.body);
		await repo.save(data);

		return res.status(201).json({
			message: "Category created successfully",
			data: data,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.categoryUpdate = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Category);
		const id = req.params.id;

		// 1. Find existing
		const data = await repo.findOne({ where: { id } });

		if (!data) {
			return res.status(404).json({ message: "Data not found" });
		}

		console.log(req.body);
		// 2. Merge request body to entity
		const updated = repo.merge(data, req.body);

		// 3. Save the updated entity
		await repo.save(updated);

		return res.status(200).json({
			// Gunakan status 200 untuk update yang berhasil
			message: "Category updated successfully",
			data: updated,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

exports.categoryDelete = async (req, res) => {
	try {
		const repo = AppDataSource.getRepository(Category);
		const result = await repo.delete(req.params.id);

		if (result.affected === 0) {
			return res.status(404).json({ message: "Data not found" });
		}

		res.json({ message: "Category deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
