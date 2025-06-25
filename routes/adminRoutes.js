const express = require("express");
const router = express.Router();
const Admin = require("../models/AdminModel");
const jwt = require("jsonwebtoken");



router.get("/admin-login", (req, res) => {
  res.render("admin-login");
});

// Login Route
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(401).json({ message: "Invalid username or password" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid username or password" });

    // Create a token (for session or frontend use)
    const token = jwt.sign({ id: admin._id }, "your_jwt_secret", {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

exports.isAdminLoggedIn = (req, res, next) => {
  if (req.session && req.session.admin) {
    return next(); // Admin is authenticated
  } else {
    return res.redirect("/admin-login"); // Not logged in
  }
};

module.exports = router;
