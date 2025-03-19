const client = require('../config/db'); // Import the database client

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


const deleteBus = async (req, res) => {
    try {
        const { id } = req.params;
        await client.query('DELETE FROM buses WHERE id = $1', [id]);
        res.status(200).json({ message: "Bus deleted successfully" });
    } catch (err) {
        console.error("Error deleting bus:", err);
        res.status(500).json({ error: "Failed to delete bus" });
    }
};

const deleteDestination = async (req, res) => {
    try {
        console.log("DELETE request received for ID:", req.params.id);

        const { id } = req.params;

        // Ensure the ID is a valid number
        if (isNaN(id)) {
            console.log("Invalid ID received");
            return res.status(400).json({ error: "Invalid destination ID" });
        }

        // Use destination_id instead of id
        const result = await client.query("DELETE FROM destinations WHERE destination_id = $1", [id]);

        console.log("Query Result:", result);

        if (result.rowCount === 0) {
            console.log("No destination found with that ID");
            return res.status(404).json({ error: "Destination not found" });
        }

        res.status(200).json({ message: "Destination deleted successfully" });
    } catch (err) {
        console.error("Error deleting destination:", err);
        res.status(500).json({ error: "Failed to delete destination" });
    }
};

const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params;
        await client.query('DELETE FROM drivers WHERE phone_number = $1', [id]); // Assuming ID is phone_number
        res.status(200).json({ message: "Driver deleted successfully" });
    } catch (err) {
        console.error("Error deleting driver:", err);
        res.status(500).json({ error: "Failed to delete driver" });
    }
};

module.exports = { getDashboard, deleteBus, deleteDestination, deleteDriver };