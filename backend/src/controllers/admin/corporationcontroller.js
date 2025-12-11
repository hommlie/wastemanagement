// backend/src/controllers/admin/corporationcontroller.js
const db = require("../../models");
const Corporation = db.Corporation;
const State = db.State;
const City = db.City;
const { Op } = db.Sequelize;

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const search = (req.query.search || "").trim();
    const stateId = req.query.state_id ? parseInt(req.query.state_id, 10) : null;
    const cityId = req.query.city_id ? parseInt(req.query.city_id, 10) : null;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (stateId) where.state_id = stateId;
    if (cityId) where.city_id = cityId;

    const { rows, count } = await Corporation.findAndCountAll({
      where,
      include: [
        {
          model: State,
          as: "state",        // 👈 IMPORTANT
          attributes: ["id", "name"]
        },
        {
          model: City,
          as: "city",         // 👈 IMPORTANT
          attributes: ["id", "name"]
        }
      ],
      order: [["id", "DESC"]],
      limit,
      offset
    });

    const totalPages = Math.ceil(count / limit) || 1;
    const from = count === 0 ? 0 : offset + 1;
    const to = offset + rows.length;

    return res.json({
      status: 1,
      message: "Corporations fetched",
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages,
        from,
        to
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: err.message || "Failed to fetch corporations"
    });
  }
};

// Get States
exports.getState = async (req, res) => {
  try {
    const states = await State.findAll({
      attributes: ["id", "name", "status", "code", "created_at", "updated_at"],
      order: [["name", "ASC"]]
    });

    return res.status(200).json({
      status: 1,
      message: "All states fetched successfully",
      data: states
    });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

// Get Cities by State
exports.getCity = async (req, res) => {
  try {
    const { state_id } = req.params;

    const cities = await City.findAll({
      where: { state_id },
      order: [["name", "ASC"]],
      attributes: [
        "id",
        "state_id",
        "name",
        "city_code",
        "status",
        "created_at",
        "updated_at"
      ]
    });

    return res.status(200).json({
      status: 1,
      message: "Cities fetched successfully",
      data: cities
    });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const corporation = await Corporation.findByPk(id, {
      include: [
        {
          model: State,
          as: "state",           // 👈 IMPORTANT
          attributes: ["id", "name"]
        },
        {
          model: City,
          as: "city",            // 👈 IMPORTANT
          attributes: ["id", "name"]
        }
      ]
    });

    if (!corporation) {
      return res.status(404).json({
        status: 0,
        message: "Corporation not found"
      });
    }

    return res.json({
      status: 1,
      message: "Corporation fetched",
      data: corporation
    });
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: err.message || "Failed to fetch corporation"
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { state_id, city_id, name, status } = req.body;

    if (!state_id || !city_id || !name) {
      return res.status(400).json({
        status: 0,
        message: "state_id, city_id and name are required"
      });
    }

    const corp = await Corporation.create({
      state_id,
      city_id,
      name: name.trim(),
      status: typeof status !== "undefined" ? status : 1
    });

    return res.json({
      status: 1,
      message: "Corporation created",
      data: corp
    });
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: err.message || "Failed to create corporation"
    });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { state_id, city_id, name, status } = req.body;

    const corp = await Corporation.findByPk(id);
    if (!corp) {
      return res.status(404).json({
        status: 0,
        message: "Corporation not found"
      });
    }

    await corp.update({
      state_id: typeof state_id !== "undefined" ? state_id : corp.state_id,
      city_id: typeof city_id !== "undefined" ? city_id : corp.city_id,
      name: typeof name !== "undefined" ? name.trim() : corp.name,
      status: typeof status !== "undefined" ? status : corp.status
    });

    return res.json({
      status: 1,
      message: "Corporation updated",
      data: corp
    });
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: err.message || "Failed to update corporation"
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    
    const corp = await Corporation.findByPk(id);
    if (!corp) {
      return res.status(404).json({
        status: 0,
        message: "Corporation not found"
      });
    }
    
    await corp.update({ status });
    return res.json({
      status: 1,
      message: "Corporation status updated",
      data: corp
    });
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: err.message || "Failed to update corporation status"
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    const corp = await Corporation.findByPk(id);
    if (!corp) {
      return res.status(404).json({
        status: 0,
        message: "Corporation not found"
      });
    }

    await corp.destroy();

    return res.json({
      status: 1,
      message: "Corporation deleted"
    });
  } catch (err) {
    return res.status(500).json({
      status: 0,
      message: err.message || "Failed to delete corporation"
    });
  }
};
