const db = require("../../models");
const User = db.User;
const Zone = db.Zone;
const Role = db.Role;

// GET /users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["id", "DESC"]],
    });

    return res.json({
      status: 1,
      message: "Users fetched",
      data: users,
    });
  } catch (err) {
    console.error("getUsers error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Error fetching users" });
  }
};

// GET /users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: 0, message: "User not found" });
    }

    return res.json({
      status: 1,
      message: "User fetched",
      data: user,
    });
  } catch (err) {
    console.error("getUserById error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Error fetching user" });
  }
};


exports.getZonesForUserForm = async (req, res) => {
  try {
    const zones = await Zone.findAll({
      order: [["id", "ASC"]],
    });
    return res.json({
      status: 1,
      message: "Zones fetched",
      data: zones,
    });
  } catch (err) {
    console.error("getZonesForUserForm error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Error fetching zones" });
  }
};



exports.getZonesByIdForUserForm = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: 0, message: "User not found" });
    }

    const zones = await Zone.findAll({
      order: [["id", "ASC"]],
    });

    return res.json({
      status: 1,
      message: "Zones fetched",
      data: zones,
      selected_zone_id: user.zone_id || null, // <- current zone for that user
    });
  } catch (error) {
    console.error("getZonesByIdForUserForm error:", error);
    return res
      .status(500)
      .json({ status: 0, message: "Server error" });
  }
};

// Roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [["id", "ASC"]],
    });

    return res.json({
      status: 1,
      message: "Roles fetched",
      data: roles,
    });
  }
  catch (err) {
    console.error("getRoles error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Error fetching roles" });
  }
}

// POST /users
exports.createUser = async (req, res) => {
  try {
    const { role_id, zone_id, username, email, password, status } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: 0,
        message: "Username, email and password are required",
      });
    }

    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res
        .status(400)
        .json({ status: 0, message: "Email already exists" });
    }

    const user = await User.create({
      role_id: role_id || null,
      zone_id: zone_id || null,
      username,
      email,
      password,
      status: status ?? 1,
    });

    return res.json({
      status: 1,
      message: "User created",
      data: user,
    });
  } catch (err) {
    console.error("createUser error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Error creating user" });
  }
};

// PUT /users/:id
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: 0, message: "User not found" });
    }

    const { role_id, zone_id, username, email, password, status } = req.body;

    if (email && email !== user.email) {
      const exist = await User.findOne({ where: { email } });
      if (exist) {
        return res
          .status(400)
          .json({ status: 0, message: "Email already exists" });
      }
    }

    user.role_id = role_id ?? user.role_id;
    user.zone_id = zone_id ?? user.zone_id;
    user.username = username ?? user.username;
    user.email = email ?? user.email;
    if (password && password !== "") {
      user.password = password;
    }
    if (status !== undefined) {
      user.status = status;
    }

    await user.save();

    return res.json({
      status: 1,
      message: "User updated",
      data: user,
    });
  } catch (err) {
    console.error("updateUser error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Error updating user" });
  }
};

// PATCH /users/:id/status
exports.changeUserStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: 0, message: "User not found" });
    }

    if (status !== undefined) {
      user.status = status;
    } else {
      user.status = user.status === 1 ? 0 : 1;
    }

    await user.save();

    return res.json({
      status: 1,
      message: "Status updated",
      data: user,
    });
  } catch (err) {
    console.error("changeUserStatus error:", err);
    return res
      .status(500)
      .json({ status: 0, message: "Error updating status" });
  }
};
