const AppDataSource = require('../config/data-source');

// Entities / Model
const User = require('../db/entities/User');
const Member = require('../db/entities/Member');
const Session = require('../db/entities/Session');
const Role = require('../db/entities/Role');
const Permission = require('../db/entities/Permission');
const Supplier = require('../db/entities/Supplier');
const HasPermit = require('../db/entities/HasPermit');

const generateId = require('../middleware/generateId');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const baseDir = path.join(process.cwd(), "upload");
const userDir = path.join(baseDir, "user");

// User
exports.userList = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .leftJoinAndSelect('user.market', 'market')
    .select([
        'user.id',
        'user.name',
        'user.username',
        'user.email',
        'user.role_id',
        'role.id',
        'role.name',
        'role.guard_name',
        'market.id',
        'market.name',
        'user.market_id',
        'user.permissions',
        'user.image'
    ])
    .getMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.userById = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const id = req.params.id;
    const data = await userRepo.createQueryBuilder('user')
    .leftJoinAndSelect('user.role', 'role')
    .leftJoinAndSelect('user.market', 'market')
    .select([
      'user.id', 
      'user.username', 
      'user.email', 
      'user.role_id',
      'role.id', 
      'role.name',
      'role.guard_name',
      'market.id',
      'market.name',
      'user.permissions',
      'user.image',
      'user.market_id'
    ])
    .where('user.id = :id', { id: id }) // Menambahkan kondisi WHERE yang spesifik ke user.id
    .getOne();
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.userCreate = async (req, res, next) => {
  // --- Setup Path for Manual Storage ---
  let fileName = null;

  if (!fs.existsSync(userDir)) {
    try {
      fs.mkdirSync(userDir, { recursive: true });
    } catch (dirError) {
      return next(dirError);
    }
  }

  try {
    const repo = AppDataSource.getRepository(User);
    const id = generateId(8);
    const { market_id, role_id, password, permissions, ...rest } = req.body;
    
    if (req.file) {
      const fileExtension = path.extname(req.file.originalname);
      fileName = `${id}${fileExtension}`;
      const filePath = path.join(userDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
    }

    const createData = {
      id: id,
      permissions: permissions || null,
      image: fileName,
      ...rest
    };

    if (password) {
      createData.password = await bcrypt.hash(password, 10);
    }

    if (role_id) {
      createData.role = { id: role_id };
    }

    const mId = (market_id && market_id !== 'null') ? market_id : null;
    createData.market_id = mId;
    createData.market = mId ? { id: mId } : null;

    const data = repo.create(createData);
    await repo.save(data);

    return res.status(201).json({
      message: "User created successfully",
      data: data
    });
  } catch (err) {
    if (fileName) {
      const filePathToClean = path.join(userDir, fileName);
      try {
        if (fs.existsSync(filePathToClean)) {
          fs.unlinkSync(filePathToClean);
        }
      } catch (unlinkError) {
        console.error(`Failed to cleanup file: ${unlinkError.message}`);
      }
    }
    next(err);
  }
};

exports.userUpdate = async (req, res, next) => {
  let fileName = null;
  let oldImagePath = null;

  if (!fs.existsSync(userDir)) {
    try {
      fs.mkdirSync(userDir, { recursive: true });
    } catch (dirError) {
      return next(dirError);
    }
  }

  try {
    const repo = AppDataSource.getRepository(User);
    const id = req.params.id;

    const data = await repo.findOne({ where: { id }, relations: ['role', 'market'] });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    if (data.id === 'ADMN001' || data.role?.id === 'ADMN') {
      return res.status(403).json({ message: 'Super Admin account cannot be modified via API' });
    }

    if (data.image) {
      oldImagePath = path.join(userDir, data.image);
    }

    const { market_id, role_id, password, permissions, ...rest } = req.body;
    const updateData = { ...rest };

    if (permissions !== undefined) {
      updateData.permissions = permissions;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (role_id) {
      updateData.role = { id: role_id };
    }

    if (req.file) {
      const fileExtension = path.extname(req.file.originalname);
      fileName = `${id}${fileExtension}`;
      const newFilePath = path.join(userDir, fileName);

      if (oldImagePath && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      fs.writeFileSync(newFilePath, req.file.buffer);
      updateData.image = fileName;
    } else if (req.body.image === null || req.body.image === undefined || req.body.image === "" || req.body.image === "null") {
       // Only delete if explicitly requested to be empty
       if (req.body.image === null || req.body.image === "null" || req.body.image === "") {
          if (oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
          updateData.image = null;
       }
    }

    const updated = repo.merge(data, updateData);

    // Set relations and IDs explicitly after merge
    if (role_id) {
      updated.role = { id: role_id };
    }

    if (market_id !== undefined) {
      const mId = (market_id && market_id !== 'null') ? market_id : null;
      updated.market_id = mId;
      updated.market = mId ? { id: mId } : null;
    }

    await repo.save(updated);

    // Extra safety: Explicitly update the columns via QueryBuilder to bypass any TypeORM relation quirks
    const rawUpdate = {};
    if (role_id) rawUpdate.role_id = role_id;
    if (market_id !== undefined) rawUpdate.market_id = (market_id && market_id !== 'null') ? market_id : null;

    if (Object.keys(rawUpdate).length > 0) {
      await repo.createQueryBuilder()
        .update(User)
        .set(rawUpdate)
        .where("id = :id", { id: updated.id })
        .execute();
    }

    // Reload updated data to return correctly with full relations
    const reloaded = await repo.findOne({ where: { id: updated.id }, relations: ['role', 'market'] });
    const responseData = reloaded || updated;

    return res.status(200).json({ 
      message: "User updated successfully",
      data: responseData
    });
  } catch (err) {
    if (fileName) {
      const filePathToClean = path.join(userDir, fileName);
      try {
        if (fs.existsSync(filePathToClean)) {
          fs.unlinkSync(filePathToClean);
        }
      } catch (unlinkError) {
        console.error(`Failed to cleanup file: ${unlinkError.message}`);
      }
    }
    next(err);
  }
};

exports.userDelete = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const id = req.params.id;

    // Protection for Super Admin
    const user = await userRepo.findOne({ where: { id }, relations: ['role'] });
    if (user?.id === 'ADMN001' || user?.role?.id === 'ADMN') {
      return res.status(403).json({ message: 'Super Admin account cannot be deleted' });
    }

    const result = await userRepo.delete(id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.userSoftDelete = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const id = req.params.id;

    // Protection for Super Admin
    const user = await userRepo.findOne({ where: { id }, relations: ['role'] });
    if (user?.id === 'ADMN001' || user?.role?.id === 'ADMN') {
      return res.status(403).json({ message: 'Super Admin account cannot be deleted' });
    }

    const result = await userRepo.softDelete(id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Member
exports.memberList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Member);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.memberById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Member);
    const id = req.params.id;
    const data = await repo.findOne({
      where: {
        id
      }
    });
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.memberCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Member);
    const id = generateId(10);
    const createData = {
      id: id,
      ...req.body
    }
    const data = repo.create(createData);
    await repo.save(data);

    return res.status(201).json({
      message: "Member created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.memberUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Member);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    // 2. Merge request body to entity
    const updated = repo.merge(data, req.body);

    // 3. Save the updated entity
    await repo.save(updated);

    return res.status(200).json({ // Gunakan status 200 untuk update yang berhasil
      message: "Member updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.memberDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Member);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.memberSoftDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Member);
    const result = await repo.softDelete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Session

exports.sessionShow = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Session);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.sessionList = async () => {
  try {
    const repo = AppDataSource.getRepository(Session);
    const data = await repo.find();
    return data;
  } catch (err) {
    throw err;
  }
};

exports.sessionById = async (id) => {
  try {
    const repo = AppDataSource.getRepository(Session);
    const data = await repo.findOne({
      where: {
        id
      },
      order: {
        // Mengurutkan berdasarkan kolom 'created_at' secara menurun (Descending)
        // Ini memastikan entitas dengan created_at terbaru berada di urutan teratas.
        created_at: 'DESC' 
      }
    });
    return data;
  } catch (err) {
    // Melempar error agar ditangani oleh fungsi pemanggil (middleware/controller)
    throw err;
  }
};

exports.sessionCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Session);
    const create = repo.create(req.body);
    await repo.save(create);
    res.json(create);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sessionUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Session);
    const id = req.params.id;

    // 1. Find existing
    const session = await repo.findOne({ where: { id } });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // 2. Merge request body to entity
    repo.merge(session, req.body);

    // 3. Save the updated entity
    const updated = await repo.save(session);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sessionDelete = async (id) => {
  try {
    const repo = AppDataSource.getRepository(Session);
    const result = await repo.delete(id);

    if (result.affected === 0) {
      const error = new Error("Session not found.");
      error.status = 500;
      throw error;
    }

    return result.affected;
  } catch (err) {
    throw err;
  }
};

exports.sessionDeleteExpired = async () => {
  try {
    const repo = AppDataSource.getRepository(Session);
    const currentTime = new Date(); // Ambil waktu saat ini

    // Gunakan QueryBuilder untuk menghapus banyak baris berdasarkan kondisi
    const result = await repo.createQueryBuilder()
      .delete() // Tentukan operasi DELETE
      .from(Session) // Tentukan entitas target
      // Tentukan kondisi WHERE: Hapus jika expired_at kurang dari waktu saat ini
      .where("expired_at < :currentTime", { currentTime })
      .execute(); // Jalankan query

    console.log(`Pembersihan sesi selesai. ${result.affected} sesi kedaluwarsa dihapus.`);
    
    // Kembalikan jumlah baris yang terpengaruh (dihapus)
    return { 
      message: 'Expired sessions cleaned up successfully.', 
      deletedCount: result.affected 
    };
    
  } catch (err) {
    // Lempar error agar ditangani oleh fungsi pemanggil atau sistem logging
    throw new Error("Gagal menghapus sesi yang kedaluwarsa."); 
  }
};

// Role
exports.roleList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Role);
    const data = await repo.find({
      relations: ['hasPermits', 'hasPermits.permission'],
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.roleById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Role);
    const id = req.params.id;
    const data = await repo.findOne({
      where: {
        id
      },
      relations: ['hasPermits', 'hasPermits.permission'],
    });
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.roleCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Role);
    const id = generateId(4);
    const createData = {
      id: id,
      ...req.body
    }
    const data = repo.create(createData);
    await repo.save(data);

    return res.status(201).json({
      message: "Role created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.roleUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Role);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    // 2. Merge request body to entity
    const updated = repo.merge(data, req.body);

    // 3. Save the updated entity
    await repo.save(updated);

    return res.status(200).json({ // Gunakan status 200 untuk update yang berhasil
      message: "Role updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.roleDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Role);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Permission
exports.permissionList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Permission);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.permissionById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Permission);
    const id = req.params.id;
    const data = await repo.findOne({
      where: {
        id
      }
    });
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.permissionCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Permission);
    const id = generateId(4);
    
    const bodyData = {
      id: id,
      ...req.body
    };

    const data = repo.create(bodyData);
    await repo.save(data);

    return res.status(201).json({
      message: "Permission created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.permissionUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Permission);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }

    // 2. Merge request body to entity
    const updated = repo.merge(data, req.body);

    // 3. Save the updated entity
    await repo.save(updated);

    return res.status(200).json({ // Gunakan status 200 untuk update yang berhasil
      message: "Permission updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.permissionDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Permission);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    res.json({ message: 'Permission deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supplier
exports.supplierList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.supplierById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const id = req.params.id;
    const data = await repo.findOne({
      where: {
        id
      }
    });
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.supplierCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const id = generateId(8);
    const supplierData = {
      id: id,
      ...req.body
    }
    const data = repo.create(supplierData);
    await repo.save(data);

    return res.status(201).json({
      message: "Supplier created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.supplierUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const id = req.params.id;
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    const updated = repo.merge(data, req.body);
    await repo.save(updated);
    return res.status(200).json({
      message: "Supplier updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.supplierDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.supplierSoftDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Supplier);
    const result = await repo.softDelete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// HasPermit
exports.hasPermitList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(HasPermit);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.hasPermitById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(HasPermit);
    const id = req.params.id;
    const data = await repo.findOne({
      where: {
        id
      }
    });
    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.hasPermitEdit = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(HasPermit);

    const { role, hasPermit } = req.body;

    // buat array of rows
    const rows = hasPermit.map(permitId => ({
      id: generateId(8),
      role,
      permission: permitId
    }));

    // delete sebelum create
    await repo.delete({ role: req.body.role });


    // create banyak row sekaligus
    const created = repo.create(rows);

    // save sekaligus
    await repo.save(created);

    return res.status(200).json({
      message: "Has Permit edited successfully",
      data: rows
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.hasPermitCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(HasPermit);
    const create = repo.create(req.body);
    await repo.save(create);
    res.json(create);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.hasPermitUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(HasPermit);
    const id = req.params.id;

    // 1. Find existing
    const hasPermit = await repo.findOne({ where: { id } });

    if (!hasPermit) {
      return res.status(404).json({ message: 'Has Permit not found' });
    }

    // 2. Merge request body to entity
    repo.merge(hasPermit, req.body);

    // 3. Save the updated entity
    const updated = await repo.save(hasPermit);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.hasPermitDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(HasPermit);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Has Permit not found' });
    }

    res.json({ message: 'Has Permit deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};