const AppDataSource = require('../config/data-source');

// Entities / Model
const Profile = require('../db/entities/Profile');
const User = require('../db/entities/User');

const generateId = require('../middleware/generateId');

// Outlet (Profile with type='OUTLET')
exports.outletList = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const data = await repo.find({
      where: {
        type: 'OUTLET'
      }
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.outletById = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const id = req.params.id;
    const data = await repo.findOne({
      where: {
        id,
        type: 'OUTLET'
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

exports.outletCreate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const id = generateId(8);
    const outletData = {
      id: id,
      type: 'OUTLET',
      ...req.body
    };
    const data = repo.create(outletData);
    await repo.save(data);

    return res.status(201).json({
      message: "Outlet created successfully",
      data: data
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.outletUpdate = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const id = req.params.id;
    const data = await repo.findOne({ 
      where: { 
        id,
        type: 'OUTLET'
      } 
    });

    if (!data) {
      return res.status(404).json({ message: 'Data not found' });
    }
    const updated = repo.merge(data, req.body);
    await repo.save(updated);
    return res.status(200).json({
      message: "Outlet updated successfully",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.outletDelete = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Profile);
    const result = await repo.softDelete(req.params.id);

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.json({ message: 'Outlet soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supervisor Assignment
exports.getSupervisors = async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const supervisors = await userRepo.find({
      where: {
        role_id: 'SPVR'
      },
      select: ['id', 'name', 'username', 'market_id']
    });
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assignSupervisor = async (req, res) => {
  try {
    const { user_id, outlet_id } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const profileRepo = AppDataSource.getRepository(Profile);

    // Verify user exists and is a supervisor
    const user = await userRepo.findOne({ where: { id: user_id, role_id: 'SPVR' } });
    if (!user) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    // Verify outlet exists
    const outlet = await profileRepo.findOne({ where: { id: outlet_id, type: 'OUTLET' } });
    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found' });
    }

    // Assign
    user.market_id = outlet_id;
    await userRepo.save(user);

    // Also update via QueryBuilder for safety (bypassing TypeORM relation issues)
    await userRepo.createQueryBuilder()
      .update(User)
      .set({ market_id: outlet_id })
      .where("id = :id", { id: user_id })
      .execute();

    res.json({ message: 'Supervisor assigned successfully', data: { user_id, outlet_id } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
