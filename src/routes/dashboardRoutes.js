const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { getDashboard } = require("../controllers/dashboardController");

// Route based on user role
router.get("/:role/dashboard", verifyToken, (req, res) => {
    const allowedRoles = ["owner", "student", "driver"];
    const userRole = req.user.role; // Assuming role is stored in req.user

    // Ensure role matches the URL and is allowed
    if (allowedRoles.includes(req.params.role) && req.params.role === userRole) {
        return getDashboard(req, res);
    } else {
        return res.status(403).json({ message: "Unauthorized" });
    }
});

module.exports = router;
