const db = require("../../models");

exports.getAll = async (req, res) => {
  try {
    const items = await db.Subcategory.findAll({ order: [["id", "ASC"]] });
    res.json({ status: 1, data: items });
  } catch (err) {
    console.error("subcategorycontroller.getAll", err);
    res.status(500).json({ status: 0, message: "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const obj = req.body || {};
    const created = await db.Subcategory.create(obj);
    res.json({ status: 1, data: created });
  } catch (err) {
    console.error("subcategorycontroller.create", err);
    res.status(500).json({ status: 0, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const obj = req.body || {};
    const m = await db.Subcategory.findByPk(id);
    if (!m) return res.status(404).json({ status: 0, message: "Not found" });
    await m.update(obj);
    res.json({ status: 1, data: m });
  } catch (err) {
    console.error("subcategorycontroller.update", err);
    res.status(500).json({ status: 0, message: "Server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const d = await db.Subcategory.destroy({ where: { id } });
    res.json({ status: 1, deleted: d });
  } catch (err) {
    console.error("subcategorycontroller.delete", err);
    res.status(500).json({ status: 0, message: "Server error" });
  }
};
