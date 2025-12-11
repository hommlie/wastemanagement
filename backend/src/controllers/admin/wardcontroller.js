// controllers/ward.controller.js
const db = require("../../models");
const { Op } = db.Sequelize || require("sequelize");

const Ward = db.Ward;
const Division = db.Division;
const Zone = db.Zone;
const Corporation = db.Corporation;
const City = db.City;
const State = db.State;
const WardPincode = db.WardPincode;

exports.getStates = async (req, res) => {
  try {
    const data = await State.findAll({ order: [["name", "ASC"]] });
    return res.json({ status: 1, data });
  } catch (e) {
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
    return res.json({ status: 0, message: e.message });
  }
};

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

    const zone = ward.division?.zone;
    const corp = zone?.corporation;
    const city = corp?.city;
    const state = city?.state;

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
    });
  } catch (e) {
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
    return res.json({ status: 0, message: e.message });
  }
};

exports.addWardPincode = async (req, res) => {
  try {
    if (!req.body.pincode)
      return res.json({ status: 0, message: "Pincode required" });

    const data = await WardPincode.create({
      ward_id: req.params.id,
      pincode: req.body.pincode,
    });

    return res.json({ status: 1, message: "Pincode added", data });
  } catch (e) {
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
    return res.json({ status: 0, message: e.message });
  }
};
