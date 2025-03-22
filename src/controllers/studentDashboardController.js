const pool = require("../config/db");

const getStudentDashboard = async (req, res) => {
  try {
    const phoneNumber = req.user.phone_number;

    // Get the student name from users table using phone_number
    const { rows: userRows } = await pool.query(
      "SELECT full_name FROM users WHERE phone_number = $1",
      [phoneNumber]
    );

    const studentName = userRows[0]?.full_name || "Student";

    res.render("studentDashboard", {
      studentName
    });

  } catch (err) {
    console.error("❌ Error loading student dashboard:", err);
    res.status(500).send("Something went wrong while loading the dashboard.");
  }
};

module.exports = { getStudentDashboard };
