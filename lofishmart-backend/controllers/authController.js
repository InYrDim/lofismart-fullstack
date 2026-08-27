const AppDataSource = require("../config/data-source");

const User = require("../db/entities/User");
const HasPermit = require("../db/entities/HasPermit");
const Session = require("../db/entities/Session");

const userController = require("../controllers/userController");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateId = require("../middleware/generateId");
const HasPermitRepo = () => AppDataSource.getRepository(HasPermit);

exports.getMe = async (req, res) => {
	try {
		const userRepo = AppDataSource.getRepository(User);
		const user = await userRepo.findOne({
			where: { id: req.user.id },
			relations: ['role', 'market'],
		});

		if (!user) {
			return res.status(404).json({ message: "User tidak ditemukan" });
		}

		// Get latest permissions
		const hasPermit = await HasPermitRepo().find({
			where: {
				role: {
					id: user.role_id || user.role?.id,
				},
			},
		});

		const permissionNames = hasPermit.map((item) => item.permission.name);
		if (user.permissions && Array.isArray(user.permissions)) {
			user.permissions.forEach(p => {
				if (!permissionNames.includes(p)) {
					permissionNames.push(p);
				}
			});
		}

		res.json({
			user: {
				id: user.id,
				name: user.name,
				role: user.role?.id || user.role_id,
				username: user.username,
				email: user.email,
				image: user.image,
				market_id: user.market?.id || user.market_id || null,
				market: user.market || null,
				login: true,
				hasPermit: permissionNames,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.login = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		if (!password || (!username && !email)) {
			return res
				.status(400)
				.json({ message: "Username/email & password wajib diisi" });
		}

		const userRepo = AppDataSource.getRepository(User);

		// cari user berdasarkan username ATAU email
		const user = await userRepo.findOne({
			where: [{ username: username }, { email: email }],
			relations: ['role', 'market'],
		});

		if (!user) {
			return res.status(401).json({ message: "User tidak ditemukan" });
		}

		const hasPermitRepo = AppDataSource.getRepository(HasPermit);

		const hasPermit = await hasPermitRepo.find({
			where: {
				// Filternya adalah: Di dalam relasi 'role', kolom 'id' harus sama dengan 'user.role_id'
				role: {
					id: user.role_id,
				},
			},
		});

		const permissionNames = hasPermit.map((item) => item.permission.name);
		
		// Gabungkan dengan izin khusus user (jika ada)
		if (user.permissions && Array.isArray(user.permissions)) {
			user.permissions.forEach(p => {
				if (!permissionNames.includes(p)) {
					permissionNames.push(p);
				}
			});
		}

		// cek password
		const match = await bcrypt.compare(password, user.password);

		if (!match) {
			return res.status(401).json({ message: "Password salah" });
		}

		// generate session token
		const sessionToken = generateId(16);

		// generate JWT token
		const token = jwt.sign(
			{
				id: user.id,
				name: user.name,
				username: user.username,
				email: user.email,
				role: user.role?.id || user.role_id,
				market_id: user.market?.id || null,
				hasPermit: permissionNames,
			},
			process.env.JWT_SECRET || "secretKey123", // ubah ke env
			{ expiresIn: "1d" },
		);

		try {
			const repo = AppDataSource.getRepository(Session);
			const sessionData = {
				id: sessionToken,
				ip_address: req.ip ?? null,
				user_agent: req.headers["user-agent"] ?? null,
				payload: token,
				user: user.id,
				expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
			};
			const create = repo.create(sessionData);
			await repo.save(create);
			console.log(create);
		} catch (err) {
			return res.status(500).json({ message: err.message });
		}

		console.log(user);

		res.json({
			message: "Login berhasil",
			token: "Bearer " + sessionToken,
			user: {
				id: user.id,
				name: user.name,
				role: user.role?.id || user.role_id,
				username: user.username,
				email: user.email,
				image: user.image,
				market_id: user.market?.id || user.market_id || null,
				market: user.market || null,
				login: true,
				hasPermit: permissionNames,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

exports.logout = async (req, res) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				message: "Token tidak ditemukan",
			});
		}

		const token = authHeader.split(" ")[1];

		const sessionData = await userController.sessionDelete(token);

		console.log("session deleted: " + sessionData);

		return res.json({
			message: "Logout berhasil",
			login: false,
		});
	} catch (err) {
		if (err.status) {
			return res.status(err.status).json({
				message: err.message,
				login: false,
			});
		}
		return res.status(500).json({
			message: err.message,
			login: false,
		});
	}
};

// exports.login = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     if (!password || (!username && !email)) {
//       return res.status(400).json({ message: "Username/email & password wajib diisi" });
//     }

//     const userRepo = AppDataSource.getRepository(User);

//     // cari user berdasarkan username ATAU email
//     const user = await userRepo.findOne({
//       where: [
//         { username: username },
//         { email: email }
//       ]
//     });

//     if (!user) {
//       return res.status(401).json({ message: "User tidak ditemukan" });
//     }

//     // // Ganti 'AppDataSource' dengan nama export data source Anda jika berbeda
//     // const hasPermitRepo = AppDataSource.getRepository(HasPermit);

//     // // Menggunakan Query Builder untuk JOIN
//     // const hasPermit = await hasPermitRepo
//     //     .createQueryBuilder("hasPermit") // Alias utama untuk tabel HasPermit

//     //     // 1. Melakukan JOIN ke tabel yang berelasi (misalnya, Permission)
//     //     // Asumsi: Entity HasPermit memiliki relasi bernama 'permission' ke Entity Permission
//     //     .leftJoinAndSelect("hasPermit.permission", "perm")

//     //     // 2. Menentukan kolom yang ingin diambil (Proyeksi)
//     //     .select([
//     //         "hasPermit.role_id", // Ambil role_id dari HasPermit
//     //         "perm.name",    // Ambil kolom 'name' dari Entity Permission
//     //     ])

//     //     // 3. Menambahkan klausa WHERE
//     //     .where("hasPermit.role_id = :roleId", { roleId: user.role_id })

//     //     // 4. Jalankan Query dan ambil hasilnya
//     //     .getMany(); // Gunakan getMany() jika hasilnya lebih dari satu baris

//     // // results akan berisi array objek dengan struktur kolom yang Anda definisikan di .select()

//     const hasPermitRepo = AppDataSource.getRepository(HasPermit);

//     const hasPermit = await hasPermitRepo.find({
//       where: {
//         // Filternya adalah: Di dalam relasi 'role', kolom 'id' harus sama dengan 'user.role_id'
//         role: {
//           id: user.role_id
//         }
//       },
//     });

//     const permissionNames = hasPermit.map(item => item.permission.name);

//     // cek password
//     const match = await bcrypt.compare(password, user.password);

//     if (!match) {
//       return res.status(401).json({ message: "Password salah" });
//     }

//     // generate JWT token
//     const token = jwt.sign(
//       {
//         id: user.id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         role: user.role_id,
//         hasPermit: permissionNames
//       },
//       process.env.JWT_SECRET || "secretKey123", // ubah ke env
//       { expiresIn: '1d' }
//     );

//     res.json({
//       message: "Login berhasil",
//       token: "Bearer " + token,
//       user: {
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         login: true,
//         hasPermit: permissionNames
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: err.message });
//   }
// };
