// src/controllers/admin/zonecontroller.js
const db = require("../../models");
const { Op } = db.Sequelize || require("sequelize");

const Zone = db.Zone;
const State = db.State;
const City = db.City;
const Corporation = db.Corporation;

// ----------------------------------------------------
// Zones list
// GET /zone?search=&page=&limit=&corporation_id=
// ----------------------------------------------------
exports.getAllZones = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 10);
    const search = (req.query.search || "").trim();
    const corporation_id = req.query.corporation_id ? parseInt(req.query.corporation_id, 10) : null;
    const offset = (page - 1) * limit;

    const where = {};
    if (corporation_id) where.corporation_id = corporation_id;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count: total } = await Zone.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit,
      offset,
      include: [
        {
          model: Corporation,
          as: "corporation",
          attributes: ["id", "name", "state_id", "city_id", "status"],
          include: [
            { model: State, as: "state", attributes: ["id", "name"] },
            { model: City, as: "city", attributes: ["id", "name"] },
          ],
        },
      ],
    });

    // convert Sequelize results to plain objects (safe for frontend)
    const plainRows = rows.map((r) => (typeof r.toJSON === "function" ? r.toJSON() : r));

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      status: 1,
      message: "Zones fetched successfully",
      data: plainRows,
      meta: {
        total,
        page,
        limit,
        totalPages,
        from: total === 0 ? 0 : offset + 1,
        to: Math.min(offset + plainRows.length, total),
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

// ----------------------------------------------------
// Single zone
// GET /zone/:id
// returns zone (plain) + helper arrays: cities & corporations
// ----------------------------------------------------
exports.getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const zoneInstance = await Zone.findByPk(id, {
      include: [
        {
          model: Corporation,
          as: "corporation",
          attributes: ["id", "name", "state_id", "city_id", "status"],
          include: [
            { model: State, as: "state", attributes: ["id", "name"] },
            { model: City, as: "city", attributes: ["id", "name"] },
          ],
        },
      ],
    });

    if (!zoneInstance) return res.status(404).json({ status: 0, message: "Zone not found" });

    // plain zone object
    const zone = typeof zoneInstance.toJSON === "function" ? zoneInstance.toJSON() : zoneInstance;

    // helper arrays to populate selects
    let cities = [];
    let corporations = [];

    try {
      const corp = zone.corporation || {};
      if (corp && corp.state_id) {
        cities = await City.findAll({
          where: { state_id: corp.state_id },
          attributes: ["id", "state_id", "name", "city_code", "status"],
          order: [["name", "ASC"]],
        });
        cities = cities.map((c) => (typeof c.toJSON === "function" ? c.toJSON() : c));
      }
      if (corp && corp.city_id) {
        corporations = await Corporation.findAll({
          where: { city_id: corp.city_id },
          attributes: ["id", "name", "state_id", "city_id", "status"],
          order: [["name", "ASC"]],
        });
        corporations = corporations.map((c) => (typeof c.toJSON === "function" ? c.toJSON() : c));
      }
    } catch (e) {
      // don't block response on helper fetch errors
      console.error("Helper fetch error in getZoneById:", e.message || e);
    }

    return res.status(200).json({
      status: 1,
      message: "Zone fetched successfully",
      data: { zone, cities, corporations },
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

// ----------------------------------------------------
// Dropdown helpers (State / City / Corporation)
// ----------------------------------------------------

// GET /zone/state
exports.getState = async (req, res) => {
  try {
    const states = await State.findAll({
      attributes: ["id", "name", "status", "code", "created_at", "updated_at"],
      order: [["name", "ASC"]],
    });
    return res.status(200).json({ status: 1, message: "All states fetched successfully", data: states.map(s => (typeof s.toJSON === "function" ? s.toJSON() : s)) });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

// GET /zone/city/:state_id
exports.getCity = async (req, res) => {
  try {
    const { state_id } = req.params;
    const cities = await City.findAll({
      where: { state_id },
      order: [["name", "ASC"]],
      attributes: ["id", "state_id", "name", "city_code", "status", "created_at", "updated_at"],
    });
    return res.status(200).json({ status: 1, message: "Cities fetched successfully", data: cities.map(c => (typeof c.toJSON === "function" ? c.toJSON() : c)) });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

// GET /zone/corporations/:city_id
exports.getCorporationsByCity = async (req, res) => {
  try {
    const { city_id } = req.params;
    const corporations = await Corporation.findAll({
      where: { city_id },
      order: [["name", "ASC"]],
      attributes: ["id", "name", "state_id", "city_id", "status", "created_at", "updated_at"],
    });
    return res.status(200).json({ status: 1, message: "Corporations fetched successfully", data: corporations.map(c => (typeof c.toJSON === "function" ? c.toJSON() : c)) });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

// ----------------------------------------------------
// CREATE ZONE  (no pincodes)
// POST /zone
// ----------------------------------------------------
exports.createZone = async (req, res) => {
  try {
    const { corporation_id, code, name, status } = req.body;

    if (!corporation_id || !name) {
      return res.status(400).json({ status: 0, message: "corporation_id and name are required" });
    }

    const corporation = await Corporation.findByPk(corporation_id);
    if (!corporation) return res.status(404).json({ status: 0, message: "Corporation not found" });

    const zone = await Zone.create({
      corporation_id,
      code: code ? String(code).trim() : null,
      name: String(name).trim(),
      status: typeof status !== "undefined" ? status : 1,
    });

    return res.status(201).json({ status: 1, message: "Zone created successfully", data: typeof zone.toJSON === "function" ? zone.toJSON() : zone });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

// ----------------------------------------------------
// UPDATE ZONE
// PUT /zone/:id
// ----------------------------------------------------
exports.updateZone = async (req, res) => {
  try {
    const { id } = req.params;
    const { corporation_id, code, name, status } = req.body;

    const zone = await Zone.findByPk(id);
    if (!zone) return res.status(404).json({ status: 0, message: "Zone not found" });

    const finalCorporationId = typeof corporation_id !== "undefined" ? corporation_id : zone.corporation_id;
    const corporation = await Corporation.findByPk(finalCorporationId);
    if (!corporation) return res.status(404).json({ status: 0, message: "Corporation not found" });

    zone.corporation_id = finalCorporationId;
    if (typeof code !== "undefined") zone.code = code ? String(code).trim() : null;
    if (typeof name !== "undefined") zone.name = String(name).trim();
    if (typeof status !== "undefined") zone.status = status;
    zone.updated_at = new Date();

    await zone.save();

    return res.status(200).json({ status: 1, message: "Zone updated successfully", data: typeof zone.toJSON === "function" ? zone.toJSON() : zone });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

// ----------------------------------------------------
// UPDATE STATUS
// POST /zone/:id/status
// ----------------------------------------------------
exports.updateZoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status === "undefined") return res.status(400).json({ status: 0, message: "status is required" });

    const zone = await Zone.findByPk(id);
    if (!zone) return res.status(404).json({ status: 0, message: "Zone not found" });

    zone.status = status;
    zone.updated_at = new Date();
    await zone.save();

    return res.status(200).json({ status: 1, message: "Status updated successfully", data: typeof zone.toJSON === "function" ? zone.toJSON() : zone });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

// ----------------------------------------------------
// DELETE ZONE
// DELETE /zone/:id
// ----------------------------------------------------
exports.deleteZone = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await Zone.findByPk(id);
    if (!zone) return res.status(404).json({ status: 0, message: "Zone not found" });

    await zone.destroy();

    return res.status(200).json({ status: 1, message: "Zone deleted successfully" });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};
