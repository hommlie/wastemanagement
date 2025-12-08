const express = require("express");
const router = express.Router();

const authorize = require("../middlewares/authorize");

const authController = require("../controllers/admin/authcontroller");
const ModuleController = require("../controllers/admin/modulecontroller");
const ActionController = require("../controllers/admin/actionscontroller");
const PermissionController = require("../controllers/admin/permissionscontroller");
const RolesController = require("../controllers/admin/rolescontroller");
const RolepermissionsController = require("../controllers/admin/rolepermissionscontroller");
const UsersController = require("../controllers/admin/userscontroller");
const CityController = require("../controllers/admin/citycontroller");
const StateController = require("../controllers/admin/statecontroller");
const ZoneController = require("../controllers/admin/zonecontroller");
const OrderController = require("../controllers/admin/ordercontroller");
const CategoryController = require("../controllers/admin/categorycontroller");
const VariationController = require("../controllers/admin/variationcontroller");

router.post("/login", authController.login);
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);



router.get("/assignModules", ModuleController.assignModules);
router.get("/modules",authorize("modules", "view"), ModuleController.getAll);
router.post("/modules", authorize("modules", "create"), ModuleController.create);
router.put("/modules/:id", authorize("modules", "edit"), ModuleController.update);
router.delete("/modules/:id", authorize("modules", "delete"), ModuleController.delete);

router.get("/actions", authorize("actions", "view"), ActionController.getAll);
router.post("/actions", authorize("actions", "create"), ActionController.create);
router.put("/actions/:id", authorize("actions", "edit"), ActionController.update);
router.delete("/actions/:id", authorize("actions", "delete"), ActionController.delete);

router.get("/permissions", authorize("permissions", "view"), PermissionController.getAll);
router.post("/permissions", authorize("permissions", "create"), PermissionController.create);
router.put("/permissions/:id", authorize("permissions", "edit"), PermissionController.update);
router.delete("/permissions/:id", authorize("permissions", "delete"), PermissionController.delete);

router.get("/roles", authorize("roles", "view"), RolesController.getAll);
router.post("/roles", authorize("roles", "create"), RolesController.create);
router.put("/roles/:id", authorize("roles", "edit"), RolesController.update);
router.delete("/roles/:id", authorize("roles", "delete"), RolesController.delete);

router.get("/permission-groups", authorize("rolepermissions", "view"), RolepermissionsController.getAllPermissionsGrouped);
router.get("/roles/:role_id/permissions", authorize("rolepermissions", "view"), RolepermissionsController.getRolePermissions);
router.post("/roles/:role_id/permissions", authorize("rolepermissions", "edit"), RolepermissionsController.updateRolePermissions);

router.get("/users", authorize("users", "view"), UsersController.getUsers);
router.get("/users/:id", authorize("users", "view"), UsersController.getUserById);
router.post("/users", authorize("users", "create"), UsersController.createUser);
router.put("/users/:id", authorize("users", "edit"), UsersController.updateUser);
router.patch("/users/:id/status", authorize("users", "status"), UsersController.changeUserStatus);
router.get("/usersRoles",authorize("users", "view"), UsersController.getRoles);
router.get("/usersZones", authorize("users", "view"), UsersController.getZonesForUserForm);
router.get("/usersZones/:id", authorize("users", "view"), UsersController.getZonesByIdForUserForm);


router.get("/city", authorize("city", "view"), CityController.getAllCities);
router.get("/city/state/:state_id", authorize("city", "view"), CityController.getCitiesByState);
router.get("/city/:id", authorize("city", "view"), CityController.getCityById);
router.get("/city/:city_id/pincodes", authorize("city", "view"), CityController.getPincodesByCity);
router.post("/city", authorize("city", "create"), CityController.createCity);
router.put("/city/:id", authorize("city", "edit"), CityController.updateCity);
router.patch("/city/:id/status", authorize("city", "edit"), CityController.updateCityStatus);

router.get("/cities", authorize("city", "view"), CityController.getAllCities);
router.get("/cities/state",authorize("city", "view"), CityController.getState);
router.get("/cities/state/:state_id", authorize("city", "view"), CityController.getCitiesByState);
router.get("/cities/:id", authorize("city", "view"), CityController.getCityById);
router.get("/cities/:city_id/pincodes", authorize("city", "view"), CityController.getPincodesByCity);
router.post("/cities", authorize("city", "create"), CityController.createCity);
router.put("/cities/:id", authorize("city", "edit"), CityController.updateCity);
router.patch("/cities/:id/status", authorize("city", "edit"), CityController.updateCityStatus);
router.delete("/cities/:id", authorize("city", "delete"), CityController.deleteCity);


router.get("/state", authorize("state", "view"), StateController.getStates);
router.get("/allstate", authorize("state", "view"), StateController.allStates);
router.get("/state/:id", authorize("state", "view"), StateController.getStateById);
router.post("/state", authorize("state", "create"), StateController.createState);
router.put("/state/:id", authorize("state", "edit"), StateController.updateState);
router.delete("/state/:id", authorize("state", "delete"), StateController.deleteState);

router.get("/zone", authorize("zone", "view"), ZoneController.getAllZones);
router.get("/zone/state", authorize("zone", "view"), ZoneController.getState);
router.get("/zone/city/:state_id", authorize("zone", "view"), ZoneController.getCity);
router.get("/zone/:id", authorize("zone", "view"), ZoneController.getZoneById);
router.get("/zone/:city_id/pincodes", authorize("zone", "create"), CityController.getPincodesByCity);
router.post("/zone", authorize("zone", "create"), ZoneController.createZone);
router.put("/zone/:id", authorize("zone", "edit"), ZoneController.updateZone);
router.post("/zone/:id/status", authorize("zone", "edit"), ZoneController.updateZoneStatus);
router.delete("/zone/:id", authorize("zone", "delete"), ZoneController.deleteZone);

router.get("/order", authorize("order", "view"), OrderController.getAll);
router.post("/order", authorize("order", "create"), OrderController.create);
router.put("/order/:id", authorize("order", "edit"), OrderController.update);
router.delete("/order/:id", authorize("order", "delete"), OrderController.delete);


// ===== CATEGORY ROUTES =====
router.get("/category", authorize("category", "view"), CategoryController.getAll);
router.get("/category/:id", authorize("category", "view"), CategoryController.getOne);
router.post("/category_with_variations",authorize("category", "create"), CategoryController.uploadCategoryImage, CategoryController.createWithVariations);
router.put("/category_with_variations/:id",authorize("category", "edit"), CategoryController.uploadCategoryImage, CategoryController.updateWithVariations);
router.delete("/category/:id",authorize("category", "delete"), CategoryController.deleteOne);
router.post("/category", authorize("category", "create"), CategoryController.create);
router.put("/category/:id", authorize("category", "edit"), CategoryController.update);


router.get("/variation", authorize("variation", "view"), VariationController.getAll);
router.post("/variation", authorize("variation", "create"), VariationController.create);
router.put("/variation/:id", authorize("variation", "edit"), VariationController.update);
router.delete("/variation/:id", authorize("variation", "delete"), VariationController.delete);

module.exports = router;
