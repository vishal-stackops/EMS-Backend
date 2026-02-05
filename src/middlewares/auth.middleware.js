// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;

    if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = decoded; // { id, role, email }

    // Fallback: If email is missing (old token), fetch from DB
    if (!req.user.email && req.user.id) {
      const User = require("../models/User"); // Lazy load to avoid circular deps if any
      const user = await User.findById(req.user.id);
      if (user) req.user.email = user.email;
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/Expired token" });
  }
};

module.exports = authMiddleware;
