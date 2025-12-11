// src/controllers/admin/divisioncontroller.js
const db = require("../../models");
const { Op } = db.Sequelize || require("sequelize");

const Division = db.Division;
const Zone = db.Zone;
const State = db.State;
const City = db.City;
const Corporation = db.Corporation;

/**
 * Helpers (cascade)
 */
exports.getStatesForDivision = async (req, res) => {
  try {
    const states = await State.findAll({ attributes: ["id", "name"], order: [["name", "ASC"]] });
    return res.status(200).json({ status: 1, message: "States fetched", data: states.map(s => (typeof s.toJSON === "function" ? s.toJSON() : s)) });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

exports.getCitiesForDivision = async (req, res) => {
  try {
    const { state_id } = req.params;
    if (!state_id) return res.status(400).json({ status: 0, message: "state_id is required" });
    const cities = await City.findAll({ where: { state_id }, attributes: ["id", "name", "state_id"], order: [["name", "ASC"]] });
    return res.status(200).json({ status: 1, message: "Cities fetched", data: cities.map(c => (typeof c.toJSON === "function" ? c.toJSON() : c)) });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

exports.getCorporationsForDivision = async (req, res) => {
  try {
    const { city_id } = req.params;
    if (!city_id) return res.status(400).json({ status: 0, message: "city_id is required" });
    const corporations = await Corporation.findAll({ where: { city_id }, attributes: ["id", "name", "city_id", "state_id"], order: [["name", "ASC"]] });
    return res.status(200).json({ status: 1, message: "Corporations fetched", data: corporations.map(c => (typeof c.toJSON === "function" ? c.toJSON() : c)) });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

exports.getZonesForDivision = async (req, res) => {
  try {
    const { corporation_id } = req.params;
    if (!corporation_id) return res.status(400).json({ status: 0, message: "corporation_id is required" });
    const zones = await Zone.findAll({ where: { corporation_id }, attributes: ["id", "name", "corporation_id"], order: [["name", "ASC"]] });
    return res.status(200).json({ status: 1, message: "Zones fetched", data: zones.map(z => (typeof z.toJSON === "function" ? z.toJSON() : z)) });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

/**
 * Division CRUD + GET /division/:id enhancements
 */
exports.getAllDivisions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 10);
    const search = (req.query.search || "").trim();
    const zone_id = req.query.zone_id ? parseInt(req.query.zone_id, 10) : null;
    const offset = (page - 1) * limit;
    const where = {};
    if (zone_id) where.zone_id = zone_id;
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];

    const { rows, count: total } = await Division.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit, offset,
      include: [{ model: Zone, as: "zone", attributes: ["id", "name", "corporation_id"] }],
    });

    const plainRows = rows.map(r => (typeof r.toJSON === "function" ? r.toJSON() : r));
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      status: 1, message: "Divisions fetched successfully", data: plainRows,
      meta: { total, page, limit, totalPages, from: total === 0 ? 0 : offset + 1, to: Math.min(offset + plainRows.length, total) }
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

// GET /division/:id -> returns division + helpers + selected ids (ensures selected items included)
exports.getDivisionById = async (req, res) => {
  try {
    const id = req.params.id;
    const divInst = await Division.findByPk(id, {
      include: [
        {
          model: Zone,
          as: "zone",
          attributes: ["id", "name", "corporation_id"],
          include: [
            {
              model: Corporation,
              as: "corporation",
              attributes: ["id", "name", "city_id", "state_id"]
            }
          ]
        }
      ]
    });

    if (!divInst) return res.status(404).json({ status: 0, message: "Division not found" });

    const division = typeof divInst.toJSON === "function" ? divInst.toJSON() : divInst;
    const corp = division.zone && division.zone.corporation ? division.zone.corporation : null;

    const helpers = {
      state_id: corp ? corp.state_id : null,
      city_id: corp ? corp.city_id : null,
      corporation_id: corp ? corp.id : null,
      states: [], cities: [], corporations: [], zones: []
    };

    // states (always)
    const rawStates = await State.findAll({ attributes: ["id", "name"], order: [["name", "ASC"]] });
    helpers.states = rawStates.map(s => (typeof s.toJSON === "function" ? s.toJSON() : s));

    // if state_id present -> cities of that state
    if (helpers.state_id) {
      const rawCities = await City.findAll({ where: { state_id: helpers.state_id }, attributes: ["id", "name", "state_id"], order: [["name", "ASC"]] });
      helpers.cities = rawCities.map(c => (typeof c.toJSON === "function" ? c.toJSON() : c));
    }

    // corporations for city
    if (helpers.city_id) {
      const rawCorps = await Corporation.findAll({ where: { city_id: helpers.city_id }, attributes: ["id", "name", "city_id", "state_id"], order: [["name", "ASC"]] });
      helpers.corporations = rawCorps.map(c => (typeof c.toJSON === "function" ? c.toJSON() : c));
    }

    // zones for corporation
    if (helpers.corporation_id) {
      const rawZones = await Zone.findAll({ where: { corporation_id: helpers.corporation_id }, attributes: ["id", "name", "corporation_id"], order: [["name", "ASC"]] });
      helpers.zones = rawZones.map(z => (typeof z.toJSON === "function" ? z.toJSON() : z));
    }

    // Safety: if any of the scoped lists are empty but an id exists (maybe orphaned),
    // fetch the single record and include it so frontend can show selected name.
    if (helpers.city_id && helpers.cities.length === 0) {
      const singleCity = await City.findByPk(helpers.city_id, { attributes: ["id", "name", "state_id"] });
      if (singleCity) helpers.cities = [typeof singleCity.toJSON === "function" ? singleCity.toJSON() : singleCity];
    }
    if (helpers.corporation_id && helpers.corporations.length === 0) {
      const singleCorp = await Corporation.findByPk(helpers.corporation_id, { attributes: ["id", "name", "city_id", "state_id"] });
      if (singleCorp) helpers.corporations = [typeof singleCorp.toJSON === "function" ? singleCorp.toJSON() : singleCorp];
    }
    if (division.zone_id && helpers.zones.length === 0) {
      const singleZone = await Zone.findByPk(division.zone_id, { attributes: ["id", "name", "corporation_id"] });
      if (singleZone) helpers.zones = [typeof singleZone.toJSON === "function" ? singleZone.toJSON() : singleZone];
    }

    return res.status(200).json({ status: 1, message: "Division fetched", data: { division, helpers } });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

// getDivisionsByZone, createDivision, updateDivision, updateDivisionStatus, deleteDivision
// (copy your existing implementations from previous file — unchanged)
exports.getDivisionsByZone = async (req, res) => {
  try {
    const { zone_id } = req.params;
    const divisions = await Division.findAll({ where: { zone_id }, order: [["name", "ASC"]], attributes: ["id", "zone_id", "name", "status", "created_at", "updated_at"] });
    return res.status(200).json({ status: 1, message: "Divisions fetched", data: divisions.map(d => (typeof d.toJSON === "function" ? d.toJSON() : d)) });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

exports.createDivision = async (req, res) => {
  try {
    const { zone_id, name, status } = req.body;
    if (!zone_id || !name) return res.status(400).json({ status: 0, message: "zone_id and name are required" });
    const zone = await Zone.findByPk(zone_id);
    if (!zone) return res.status(404).json({ status: 0, message: "Zone not found" });
    const division = await Division.create({ zone_id, name: String(name).trim(), status: typeof status !== "undefined" ? status : 1 });
    return res.status(201).json({ status: 1, message: "Division created", data: typeof division.toJSON === "function" ? division.toJSON() : division });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

exports.updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { zone_id, name, status } = req.body;
    const division = await Division.findByPk(id);
    if (!division) return res.status(404).json({ status: 0, message: "Division not found" });
    const finalZoneId = typeof zone_id !== "undefined" ? zone_id : division.zone_id;
    const zone = await Zone.findByPk(finalZoneId);
    if (!zone) return res.status(404).json({ status: 0, message: "Zone not found" });
    division.zone_id = finalZoneId;
    if (typeof name !== "undefined") division.name = String(name).trim();
    if (typeof status !== "undefined") division.status = status;
    division.updated_at = new Date();
    await division.save();
    return res.status(200).json({ status: 1, message: "Division updated", data: typeof division.toJSON === "function" ? division.toJSON() : division });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

exports.updateDivisionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (typeof status === "undefined") return res.status(400).json({ status: 0, message: "status is required" });
    const division = await Division.findByPk(id);
    if (!division) return res.status(404).json({ status: 0, message: "Division not found" });
    division.status = status;
    division.updated_at = new Date();
    await division.save();
    return res.status(200).json({ status: 1, message: "Status updated", data: typeof division.toJSON === "function" ? division.toJSON() : division });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

exports.deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const division = await Division.findByPk(id);
    if (!division) return res.status(404).json({ status: 0, message: "Division not found" });
    await division.destroy();
    return res.status(200).json({ status: 1, message: "Division deleted" });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};
