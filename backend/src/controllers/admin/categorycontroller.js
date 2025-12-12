// backend/src/controllers/admin/categorycontroller.js
const fs = require('fs');
const path = require('path');
const db = require('../../models');
const { Op } = db.Sequelize || require('sequelize');
const Category = db.Category;
const uploadDir = path.join(__dirname, '..', '..', 'public', 'category');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${base}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 6 * 1024 * 1024 } }); 

exports.uploadSingle = upload.single('image');

function slugify(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\-]+/g, '-')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fileUrl(req, filename) {
  if (!filename) return null;

  if (/^https?:\/\//i.test(filename)) return filename;
  return `${req.protocol}://${req.get('host')}/public/category/${filename}`;
}

/* ===== list ===== */
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 25, 10);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.search) where.name = { [Op.like]: `%${req.query.search}%` };
    if (typeof req.query.status !== 'undefined') where.status = req.query.status;

    const { rows, count } = await Category.findAndCountAll({
      where,
      limit,
      offset,
      order: [['id', 'DESC']],
    });

    // convert images (filenames) to full urls for output
    const data = rows.map(r => {
      const obj = r.toJSON();
      if (Array.isArray(obj.images)) {
        obj.images = obj.images.map(img => fileUrl(req, img));
      } else if (typeof obj.images === 'string' && obj.images) {
        // maybe stored as comma separated string
        obj.images = (obj.images || '').split(',').map(s => s.trim()).filter(Boolean).map(img => fileUrl(req, img));
      } else {
        obj.images = [];
      }
      return obj;
    });

    return res.json({
      status: 1,
      data,
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit), from: offset + 1, to: offset + data.length },
    });
  } catch (e) {
    console.error('Category.getAll error:', e);
    return res.json({ status: 0, message: e.message });
  }
};

/* ===== get by id ===== */
exports.getById = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.json({ status: 0, message: 'Category not found' });
    const obj = cat.toJSON();
    if (Array.isArray(obj.images)) obj.images = obj.images.map(img => fileUrl(req, img));
    else obj.images = [];
    return res.json({ status: 1, data: obj });
  } catch (e) {
    console.error('Category.getById error:', e);
    return res.json({ status: 0, message: e.message });
  }
};

/* ===== create (accepts single image upload via field 'image') =====
   Use route: router.post('/', uploadSingle, controller.create)
*/
exports.create = async (req, res) => {
  try {
    const { name, slug: inputSlug, images: bodyImages, status } = req.body;
    if (!name) return res.json({ status: 0, message: 'Name is required' });

    const slug = slugify(inputSlug || name);

    // check uniqueness
    const exists = await Category.findOne({ where: { slug } });
    if (exists) return res.json({ status: 0, message: 'Slug already exists. Choose another name/slug.' });

    // handle uploaded file (if any)
    let imagesArr = [];
    if (req.file && req.file.filename) {
      imagesArr.push(req.file.filename);
    } else {
      // if client sent images in body (array or comma string), accept it but normalize to filenames or URLs
      if (bodyImages) {
        if (Array.isArray(bodyImages)) imagesArr = bodyImages.map(i => (typeof i === 'string' ? path.basename(i) : i)).filter(Boolean);
        else if (typeof bodyImages === 'string') imagesArr = bodyImages.split(',').map(s => path.basename(s.trim())).filter(Boolean);
      }
    }

    const payload = {
      name,
      slug,
      images: imagesArr.length ? imagesArr : [], // store array (may be empty)
      status: typeof status !== 'undefined' ? status : 1,
      created_by: req.user?.id || null,
      updated_by: req.user?.id || null,
    };

    const cat = await Category.create(payload);
    const out = cat.toJSON();
    out.images = (out.images || []).map(img => fileUrl(req, img));
    return res.json({ status: 1, message: 'Category created', data: out });
  } catch (e) {
    console.error('Category.create error:', e);
    return res.json({ status: 0, message: e.message });
  }
};

/* ===== update (accepts optional single image upload 'image') =====
   Use route: router.put('/:id', uploadSingle, controller.update)
*/
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const cat = await Category.findByPk(id);
    if (!cat) return res.json({ status: 0, message: 'Category not found' });

    const { name, slug: inputSlug, images: bodyImages, status } = req.body;
    const newSlug = slugify(inputSlug || name || cat.slug);

    // ensure slug unique (skip current record)
    const other = await Category.findOne({ where: { slug: newSlug, id: { [Op.ne]: id } } });
    if (other) return res.json({ status: 0, message: 'Slug already used by another category' });

    // if a file uploaded, add/replace first image (behavior: replace first image)
    let imagesArr = Array.isArray(cat.images) ? [...cat.images] : (cat.images ? (String(cat.images).split(',').map(s => s.trim()).filter(Boolean)) : []);

    if (req.file && req.file.filename) {
      // if you want to replace all images with the uploaded one, uncomment next line:
      // imagesArr = [req.file.filename];

      // Otherwise, add the new image to the beginning if not duplicate:
      const fname = req.file.filename;
      if (!imagesArr.includes(fname)) {
        imagesArr.unshift(fname);
      }
    } else if (typeof bodyImages !== 'undefined') {
      // client explicitly sent images array or comma string -> use it
      if (Array.isArray(bodyImages)) imagesArr = bodyImages.map(i => (typeof i === 'string' ? path.basename(i) : i)).filter(Boolean);
      else imagesArr = bodyImages ? String(bodyImages).split(',').map(s => path.basename(s.trim())).filter(Boolean) : [];
    }

    cat.name = name ?? cat.name;
    cat.slug = newSlug ?? cat.slug;
    cat.images = imagesArr;
    cat.status = typeof status !== 'undefined' ? status : cat.status;
    cat.updated_by = req.user?.id || cat.updated_by;
    cat.updated_at = new Date();

    await cat.save();

    const out = cat.toJSON();
    out.images = (out.images || []).map(img => fileUrl(req, img));
    return res.json({ status: 1, message: 'Category updated', data: out });
  } catch (e) {
    console.error('Category.update error:', e);
    return res.json({ status: 0, message: e.message });
  }
};


exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const cat = await Category.findByPk(id);
    if (!cat) return res.json({ status: 0, message: "Category not found" });
    let newStatus;
    if (typeof req.body.status !== "undefined") {
      const s = Number(req.body.status);
      if (s === 0 || s === 1) {
        newStatus = s;
      } else {
        return res.json({ status: 0, message: "Invalid status value. Use 0 or 1." });
      }
    } else {
      newStatus = cat.status === 1 ? 0 : 1;
    }
    cat.status = newStatus;
    cat.updated_by = req.user?.id || cat.updated_by || null;
    cat.updated_at = new Date();
    await cat.save();
    return res.json({
      status: 1,
      message: "Status updated",
      data: { id: cat.id, status: cat.status },
    });
  } catch (e) {
    console.error("Category.updateStatus error:", e);
    return res.json({ status: 0, message: e.message });
  }
};


/* ===== delete ===== */
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const cat = await Category.findByPk(id);
    if (!cat) return res.json({ status: 0, message: 'Category not found' });
    await cat.destroy();
    return res.json({ status: 1, message: 'Category deleted' });
  } catch (e) {
    console.error('Category.delete error:', e);
    return res.json({ status: 0, message: e.message });
  }
};




