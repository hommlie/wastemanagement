const db = require("../../models");
const { Op } = db.Sequelize || require("sequelize");
const Zone = db.Zone;
const Pincode = db.Pincode;
const State = db.State;
const ZonePincode = db.ZonePincode;
const City = db.City;

function normalizePincodes(input) {
  if (!input) return [];
  let arr = Array.isArray(input) ? input.slice() : String(input).split(/[\s,;|]+/);
  arr = arr.map((p) => String(p || "").trim()).filter((p) => p.length > 0);
  arr = arr.filter((p) => /^\d{6}$/.test(p));
  return Array.from(new Set(arr));
}

exports.getAllZones = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 10);
    const search = (req.query.search || "").trim();
    const city_id = req.query.city_id ? parseInt(req.query.city_id, 10) : null;
    const offset = (page - 1) * limit;

    const where = {};
    if (city_id) where.city_id = city_id;
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { code: { [Op.like]: `%${search}%` } }
    ];

    const { rows: zones, count: total } = await Zone.findAndCountAll({
      where,
      order: [["name", "ASC"]],
      limit,
      offset,
      include: [
        { model: City, as: "city", attributes: ["id", "name"] },
        { model: Pincode, as: "pincodes", attributes: ["id", "pincode"] }
      ]
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      status: 1,
      message: "Zones fetched successfully",
      data: zones,
      meta: {
        total,
        page,
        limit,
        totalPages,
        from: total === 0 ? 0 : offset + 1,
        to: Math.min(offset + zones.length, total)
      }
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

exports.getZoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const zone = await Zone.findByPk(id, {
      include: [
        { model: City, as: "city", attributes: ["id", "name"] },
        { model: Pincode, as: "pincodes", attributes: ["id", "pincode", "city_id"] }
      ]
    });

    if (!zone) return res.status(404).json({ status: 0, message: "Zone not found" });

    return res.status(200).json({ status: 1, message: "Zone fetched successfully", data: zone });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

// Get States 

exports.getState = async (req, res) => {
  try {
    const states = await State.findAll({
      attributes: ["id", "name","status", "code", "created_at", "updated_at"],
      order: [["name", "ASC"]]
    });
    return res.status(200).json({
      status: 1,
      message: "All states fetched successfully",
      data: states
    });
  }
  catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
};

// Get City
exports.getCity = async (req, res) => {
  try {
    const { state_id } = req.params;
    const cities = await City.findAll({ where: { state_id }, order: [["name", "ASC"]], attributes: ["id", "state_id", "name", "city_code", "status", "created_at", "updated_at"] });
    return res.status(200).json({ status: 1, message: "Cities fetched successfully", data: cities });
  } catch (error) {
    return res.status(500).json({ status: 0, message: error.message });
  }
}

exports.getPincodesByCity = async (req, res) => {
  try {
    const { city_id } = req.params;
    const pincodes = await db.Pincode.findAll({ where: { city_id }, attributes: ["id", "pincode"] });
    return res.status(200).json({ status: 1, message: "Pincodes fetched successfully", data: pincodes });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message });
  }
};

exports.createZone = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { city_id, name, code, pincodes } = req.body;
    if (!city_id || !name) {
      await t.rollback();
      return res.status(400).json({ status: 0, message: "city_id and name are required" });
    }

    const pins = normalizePincodes(pincodes);
    if (pins.length === 0) {
      await t.rollback();
      return res.status(400).json({ status: 0, message: "At least one valid pincode is required (6 digits)" });
    }

    const existingPincodes = await Pincode.findAll({
      where: { pincode: { [Op.in]: pins } },
      transaction: t
    });
    const existingMap = new Map(existingPincodes.map(p => [p.pincode, p]));

    const toCreate = pins.filter(p => !existingMap.has(p)).map(p => ({ pincode: p, city_id }));
    if (toCreate.length > 0) {
      try {
        await Pincode.bulkCreate(toCreate, { transaction: t, ignoreDuplicates: true });
      } catch (e) {
        for (const rec of toCreate) {
          try { await Pincode.create(rec, { transaction: t }); } catch (_) {}
        }
      }
    }

    const allPincodeRows = await Pincode.findAll({
      where: { pincode: { [Op.in]: pins } },
      transaction: t
    });
    const pincodeByCode = new Map(allPincodeRows.map(p => [p.pincode, p]));
    const pincodeIds = pins.map(code => pincodeByCode.get(code)?.id || null);

    if (pincodeIds.includes(null)) {
      await t.rollback();
      return res.status(400).json({ status: 0, message: "Some pincodes could not be created" });
    }

    const existingMappings = await ZonePincode.findAll({
      where: { pincode_id: { [Op.in]: pincodeIds } },
      include: [{ model: Zone, as: "zone", attributes: ["id", "name", "city_id"] }],
      transaction: t
    });

    if (existingMappings.length > 0) {
      await t.rollback();
      const conflicts = existingMappings.map(m => {
        const pRow = allPincodeRows.find(r => r.id === m.pincode_id);
        return {
          pincode: pRow ? pRow.pincode : null,
          zone_id: m.zone ? m.zone.id : null,
          zone_name: m.zone ? m.zone.name : null
        };
      });
      return res.status(409).json({ status: 0, message: "Some pincodes already assigned to other zones", conflicts });
    }

    const newZone = await Zone.create({
      city_id,
      name: String(name).trim(),
      code: code ? String(code).trim() : null,
      status: 1
    }, { transaction: t });

    const zonePincodesPayload = pincodeIds.map(pid => ({ zone_id: newZone.id, pincode_id: pid }));
    await ZonePincode.bulkCreate(zonePincodesPayload, { transaction: t });

    await t.commit();
    return res.status(201).json({ status: 1, message: "Zone created successfully", data: newZone });
  } catch (err) {
    await t.rollback();
    if (err && err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ status: 0, message: "Pincode assignment conflict (concurrent)" });
    }
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

exports.updateZone = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const { city_id, name, code, pincodes, status } = req.body;

    const zone = await Zone.findByPk(id, { transaction: t });
    if (!zone) {
      await t.rollback();
      return res.status(404).json({ status: 0, message: "Zone not found" });
    }

    let desiredPincodeCodes = null;
    if (typeof pincodes !== "undefined") {
      desiredPincodeCodes = normalizePincodes(pincodes);
      if (desiredPincodeCodes.length === 0) {
        await t.rollback();
        return res.status(400).json({ status: 0, message: "At least one valid pincode is required (6 digits)" });
      }
    }

    if (desiredPincodeCodes) {
      const existingPincodes = await Pincode.findAll({
        where: { pincode: { [Op.in]: desiredPincodeCodes } },
        transaction: t
      });
      const existingMap = new Map(existingPincodes.map(p => [p.pincode, p]));
      const toCreate = desiredPincodeCodes
        .filter(p => !existingMap.has(p))
        .map(p => ({ pincode: p, city_id: city_id ?? zone.city_id }));

      if (toCreate.length > 0) {
        try {
          await Pincode.bulkCreate(toCreate, { transaction: t, ignoreDuplicates: true });
        } catch (_) {
          for (const rec of toCreate) {
            try { await Pincode.create(rec, { transaction: t }); } catch (_) {}
          }
        }
      }

      const allPincodeRows = await Pincode.findAll({
        where: { pincode: { [Op.in]: desiredPincodeCodes } }, transaction: t
      });

      const pincodeByCode = new Map(allPincodeRows.map(p => [p.pincode, p]));
      const desiredPincodeIds = desiredPincodeCodes.map(code => pincodeByCode.get(code)?.id || null);

      if (desiredPincodeIds.includes(null)) {
        await t.rollback();
        return res.status(400).json({ status: 0, message: "Some pincodes could not be created" });
      }

      const existingMappings = await ZonePincode.findAll({
        where: { pincode_id: { [Op.in]: desiredPincodeIds }, zone_id: { [Op.ne]: zone.id } },
        include: [{ model: Zone, as: "zone", attributes: ["id", "name", "city_id"] }],
        transaction: t
      });

      if (existingMappings.length > 0) {
        await t.rollback();
        const conflicts = existingMappings.map(m => {
          const pRow = allPincodeRows.find(r => r.id === m.pincode_id);
          return {
            pincode: pRow ? pRow.pincode : null,
            zone_id: m.zone ? m.zone.id : null,
            zone_name: m.zone ? m.zone.name : null
          };
        });
        return res.status(409).json({
          status: 0,
          message: "Some pincodes already assigned to other zones",
          conflicts
        });
      }

      await ZonePincode.destroy({
        where: { zone_id: zone.id, pincode_id: { [Op.notIn]: desiredPincodeIds } },
        transaction: t
      });

      const existingThisZoneMappings = await ZonePincode.findAll({
        where: { zone_id: zone.id, pincode_id: { [Op.in]: desiredPincodeIds } },
        transaction: t
      });

      const existingThisZoneIds = new Set(existingThisZoneMappings.map(m => m.pincode_id));
      const toInsert = desiredPincodeIds
        .filter(id => !existingThisZoneIds.has(id))
        .map(pid => ({ zone_id: zone.id, pincode_id: pid }));

      if (toInsert.length > 0) {
        try {
          await ZonePincode.bulkCreate(toInsert, { transaction: t });
        } catch (_) {
          await t.rollback();
          return res.status(409).json({ status: 0, message: "Pincode assignment conflict during update" });
        }
      }
    }

    zone.city_id = typeof city_id !== "undefined" ? city_id : zone.city_id;
    zone.name = typeof name !== "undefined" ? String(name).trim() : zone.name;
    zone.code = typeof code !== "undefined" ? (code ? String(code).trim() : null) : zone.code;
    zone.status = typeof status !== "undefined" ? status : zone.status;
    zone.updated_at = new Date();

    await zone.save({ transaction: t });
    await t.commit();

    return res.status(200).json({ status: 1, message: "Zone updated successfully", data: zone });
  } catch (err) {
    await t.rollback();
    if (err && err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ status: 0, message: "Pincode assignment conflict (concurrent)" });
    }
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

exports.updateZoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status === "undefined") {
      return res.status(400).json({ status: 0, message: "status is required" });
    }

    const zone = await Zone.findByPk(id);
    if (!zone) {
      return res.status(404).json({ status: 0, message: "Zone not found" });
    }

    zone.status = status;
    zone.updated_at = new Date();
    await zone.save();

    return res.status(200).json({ status: 1, message: "Status updated successfully", data: zone });
  } catch (err) {
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};

exports.deleteZone = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;
    const zone = await Zone.findByPk(id, { transaction: t });
    if (!zone) {
      await t.rollback();
      return res.status(404).json({ status: 0, message: "Zone not found" });
    }

    await ZonePincode.destroy({ where: { zone_id: id }, transaction: t });
    await zone.destroy({ transaction: t });
    await t.commit();

    return res.status(200).json({ status: 1, message: "Zone deleted successfully" });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ status: 0, message: err.message || "Server error" });
  }
};
