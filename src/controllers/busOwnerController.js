const client = require('../config/db'); // Import the database client 

const getDashboard = async (req, res) => {
    try {
        const ownerPhone = '1234567890';  // Replace with dynamic `req.user.phone_number` if authentication is implemented

        // Fetch the owner's name
        const ownerResult = await client.query('SELECT * FROM users WHERE phone_number = $1', [ownerPhone]);
        if (ownerResult.rows.length === 0) {
            return res.status(404).send("Owner not found");
        }
        const ownerName = ownerResult.rows[0].full_name;

        // Fetch buses and drivers
        const busesResult = await client.query('SELECT * FROM buses WHERE owner_phone = $1', [ownerPhone]);
        const driversResult = await client.query(`
            SELECT drivers.phone_number, users.full_name, drivers.location
            FROM drivers
            JOIN users ON drivers.phone_number = users.phone_number
            WHERE drivers.owner_phone = $1`, [ownerPhone]);

        // Count students
        const studentsResult = await client.query('SELECT COUNT(*) FROM students WHERE owner_phone = $1', [ownerPhone]);
        const studentsCount = studentsResult.rows[0].count;

        // Count join requests
        const joinRequestsCountResult = await client.query('SELECT COUNT(*) FROM students_join_requests WHERE owner_phone = $1', [ownerPhone]);
        const joinRequestsCount = joinRequestsCountResult.rows[0].count;

        // Fetch pending join requests for this owner
        const joinRequestsResult = await client.query(`
            SELECT sjr.id, sjr.student_phone, u.full_name, sjr.status
            FROM students_join_requests sjr
            JOIN users u ON sjr.student_phone = u.phone_number
            WHERE sjr.owner_phone = $1 AND sjr.status = 'pending'`, [ownerPhone]);
        const joinRequests = joinRequestsResult.rows;

        // Fetch destinations
        const destinationsResult = await client.query('SELECT * FROM destinations');
        const destinations = destinationsResult.rows;

        // Render the dashboard with the new joinRequests data
        res.render('busOwnerDashboard', { 
            ownerName, 
            buses: busesResult.rows,
            drivers: driversResult.rows,
            studentsCount,
            joinRequestsCount,
            destinations,
            joinRequests // Added joinRequests data
        });
    } catch (err) {
        console.error("Error fetching dashboard data", err.stack);
        res.status(500).send("Error loading dashboard");
    }
};

module.exports = { getDashboard };
