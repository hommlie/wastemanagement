// controllers/admin/categorycontroller.js
const path = require("path");
const multer = require("multer");

const db = require("../../models");
const Category = db.Category;
const Variation = db.Variation;
const { Op } = db.Sequelize;

/* ------------ MULTER CONFIG SIRF CATEGORY IMAGES KE LIYE ------------ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // backend/public/category
    cb(null, path.join(__dirname,"..","..","..","public", "category"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, Date.now() + "_" + base + ext);
  },
});

const uploadCategoryImage = multer({ storage });

exports.uploadCategoryImage = uploadCategoryImage.single("image");

/* ------------ HELPERS ------------ */

function makeImageUrl(req, fileName) {
  if (!fileName) return null;
  const base = `${req.protocol}://${req.get("host")}`;
  return `${base}/category/${fileName}`; // public/category se serve hoga
}

/* ------------ LIST / GET ------------ */

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "10", 10);
    const search = (req.query.search || "").trim();

    const where = {};
    if (search) {
      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Category.findAndCountAll({
      where,
      include: [
        {
          model: Variation,
          as: "variations",
          separate: true,
          order: [["sort_order", "ASC"], ["id", "ASC"]],
        },
      ],
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    const data = rows.map((row) => {
      const plain = row.toJSON();
      if (plain.image) plain.image = makeImageUrl(req, plain.image);
      return plain;
    });

    return res.json({
      status: 1,
      message: "Categories fetched",
      data,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1,
        from: count ? offset + 1 : 0,
        to: offset + rows.length,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Variation,
          as: "variations",
          order: [["sort_order", "ASC"], ["id", "ASC"]],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({ status: 0, message: "Category not found" });
    }

    const plain = category.toJSON();
    if (plain.image) plain.image = makeImageUrl(req, plain.image);

    return res.json({ status: 1, message: "Category fetched", data: plain });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

/* ------------ CREATE (CATEGORY + VARIATIONS + IMAGE) ------------ */

exports.createWithVariations = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const userId = req.user && req.user.id ? req.user.id : null;
    const { name, status } = req.body;

    let variations = [];
    if (req.body.variations) {
      try {
        variations = JSON.parse(req.body.variations);
      } catch (e) {
        return res
          .status(400)
          .json({ status: 0, message: "Invalid variations JSON" });
      }
    }

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ status: 0, message: "Category name is required" });
    }

    const category = await Category.create(
      {
        user_id: userId,
        name: name.trim(),
        image: req.file ? req.file.filename : null, // sirf filename
        status: typeof status !== "undefined" ? Number(status) : 1,
      },
      { transaction: t }
    );

    if (Array.isArray(variations) && variations.length > 0) {
      const rows = variations
        .filter((v) => v && v.name && v.name.trim())
        .map((v, idx) => ({
          category_id: category.id,
          name: v.name.trim(),
          code: v.code || null,
          number_of_services: v.number_of_services || null,
          schedule_after_days: v.schedule_after_days || null,
          min_weight_kg: v.min_weight_kg || null,
          max_weight_kg: v.max_weight_kg || null,
          base_price: v.base_price || null,
          per_kg_price: v.per_kg_price || null,
          status: typeof v.status !== "undefined" ? Number(v.status) : 1,
          sort_order:
            typeof v.sort_order !== "undefined" ? v.sort_order : idx,
        }));

      if (rows.length) {
        await Variation.bulkCreate(rows, { transaction: t });
      }
    }

    await t.commit();

    const plain = category.toJSON();
    if (plain.image) plain.image = makeImageUrl(req, plain.image);

    return res.json({
      status: 1,
      message: "Category and variations created",
      data: plain,
    });
  } catch (err) {
    console.error(err);
    await t.rollback();
    return res
      .status(500)
      .json({ status: 0, message: "Server error", error: err.message });
  }
};

/* ------------ UPDATE (CATEGORY + VARIATIONS + OPTIONAL IMAGE) ------------ */

exports.updateWithVariations = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const id = req.params.id;
    const { name, status } = req.body;

    let variations = [];
    if (req.body.variations) {
      try {
        variations = JSON.parse(req.body.variations);
      } catch (e) {
        return res
          .status(400)
          .json({ status: 0, message: "Invalid variations JSON" });
      }
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ status: 0, message: "Category not found" });
    }

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ status: 0, message: "Category name is required" });
    }

    if (req.file) {
      category.image = req.file.filename;
    }

    category.name = name.trim();
    if (typeof status !== "undefined") {
      category.status = Number(status);
    }

    await category.save({ transaction: t });

    const existing = await Variation.findAll({
      where: { category_id: category.id },
      transaction: t,
    });
    const existingIds = existing.map((v) => v.id);
    const incoming = Array.isArray(variations) ? variations : [];
    const incomingIds = incoming.filter((v) => v.id).map((v) => Number(v.id));

    const toDelete = existingIds.filter((vid) => !incomingIds.includes(vid));
    if (toDelete.length) {
      await Variation.destroy({ where: { id: toDelete }, transaction: t });
    }

    for (const [idx, v] of incoming.entries()) {
      const payload = {
        category_id: category.id,
        name: (v.name || "").trim(),
        code: v.code || null,
        number_of_services: v.number_of_services || null,
        schedule_after_days: v.schedule_after_days || null,
        min_weight_kg: v.min_weight_kg || null,
        max_weight_kg: v.max_weight_kg || null,
        base_price: v.base_price || null,
        per_kg_price: v.per_kg_price || null,
        status: typeof v.status !== "undefined" ? Number(v.status) : 1,
        sort_order:
          typeof v.sort_order !== "undefined" ? v.sort_order : idx,
      };

      if (!payload.name) continue;

      if (v.id) {
        await Variation.update(payload, {
          where: { id: v.id, category_id: category.id },
          transaction: t,
        });
      } else {
        await Variation.create(payload, { transaction: t });
      }
    }

    await t.commit();

    const plain = category.toJSON();
    if (plain.image) plain.image = makeImageUrl(req, plain.image);

    return res.json({
      status: 1,
      message: "Category and variations updated",
      data: plain,
    });
  } catch (err) {
    console.error(err);
    await t.rollback();
    return res
      .status(500)
      .json({ status: 0, message: "Server error", error: err.message });
  }
};

/* ------------ DELETE ------------ */

exports.deleteOne = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findByPk(id);
    if (!category) {
      return res
        .status(404)
        .json({ status: 0, message: "Category not found" });
    }

    await Variation.destroy({ where: { category_id: id } });
    await category.destroy();

    return res.json({ status: 1, message: "Category deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

/* ------------ OPTIONAL SIMPLE create/update (agar kahin aur use ho) ------------ */

exports.create = async (req, res) => {
  try {
    const { name, image, status } = req.body;
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ status: 0, message: "Category name is required" });
    }
    const cat = await Category.create({
      name: name.trim(),
      image: image || null,
      status: typeof status !== "undefined" ? Number(status) : 1,
    });
    return res.json({ status: 1, message: "Category created", data: cat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, image, status } = req.body;
    const cat = await Category.findByPk(id);
    if (!cat) {
      return res
        .status(404)
        .json({ status: 0, message: "Category not found" });
    }
    if (name && name.trim()) cat.name = name.trim();
    if (typeof image !== "undefined") cat.image = image || null;
    if (typeof status !== "undefined") cat.status = Number(status);
    await cat.save();
    return res.json({ status: 1, message: "Category updated", data: cat });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 0, message: "Server error" });
  }
};
