const client = require('../config/db'); // Import the database client

// Function to fetch dashboard data
const getDashboard = async (req, res) => {
  try {
    const ownerPhone = req.user.phone_number;

    console.log("Fetching dashboard for:", ownerPhone);

    const ownerResult = await client.query('SELECT * FROM users WHERE phone_number = $1', [ownerPhone]);

    if (ownerResult.rows.length === 0) {
      console.log("Owner not found in database");
      return res.status(404).send("Owner not found");
    }

    const ownerName = ownerResult.rows[0].full_name;

    const busesResult = await client.query('SELECT * FROM buses WHERE owner_phone = $1', [ownerPhone]);

    const driversResult = await client.query(`
      SELECT drivers.phone_number, users.full_name, drivers.location
      FROM drivers
      JOIN users ON drivers.phone_number = users.phone_number
      WHERE drivers.owner_phone = $1
    `, [ownerPhone]);

    const studentsCountResult = await client.query('SELECT COUNT(*) FROM students WHERE owner_phone = $1', [ownerPhone]);

    const studentsListResult = await client.query(`
      SELECT users.full_name, users.phone_number, students.location, students.schedule, students.attendance
      FROM students
      JOIN users ON students.phone_number = users.phone_number
      WHERE students.owner_phone = $1
    `, [ownerPhone]);

    const joinRequestsResult = await client.query('SELECT COUNT(*) FROM students_join_requests WHERE owner_phone = $1', [ownerPhone]);

    const destinationsResult = await client.query('SELECT * FROM destinations WHERE owner_phone = $1', [ownerPhone]);

    res.render('busOwnerDashboard', {
      ownerName,
      buses: busesResult.rows,
      drivers: driversResult.rows,
      students: studentsListResult.rows, // ✅ actual student records
      studentsCount: studentsCountResult.rows[0].count,
      joinRequestsCount: joinRequestsResult.rows[0].count,
      destinations: destinationsResult.rows
    });

  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).send("Error loading dashboard");
  }
};

// Function to remove a bus
const removeBus = async (req, res) => {
  const { id } = req.params;
  const ownerPhone = req.user.phone_number;

  try {
    const result = await client.query(
      'DELETE FROM buses WHERE bus_id = $1 AND owner_phone = $2',
      [id, ownerPhone]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Bus not found or not authorized' });
    }

    res.status(200).json({ message: 'Bus removed successfully' });
  } catch (err) {
    console.error("Error removing bus:", err);
    res.status(500).json({ error: 'Failed to remove bus' });
  }
};

// Function to remove a destination
const removeDestination = async (req, res) => {
  const { id } = req.params;
  const ownerPhone = req.user.phone_number;

  try {
    const result = await client.query(
      'DELETE FROM destinations WHERE destination_id = $1 AND owner_phone = $2',
      [id, ownerPhone]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Destination not found or not authorized' });
    }

    res.status(200).json({ message: 'Destination removed successfully' });
  } catch (err) {
    console.error("Error removing destination:", err);
    res.status(500).json({ error: 'Failed to remove destination' });
  }
};

// Function to remove a driver
const removeDriver = async (req, res) => {
  const { id } = req.params;
  const ownerPhone = req.user.phone_number;

  try {
    const result = await client.query(
      'DELETE FROM drivers WHERE phone_number = $1 AND owner_phone = $2',
      [id, ownerPhone]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Driver not found or not authorized' });
    }

    res.status(200).json({ message: 'Driver removed successfully' });
  } catch (err) {
    console.error("Error removing driver:", err);
    res.status(500).json({ error: 'Failed to remove driver' });
  }
};

// ✅ Function to remove a student
const removeStudent = async (req, res) => {
  const { id } = req.params;
  const ownerPhone = req.user.phone_number;

  try {
    const result = await client.query(
      'DELETE FROM students WHERE phone_number = $1 AND owner_phone = $2',
      [id, ownerPhone]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Student not found or not authorized' });
    }

    res.status(200).json({ message: 'Student removed successfully' });
  } catch (err) {
    console.error("Error removing student:", err);
    res.status(500).json({ error: 'Failed to remove student' });
  }
};

// Function to add a bus
const addBus = async (req, res) => {
  const ownerPhone = req.user.phone_number;
  const { busName, capacity } = req.body;

  try {
    await client.query(
      'INSERT INTO buses (bus_name, capacity, owner_phone) VALUES ($1, $2, $3)',
      [busName, capacity, ownerPhone]
    );

    res.status(201).json({ message: 'Bus added successfully' });
  } catch (err) {
    console.error('Error adding bus:', err);
    res.status(500).json({ error: 'Failed to add bus' });
  }
};

// Function to add a destination
const addDestination = async (req, res) => {
  const ownerPhone = req.user.phone_number;
  const { destinationName, location } = req.body;

  try {
    await client.query(
      'INSERT INTO destinations (name, location, owner_phone) VALUES ($1, $2, $3)',
      [destinationName, location, ownerPhone]
    );

    res.status(201).json({ message: 'Destination added successfully' });
  } catch (err) {
    console.error('Error adding destination:', err);
    res.status(500).json({ error: 'Failed to add destination' });
  }
};
const createTrip = async (req, res) => {
  const ownerPhone = req.user.phone_number;
  const { bus_id, driver_phone, destination_id, pickup_time } = req.body;

  try {
    await client.query(
      `INSERT INTO trips (
        bus_id, driver_phone, destination_id, pickup_time, date, type, status, schedule
      ) VALUES (
        $1, $2, $3, $4, CURRENT_DATE + INTERVAL '1 day', 'regular', 'scheduled', $5
      )`,
      [bus_id, driver_phone, destination_id, pickup_time, 'morning']
    );

    res.status(201).json({ message: 'Trip created successfully' });
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).json({ error: 'Failed to create trip' });
  }
};


module.exports = {
  getDashboard,
  removeBus,
  removeDestination,
  removeDriver,
  removeStudent,      // ✅ Exported
  addBus,
  addDestination,
  createTrip
};
