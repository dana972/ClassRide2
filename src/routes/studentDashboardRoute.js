const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/authMiddleware");
const { getStudentDashboard } = require("../controllers/studentDashboardController");

router.get("/dashboard", verifyToken, (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).render("unauthorized", {
      message: "Access denied. Students only.",
    });
  }

  return getStudentDashboard(req, res); // ✅ correct controller
});

module.exports = router;
