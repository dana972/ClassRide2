const getDashboard = async (req, res) => {
    // Check if the user has the 'pending' role
    if (req.user.role === 'pending') {
        // User is pending, so deny access
        return res.status(403).json({ message: "Your account is pending approval. Please wait for the admin to approve your account." });
    }

    // Check if the user has the 'owner' role
    if (req.user.role === 'owner') {
        // User is an owner, so show the dashboard
        return res.json({ message: "Welcome to your dashboard", user: req.user });
    }

    // User is not an owner or pending, so deny access
    return res.status(403).json({ message: "Access denied. You are not authorized to view the dashboard." });
};

module.exports = { getDashboard };
