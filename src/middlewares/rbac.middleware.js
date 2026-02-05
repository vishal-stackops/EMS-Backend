// middlewares/rbac.middleware.js
const Role = require("../models/Role");
const User = require("../models/User");

const authorize = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).populate("role");
      if (!user || !user.isActive)
        return res.status(403).json({ message: "User not allowed" });

      const permissions = user.role.permissions;

      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: "Authorization error" });
    }
  };
};

module.exports = authorize;
