const { getRoleModulesActions } = require("../../helpers/accessHelper");

exports.getRoleAccess = async (req, res) => {
  try {
    const roleId = parseInt(req.params.role_id, 10);
    if (!roleId) {
      return res.status(400).json({ status: 0, message: "Invalid role id" });
    }
    const data = await getRoleModulesActions(roleId);
    return res.json({
      status: 1,
      message: "Access fetched",
      data
    });
  } catch (err) {
    return res.status(500).json({ status: 0, message: "Error fetching access" });
  }
};
