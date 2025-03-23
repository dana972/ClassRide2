const db = require("../config/db");

exports.getChatMessages = async (req, res) => {
  const userPhone = req.user.phone_number;
  const otherPhone = req.params.phone;

  try {
    const result = await db.query(`
      SELECT * FROM messages
      WHERE (sender_phone = $1 AND receiver_phone = $2)
         OR (sender_phone = $2 AND receiver_phone = $1)
      ORDER BY timestamp ASC
    `, [userPhone, otherPhone]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error loading chat messages:", err);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
};

exports.getChatHistory = async (req, res) => {
  const userPhone = req.user.phone_number;
  console.log("📥 Chat history requested by:", userPhone);

  try {
    const result = await db.query(`
      SELECT DISTINCT
        CASE
          WHEN sender_phone = $1 THEN receiver_phone
          ELSE sender_phone
        END AS other_user
      FROM messages
      WHERE sender_phone = $1 OR receiver_phone = $1
    `, [userPhone]);

    console.log("🗂️ Raw contacts from messages table:", result.rows);

    const chatList = [];

    for (const row of result.rows) {
      try {
        const userResult = await db.query(`
          SELECT full_name FROM users WHERE phone_number = $1
        `, [row.other_user]);

        const name = userResult.rows[0]?.full_name || row.other_user;

        console.log(`👤 Fetched name for ${row.other_user}:`, name);

        chatList.push({
          phone_number: row.other_user,
          name: name
        });
      } catch (userErr) {
        console.error(`❌ Error fetching user for phone ${row.other_user}:`, userErr);
      }
    }

    console.log("✅ Final chat list:", chatList);
    res.json(chatList);

  } catch (err) {
    console.error("❌ Error loading chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};
