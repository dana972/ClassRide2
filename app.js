const express = require("express");
const path = require("path");
const busOwnerRoutes = require("./src/routes/busOwnerRoutes");
const authRoutes = require("./src/routes/authRoutes"); 
const client = require("./src/config/db");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
    res.render("index");
});

app.use("/owner", busOwnerRoutes);
app.use("/api", authRoutes); // Use authentication routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
