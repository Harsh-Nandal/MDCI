// routes/bannerInquiryRoutes.js
const express = require("express");
const router = express.Router();
const BannerInquiry = require("../models/BannerInquiry");

// View all inquiries
router.get("/admin/counsel-list", async (req, res) => {
  const inquiries = await BannerInquiry.find().sort({ createdAt: -1 });
  res.render("admin/counsel-list", { inquiries });
});

router.post("/banner-inquiry", async (req, res) => {
  try {
    const { fullName, phone, courseChoice } = req.body;

    await BannerInquiry.create({
      fullName,
      phone,
      courseChoice,
    });

    res.redirect("/"); // redirect to home after submission
  } catch (err) {
    console.error("Error saving banner inquiry:", err);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
