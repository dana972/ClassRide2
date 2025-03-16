const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../config/db");
require("dotenv").config();

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { phone_number: user.phone_number, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

// Signup Controller
exports.signup = async (req, res) => {
    const { full_name, phone_number, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query(
            "INSERT INTO users (full_name, phone_number, password, role) VALUES ($1, $2, $3, 'owner') RETURNING *",
            [full_name, phone_number, hashedPassword]
        );

        const token = generateToken(result.rows[0]);

        res.status(201).json({ message: "Signup successful", token, user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing up" });
    }
};

// Login Controller
exports.login = async (req, res) => {
    const { phone_number, password } = req.body;

    try {
        const result = await client.query("SELECT * FROM users WHERE phone_number = $1", [phone_number]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in" });
    }
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

// Example Protected Route
exports.protectedRoute = (req, res) => {
    res.json({ message: "You have access to this protected route", user: req.user });
};
