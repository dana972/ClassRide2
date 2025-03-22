const client = require('../config/db'); // Import the database client

// Function to fetch dashboard data
const getDashboard = async (req, res) => {
    try {
        const ownerPhone = req.user.phone_number;  // Use logged-in user's phone

        console.log("Fetching dashboard for:", ownerPhone);

        const ownerResult = await client.query('SELECT * FROM users WHERE phone_number = $1', [ownerPhone]);

        if (ownerResult.rows.length === 0) {
            console.log("Owner not found in database");
            return res.status(404).send("Owner not found");
        }

        const ownerName = ownerResult.rows[0].full_name;

        // Fetch data related to the owner
        const busesResult = await client.query('SELECT * FROM buses WHERE owner_phone = $1', [ownerPhone]);
        const driversResult = await client.query(`
            SELECT drivers.phone_number, users.full_name, drivers.location
            FROM drivers
            JOIN users ON drivers.phone_number = users.phone_number
            WHERE drivers.owner_phone = $1`, [ownerPhone]);

        const studentsResult = await client.query('SELECT COUNT(*) FROM students WHERE owner_phone = $1', [ownerPhone]);

        // Modify to fetch join requests specific to the owner
        const joinRequestsResult = await client.query('SELECT COUNT(*) FROM students_join_requests WHERE owner_phone = $1', [ownerPhone]);

        // Modify to fetch destinations specific to the owner
        const destinationsResult = await client.query('SELECT * FROM destinations WHERE owner_phone = $1', [ownerPhone]);

        res.render('busOwnerDashboard', { 
            ownerName, 
            buses: busesResult.rows,
            drivers: driversResult.rows,
            studentsCount: studentsResult.rows[0].count,
            joinRequestsCount: joinRequestsResult.rows[0].count,
            destinations: destinationsResult.rows
        });

    } catch (err) {
        console.error("Error fetching dashboard data:", err);
        res.status(500).send("Error loading dashboard");
    }
};


module.exports = { getDashboard};
