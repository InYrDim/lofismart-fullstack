const AppDataSource = require('../config/data-source');

// Entities / Model
const Profile = require('../db/entities/Profile');

const generateId = require('../middleware/generateId');
const watch = require('../middleware/dataChange');

// Warehouse (Profile with type='GUDANG')
exports.warehouseList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const data = await repo.find({
      where: {
        type: 'GUDANG'
      }
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.warehouseById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const id = req.params.id;
    const data = await repo.findOne({
      where: {
        id,
        type: 'GUDANG'
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

exports.warehouseCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const id = generateId(8);
    const warehouseData = {
      id: id,
      type: 'GUDANG',
      ...req.body
    };
    const data = repo.create(warehouseData);
    await repo.save(data);

    return res.status(201).json({
      message: "Warehouse created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.warehouseUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const id = req.params.id;
    const data = await repo.findOne({ 
      where: { 
        id,
        type: 'GUDANG'
      } 
    });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    const updated = repo.merge(data, req.body);
    await repo.save(updated);
    return res.status(200).json({
      message: "Warehouse updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.warehouseDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const result = await repo.softDelete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Warehouse soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};