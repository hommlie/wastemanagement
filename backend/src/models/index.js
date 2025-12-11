// src/models/index.js
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const basename = path.basename(__filename);
const modelsDir = __dirname;

const db = {
  sequelize,
  Sequelize,
};

function loadModelFromFile(filePath) {
  const mod = require(filePath);
  if (typeof mod === "function") {
    return mod(sequelize, Sequelize.DataTypes || Sequelize);
  }
  return mod;
}

// LOAD ALL MODEL FILES (we do NOT exclude model files)
fs.readdirSync(modelsDir)
  .filter((file) => {
    return file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
  })
  .forEach((file) => {
    const full = path.join(modelsDir, file);
    try {
      const model = loadModelFromFile(full);
      const key = model && model.name ? model.name : path.basename(file, ".js");
      db[key] = model;
    } catch (err) {
      console.error(`Error loading model file ${file}:`, err);
    }
  });

/* -----------------------------------------
   ALIAS FIXES (support multiple export styles)
------------------------------------------*/
if (!db.Role && db.role) db.Role = db.role;
if (!db.Module && db.module) db.Module = db.module;
if (!db.Action && db.action) db.Action = db.action;
if (!db.Permission && db.permission) db.Permission = db.permission;
if (!db.RolePermission && db.rolepermission) db.RolePermission = db.rolepermission;
if (!db.User && db.users) db.User = db.users;
if (!db.User && db.user) db.User = db.user;

if (!db.State && db.state) db.State = db.state;
if (!db.City && db.city) db.City = db.city;
if (!db.Zone && db.zone) db.Zone = db.zone;

if (!db.Category && db.category) db.Category = db.category;
if (!db.category && db.Category) db.category = db.Category;

if (!db.Variation && db.variation) db.Variation = db.variation;
if (!db.variation && db.Variation) db.variation = db.Variation;

if (!db.Corporation && db.corporation) db.Corporation = db.corporation;
if (!db.corporation && db.Corporation) db.corporation = db.Corporation;


if (!db.Division && db.division) db.Division = db.division;
if (!db.division && db.Division) db.division = db.Division;

// Note: Pincode / ZonePincode models may exist in folder and will be loaded into db,
// but we are intentionally NOT creating automatic associations for them here.

try {
  // ---------- Modules & Permissions ----------
  if (db.Module && db.Permission) {
    db.Module.hasMany(db.Permission, { foreignKey: "module_id", as: "permissions", onDelete: "CASCADE" });
    db.Permission.belongsTo(db.Module, { foreignKey: "module_id", as: "module" });
  }

  // ---------- Actions & Permissions ----------
  if (db.Action && db.Permission) {
    db.Action.hasMany(db.Permission, { foreignKey: "action_id", as: "permissions", onDelete: "CASCADE" });
    db.Permission.belongsTo(db.Action, { foreignKey: "action_id", as: "action" });
  }

  // ---------- Roles, Permissions & RolePermissions ----------
  if (db.Role && db.Permission && db.RolePermission) {
    db.Role.belongsToMany(db.Permission, {
      through: db.RolePermission,
      foreignKey: "role_id",
      otherKey: "permission_id",
      as: "permissions",
    });
    db.Permission.belongsToMany(db.Role, {
      through: db.RolePermission,
      foreignKey: "permission_id",
      otherKey: "role_id",
      as: "roles",
    });
    db.RolePermission.belongsTo(db.Role, { foreignKey: "role_id", as: "role" });
    db.RolePermission.belongsTo(db.Permission, { foreignKey: "permission_id", as: "permission" });
  }

  // ---------- Roles & Users ----------
  if (db.Role && db.User) {
    db.Role.hasMany(db.User, { foreignKey: "role_id", as: "users", onDelete: "SET NULL" });
    db.User.belongsTo(db.Role, { foreignKey: "role_id", as: "role" });
  }

  // ---------- State & City ----------
  if (db.State && db.City) {
    db.State.hasMany(db.City, { foreignKey: "state_id", as: "cities", onDelete: "CASCADE" });
    db.City.belongsTo(db.State, { foreignKey: "state_id", as: "state" });
  }

  // ---------- City & Zone ----------
  // IMPORTANT: Your DB does NOT have Zone.city_id column (earlier error).
  // Therefore we do NOT define Zone.belongsTo(City) or City.hasMany(Zone).
  // If you add zone.city_id column later, reintroduce the association.

  // ---------- Zone & Corporation ----------
  if (db.Zone && db.Corporation) {
    db.Zone.belongsTo(db.Corporation, { foreignKey: "corporation_id", as: "corporation", onDelete: "SET NULL" });
    db.Corporation.hasMany(db.Zone, { foreignKey: "corporation_id", as: "zones", onDelete: "CASCADE" });
  }

  // ---------- State / City / Corporation ----------
  if (db.State && db.Corporation) {
    db.State.hasMany(db.Corporation, { foreignKey: "state_id", as: "corporations", onDelete: "CASCADE" });
    db.Corporation.belongsTo(db.State, { foreignKey: "state_id", as: "state" });
  }

  if (db.City && db.Corporation) {
    db.City.hasMany(db.Corporation, { foreignKey: "city_id", as: "corporations", onDelete: "CASCADE" });
    db.Corporation.belongsTo(db.City, { foreignKey: "city_id", as: "city" });
  }

  // ---------- Zone & Division ----------
  if (db.Zone && db.Division) {
    db.Zone.hasMany(db.Division, {
      foreignKey: "zone_id",
      as: "divisions",
      onDelete: "CASCADE",
    });
    db.Division.belongsTo(db.Zone, {
      foreignKey: "zone_id",
      as: "zone",
    });
  }


  // Ward <-> Division
  if (db.Division && db.Ward) {
    db.Division.hasMany(db.Ward, {
      foreignKey: "division_id",
      as: "wards",
      onDelete: "CASCADE"
    });
    db.Ward.belongsTo(db.Division, {
      foreignKey: "division_id",
      as: "division"
    });
  }

  // WardPincode associations
  if (db.Ward && db.WardPincode) {
    db.Ward.hasMany(db.WardPincode, {
      foreignKey: "ward_id",
      as: "ward_pincodes",
      onDelete: "CASCADE"
    });
    db.WardPincode.belongsTo(db.Ward, {
      foreignKey: "ward_id",
      as: "ward"
    });
  }


  // ---------- Category & Variation & User ----------
  if (db.Category && db.User) {
    db.User.hasMany(db.Category, { foreignKey: "user_id", as: "categories", onDelete: "CASCADE" });
    db.Category.belongsTo(db.User, { foreignKey: "user_id", as: "user" });
  }

  if (db.Category && db.Variation) {
    db.Category.hasMany(db.Variation, { foreignKey: "category_id", as: "variations", onDelete: "CASCADE" });
    db.Variation.belongsTo(db.Category, { foreignKey: "category_id", as: "category" });
  }


  // NOTE: No Pincode / ZonePincode associations intentionally
} catch (err) {
  console.error("Error registering associations:", err);
}

module.exports = db;
