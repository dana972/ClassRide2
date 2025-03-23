const client = require("../config/db");

const getStudentDashboard = async (req, res) => {
  try {
    const studentPhone = req.user.phone_number;
    console.log("Fetching student dashboard for:", studentPhone);

    // Get user info
    const userResult = await client.query('SELECT * FROM users WHERE phone_number = $1', [studentPhone]);
    if (userResult.rows.length === 0) {
      console.log("Student user not found");
      return res.status(404).send("Student not found");
    }

    const studentResult = await client.query('SELECT * FROM students WHERE phone_number = $1', [studentPhone]);
    if (studentResult.rows.length === 0) {
      console.log("Student data not found");
      return res.status(404).send("Student data not found");
    }

    const user = userResult.rows[0];
    const student = studentResult.rows[0];

    // ✅ Fetch conversations like in getDashboard
    const conversationsResult = await client.query(`
      SELECT 
        c.chat_id,
        c.participant_1_phone,
        c.participant_2_phone,
        u.full_name AS other_full_name
      FROM chats c
      JOIN users u 
        ON u.phone_number = CASE 
                              WHEN c.participant_1_phone = $1 THEN c.participant_2_phone 
                              ELSE c.participant_1_phone 
                            END
      WHERE c.participant_1_phone = $1 OR c.participant_2_phone = $1
    `, [studentPhone]);

    const conversations = conversationsResult.rows.map(row => ({
      id: row.chat_id,
      name: row.other_full_name
    }));

    // ✅ Render student dashboard
    res.render("studentDashboard", {
      studentName: user.full_name,
      location: student.location,
      schedule: student.schedule,
      attendance: student.attendance,
      user: req.user,
     conversations, // for chat.ejs partial
      currentUserPhone: studentPhone // for frontend to identify user
    });
  } catch (err) {
    console.error("Error loading student dashboard:", err);
    res.status(500).send("Error loading dashboard");
  }
};

module.exports = {
  getStudentDashboard
};
