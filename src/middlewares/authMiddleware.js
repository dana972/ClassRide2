const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the user is actually an 'owner' and not pending
    if (decoded.role !== "owner") {
      return res.json({ status: "pending", message: "Your role is still pending." });
    }

    req.user = decoded; // Attach the decoded user
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};
