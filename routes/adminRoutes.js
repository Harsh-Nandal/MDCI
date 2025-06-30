const express = require("express");
const router = express.Router();
const Admin = require("../models/AdminModel");
const SiteConfig = require("../models/SiteConfig");
const Image = require("../models/Image");

// GET /admin-login
router.get("/admin-login", async (req, res) => {
  let headerImageUrl = "/simpleImage.png";

  try {
    const config = await SiteConfig.findOne();
    if (config?.headerImageId) {
      const image = await Image.findById(config.headerImageId);
      if (image?.url) {
        headerImageUrl = image.url;
      }
    }
  } catch (err) {
    console.error("Error loading header image for admin login:", err);
  }

  // ✅ Always send errorMessage (null by default)
  res.render("admin-login", { headerImageUrl, errorMessage: null });
});

// POST /admin/login
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (!admin) {
      console.log("❌ Admin not found");
    } else {
      console.log("✅ Admin found:", admin.username);
    }

    const isMatch = admin ? await admin.matchPassword(password) : false;

    if (!admin || !isMatch) {
      console.log("❌ Invalid credentials");

      let headerImageUrl = "/simpleImage.png";
      const config = await SiteConfig.findOne();
      if (config?.headerImageId) {
        const image = await Image.findById(config.headerImageId);
        if (image?.url) headerImageUrl = image.url;
      }

      return res.status(401).render("admin-login", {
        errorMessage: "Invalid username or password",
        headerImageUrl,
      });
    }

    // ✅ Store session
    req.session.admin = {
      id: admin._id,
      username: admin.username,
    };

    console.log("✅ Login successful");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("❌ Server error during login:", err);
    res.status(500).send("Server error");
  }
});
// Logout route
router.get("/admin/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error destroying session:", err);
      return res.status(500).send("Could not log out.");
    }
    res.clearCookie("connect.sid"); // optional: clear session cookie
    res.redirect("/admin-login");  // or any other login/home page
  });
});


module.exports = router;
