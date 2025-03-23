const client = require("../config/db");

exports.getStudentDashboard = async (req, res) => {
  try {
    const phone = req.user.phone_number;

    // Fetch student details
    const userResult = await client.query(
      `SELECT * FROM users WHERE phone_number = $1`,
      [phone]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).send("Student not found");
    }

    const studentResult = await client.query(
      `SELECT * FROM students WHERE phone_number = $1`,
      [phone]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).send("Student data not found");
    }

    const user = userResult.rows[0];
    const student = studentResult.rows[0];

    // Render student dashboard and pass full user info
    res.render("studentDashboard", {
      studentName: user.full_name,
      location: student.location,
      schedule: student.schedule,
      attendance: student.attendance,
      user: req.user // ✅ So <%= user.role %> works in chats.ejs
    });
  } catch (err) {
    console.error("Error loading student dashboard:", err);
    res.status(500).send("Error loading dashboard");
  }
};
