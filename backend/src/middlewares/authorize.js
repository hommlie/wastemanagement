const db = require("../models");
const { roleHasPermission } = require("../helpers/accessHelper");

module.exports = function authorize(moduleCode, actionCode) {
  return async function (req, res, next) {
    try {
      const userId = req.headers["x-user-id"];
      if (!userId) {
        return res.status(401).json({ status: 0, message: "Unauthorized" });
      }

      const user = await db.User.findByPk(userId);
      if (!user) {
        return res.status(401).json({ status: 0, message: "Unauthorized" });
      }

      const allowed = await roleHasPermission(user.role_id, moduleCode, actionCode);
      if (!allowed) {
        return res.status(403).json({ status: 0, message: "Forbidden" });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(500).json({ status: 0, message: "Auth error" });
    }
  };
};
