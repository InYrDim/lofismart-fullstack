const AppDataSource = require('../config/data-source');

// Entities / Model
const Profile = require('../db/entities/Profile');
const CatApp = require('../db/entities/CatApp');
const Config = require('../db/entities/Config');
const DataChange = require('../db/entities/DataChange');
const DataRecieve = require('../db/entities/DataReceive');
const Export = require('../db/entities/SyncExport');
const Import = require('../db/entities/SyncImport');
const FailedJob = require('../db/entities/Failed_job');
const Notification = require('../db/entities/Notification');

const generateId = require('../middleware/generateId');
const watch = require('../middleware/dataChange');

// Profile
exports.profileList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.profileById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
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

exports.profileCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const id = generateId(8);
    const profileData = {
      id: id,
      ...req.body
    }
    const data = repo.create(profileData);
    await repo.save(data);

    return res.status(201).json({
      message: "Profile created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.profileUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const id = req.params.id;
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    const updated = repo.merge(data, req.body);
    await repo.save(updated);
    return res.status(200).json({
      message: "Profile updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.profileDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.profileSoftDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const result = await repo.softDelete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CatApp
exports.catAppList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CatApp);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.catAppById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CatApp);
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

exports.catAppCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CatApp);
    const id = generateId(4);
    const createData = {
      id: id,
      ...req.body
    }
    const data = repo.create(createData);
    await repo.save(data);

    return res.status(201).json({
      message: "Category App created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.catAppUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CatApp);
    const id = req.params.id;
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    const updated = repo.merge(data, req.body);
    await repo.save(updated);
    return res.status(200).json({
      message: "Category App updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.catAppDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CatApp);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Config
exports.configList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Config);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.configById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Config);
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

exports.configGet = async (id) => {
  try {
    const repo = AppDataSource.getRepository(Config);
    const data = await repo.findOne({
      where: {
        id
      }
    });
    return data;
  } catch (err) {
    throw err;
  }
};

exports.configCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Config);
    const id = 1;
    const findData = await repo.findOne({
      where: {
        id
      }
    });
    if (findData) {
      return res.status(404).json({ message: 'Configuration app already defined, please update if you want to change it' });
    }
    const createData = {
      id: id,
      ...req.body
    }
    const data = repo.create(createData);
    await repo.save(data);

    return res.status(201).json({
      message: "Config created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.configUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Config);
    const id = req.params.id;
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    const updated = repo.merge(data, req.body);
    await repo.save(updated);
    return res.status(200).json({
      message: "Config updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.configDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Config);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DataChange
exports.dataChangeList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(DataChange);
    const data = await repo.find({
      take: 1000, // Tetap gunakan limit 10 dari permintaan sebelumnya
      order: {
        created_at: 'DESC', // ASC untuk Ascending (tertua ke terbaru), DESC untuk Descending (terbaru ke tertua)
      },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.dataChangeCreate = (branch, table, action, data, attachment) => {
  try {
    const repo = AppDataSource.getRepository(DataChange);
    const createData = {
      branch_id: branch,
      table_name: table,
      pk_id: data.id,
      action: action,
      payload: data,
      attachment: attachment
    }
    const create = repo.create(createData);
    repo.save(create);
  } catch (err) {
    throw err;
  }
};

exports.dataChangeUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(DataChange);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
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

exports.dataChangeDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(DataChange);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DataRecieve
exports.dataRecieveList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(DataRecieve);
    const data = await repo.find({
      take: 1000, // Tetap gunakan limit 10 dari permintaan sebelumnya
      order: {
        created_at: 'DESC', // ASC untuk Ascending (tertua ke terbaru), DESC untuk Descending (terbaru ke tertua)
      },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.dataRecieveCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(DataRecieve);
    const data = repo.create(req.body);
    await repo.save(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.dataRecieveUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(DataRecieve);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
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

exports.dataRecieveDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(DataRecieve);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export
exports.exportList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Export);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.exportCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Export);
    const data = repo.create(req.body);
    await repo.save(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Export);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
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

exports.exportDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Export);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Import
exports.importList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Import);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.importCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Import);
    const data = repo.create(req.body);
    await repo.save(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.importUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Import);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
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

exports.importDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Import);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// FailedJob
exports.failedJobList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(FailedJob);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.failedJobCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(FailedJob);
    const data = repo.create(req.body);
    await repo.save(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.failedJobUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(FailedJob);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
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

exports.failedJobDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(FailedJob);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Notification
exports.notificationList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Notification);
    const data = await repo.find();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.notificationCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Notification);
    const data = repo.create(req.body);
    await repo.save(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.notificationUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Notification);
    const id = req.params.id;

    // 1. Find existing
    const data = await repo.findOne({ where: { id } });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
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

exports.notificationDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Notification);
    const result = await repo.delete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};