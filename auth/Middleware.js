const jwt = require("jsonwebtoken");

const auth = (requiredRoles = null) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;

      if (requiredRoles) {
        if (Array.isArray(requiredRoles)) {
          // Allow multiple roles
          if (!requiredRoles.includes(decoded.role)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
          }
        } else {
          // Single role case
          if (decoded.role !== requiredRoles) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
          }
        }
      }

      next();
    } catch (error) {
      return res.status(400).json({ message: "Invalid token." });
    }
  };
};

module.exports = auth;
