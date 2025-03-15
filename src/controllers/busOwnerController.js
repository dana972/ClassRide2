const client = require('../config/db'); // Import the database client 

const getDashboard = async (req, res) => {
    try {
        const ownerPhone = '1234567890';  // For now, use a static value for ownerPhone

        // Fetch the owner's name using owner_phone (from the 'users' table)
        const ownerResult = await client.query('SELECT * FROM users WHERE phone_number = $1', [ownerPhone]);

        if (ownerResult.rows.length === 0) {
            console.log("Owner not found");
            return res.status(404).send("Owner not found");
        }

        // Get the owner's full_name
        const ownerName = ownerResult.rows[0].full_name;  // Get the owner's full name

        // Log the name for debugging
        console.log("Owner Name: ", ownerName);

        // Fetch buses and drivers associated with the owner
        const busesResult = await client.query('SELECT * FROM buses WHERE owner_phone = $1', [ownerPhone]);
        const driversResult = await client.query(`
            SELECT drivers.phone_number, users.full_name, drivers.location
            FROM drivers
            JOIN users ON drivers.phone_number = users.phone_number
            WHERE drivers.owner_phone = $1`, [ownerPhone]);
        
        // Count the number of students associated with the owner
        const studentsResult = await client.query('SELECT COUNT(*) FROM students WHERE owner_phone = $1', [ownerPhone]);
        const studentsCount = studentsResult.rows[0].count;

        // Fetch the count of join requests (assuming there is a students_join_requests table)
        const joinRequestsResult = await client.query('SELECT COUNT(*) FROM students_join_requests');
        const joinRequestsCount = joinRequestsResult.rows[0].count;

        // Fetch the destinations (assuming a "destinations" table)
        const destinationsResult = await client.query('SELECT * FROM destinations');
        const destinations = destinationsResult.rows;

        // Render the dashboard with the owner's name, buses, drivers, and other data
        res.render('busOwnerDashboard', { 
            ownerName: ownerName, 
            buses: busesResult.rows,
            drivers: driversResult.rows,
            studentsCount: studentsCount,
            joinRequestsCount: joinRequestsCount,
            destinations: destinations
        });
    } catch (err) {
        console.error("Error fetching dashboard data", err.stack);
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
