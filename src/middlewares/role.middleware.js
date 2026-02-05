module.exports = function(allowedRoles = []) {
  return (req, res, next) => {
    // FIX: Check if role is an object and get .name, otherwise use it as is
    const userRole = req.user.role && req.user.role.name ? req.user.role.name : req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
};