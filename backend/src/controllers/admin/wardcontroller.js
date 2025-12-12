// backend/src/controllers/admin/wardcontroller.js
const db = require("../../models");
const { Op, Sequelize, UniqueConstraintError } = db.Sequelize || require("sequelize");

const Ward = db.Ward;
const Division = db.Division;
const Zone = db.Zone;
const Corporation = db.Corporation;
const City = db.City;
const State = db.State;
const WardPincode = db.WardPincode;

console.log("State model (wardcontroller):", !!State);

exports.getStates = async (req, res) => {
  try {
    const data = await State.findAll({ order: [["name", "ASC"]] });
    return res.json({ status: 1, data });
  } catch (e) {
    console.error("getStates error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.getCities = async (req, res) => {
  try {
    const data = await City.findAll({
      where: { state_id: req.params.state_id },
      order: [["name", "ASC"]],
    });
    return res.json({ status: 1, data });
  } catch (e) {
    console.error("getCities error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.getCorporations = async (req, res) => {
  try {
    const data = await Corporation.findAll({
      where: { city_id: req.params.city_id },
      order: [["name", "ASC"]],
    });
    return res.json({ status: 1, data });
  } catch (e) {
    console.error("getCorporations error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.getZones = async (req, res) => {
  try {
    const data = await Zone.findAll({
      where: { corporation_id: req.params.corporation_id },
      order: [["name", "ASC"]],
    });
    return res.json({ status: 1, data });
  } catch (e) {
    console.error("getZones error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.getDivisions = async (req, res) => {
  try {
    const data = await Division.findAll({
      where: { zone_id: req.params.zone_id },
      order: [["name", "ASC"]],
    });
    return res.json({ status: 1, data });
  } catch (e) {
    console.error("getDivisions error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.getAllWards = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 10, 10);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) {
      where.name = { [Op.like]: `%${req.query.search}%` };
    }
    if (req.query.division_id) {
      where.division_id = req.query.division_id;
    }

    const { rows, count } = await Ward.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id", "DESC"]],
      include: [
        {
          model: Division,
          as: "division",
          include: [
            {
              model: Zone,
              as: "zone",
              include: [{ model: Corporation, as: "corporation" }],
            },
          ],
        },
      ],
    });

    return res.json({
      status: 1,
      data: rows,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        from: offset + 1,
        to: offset + rows.length,
      },
    });
  } catch (e) {
    console.error("getAllWards error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

/**
 * getWardById
 * - returns the ward record plus helper lists to populate dropdowns on the frontend,
 *   so dropdowns load immediately when the edit modal opens (fixes "fields not loaded first time" issue).
 */
exports.getWardById = async (req, res) => {
  try {
    const ward = await Ward.findByPk(req.params.id, {
      include: [
        {
          model: Division,
          as: "division",
          include: [
            {
              model: Zone,
              as: "zone",
              include: [
                {
                  model: Corporation,
                  as: "corporation",
                  include: [
                    {
                      model: City,
                      as: "city",
                      include: [{ model: State, as: "state" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!ward) return res.json({ status: 0, message: "Ward not found" });

    // derive hierarchical ids
    const zone = ward.division?.zone;
    const corp = zone?.corporation;
    const city = corp?.city;
    const state = city?.state;

    // Build helpers: lists that the frontend can set immediately
    // - states: all states (for state dropdown)
    // - cities: cities of the state
    // - corporations: corporations of the city
    // - zones: zones of the corporation
    // - divisions: divisions of the zone
    const helpers = {};
    try {
      helpers.states = await State.findAll({ order: [["name", "ASC"]] });
      helpers.cities = state ? await City.findAll({ where: { state_id: state.id }, order: [["name", "ASC"]] }) : [];
      helpers.corporations = city ? await Corporation.findAll({ where: { city_id: city.id }, order: [["name", "ASC"]] }) : [];
      helpers.zones = corp ? await Zone.findAll({ where: { corporation_id: corp.id }, order: [["name", "ASC"]] }) : [];
      helpers.divisions = zone ? await Division.findAll({ where: { zone_id: zone.id }, order: [["name", "ASC"]] }) : [];
    } catch (e) {
      console.warn("helpers fetch partial failure:", e);
    }

    return res.json({
      status: 1,
      data: {
        ward,
        state_id: state?.id || "",
        city_id: city?.id || "",
        corporation_id: corp?.id || "",
        zone_id: zone?.id || "",
        division_id: ward.division?.id || "",
      },
      helpers,
    });
  } catch (e) {
    console.error("getWardById error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.createWard = async (req, res) => {
  try {
    const { division_id, name, status } = req.body;

    if (!division_id || !name)
      return res.json({ status: 0, message: "Division & Name required" });

    const exists = await Division.findByPk(division_id);
    if (!exists) return res.json({ status: 0, message: "Division not found" });

    const ward = await Ward.create({
      division_id,
      name,
      status: status ?? 1,
    });

    return res.json({ status: 1, message: "Ward created", data: ward });
  } catch (e) {
    console.error("createWard error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.updateWard = async (req, res) => {
  try {
    const ward = await Ward.findByPk(req.params.id);
    if (!ward) return res.json({ status: 0, message: "Ward not found" });

    if (req.body.division_id) {
      const valid = await Division.findByPk(req.body.division_id);
      if (!valid) return res.json({ status: 0, message: "Invalid division" });
    }

    ward.division_id = req.body.division_id ?? ward.division_id;
    ward.name = req.body.name ?? ward.name;
    ward.status = req.body.status ?? ward.status;

    await ward.save();

    return res.json({ status: 1, message: "Ward updated", data: ward });
  } catch (e) {
    console.error("updateWard error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.updateWardStatus = async (req, res) => {
  try {
    const ward = await Ward.findByPk(req.params.id);
    if (!ward) return res.json({ status: 0, message: "Ward not found" });

    ward.status = req.body.status;
    await ward.save();

    return res.json({ status: 1, message: "Status updated" });
  } catch (e) {
    console.error("updateWardStatus error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.deleteWard = async (req, res) => {
  try {
    const ward = await Ward.findByPk(req.params.id);
    if (!ward) return res.json({ status: 0, message: "Ward not found" });

    await ward.destroy();

    return res.json({ status: 1, message: "Ward deleted" });
  } catch (e) {
    console.error("deleteWard error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

exports.getWardPincodes = async (req, res) => {
  try {
    const list = await WardPincode.findAll({
      where: { ward_id: req.params.id },
      order: [["id", "ASC"]],
    });

    return res.json({ status: 1, data: list });
  } catch (e) {
    console.error("getWardPincodes error:", e);
    return res.json({ status: 0, message: e.message });
  }
};

/**
 * addWardPincode
 * - prevents duplicate pincode for same ward (unique constraint at DB + controller catch)
 */
exports.addWardPincode = async (req, res) => {
  try {
    const pincode = (req.body.pincode || "").trim();
    if (!pincode) return res.json({ status: 0, message: "Pincode required" });

    // Optional additional server-side validation (digits only)
    if (!/^\d{3,10}$/.test(pincode)) {
      return res.json({ status: 0, message: "Invalid pincode format" });
    }

    // create - unique constraint on (ward_id, pincode) will prevent duplicates
    const data = await WardPincode.create({
      ward_id: req.params.id,
      pincode,
    });

    return res.json({ status: 1, message: "Pincode added", data });
  } catch (e) {
    console.error("addWardPincode error:", e);
    // Unique constraint handling
    if (e instanceof UniqueConstraintError || (e.name && e.name === "SequelizeUniqueConstraintError")) {
      return res.json({ status: 0, message: "Pincode already exists for this ward" });
    }
    return res.json({ status: 0, message: e.message });
  }
};

exports.deleteWardPincode = async (req, res) => {
  try {
    const row = await WardPincode.findByPk(req.params.pincode_id);
    if (!row) return res.json({ status: 0, message: "Pincode not found" });

    await row.destroy();

    return res.json({ status: 1, message: "Pincode deleted" });
  } catch (e) {
    console.error("deleteWardPincode error:", e);
    return res.json({ status: 0, message: e.message });
  }
};
