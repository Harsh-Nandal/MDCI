const express = require("express");
const router = express.Router();
const Enrollment = require("../models/Enrollment");

router.get("/admin/enrollment-list", async (req, res) => {
  const enrollments = await Enrollment.find().sort({ createdAt: -1 });
  res.render("admin/enrollment-list", { enrollments });
});
router.post("/admin/enrollment/:id/delete", async (req, res) => {
  await Enrollment.findByIdAndDelete(req.params.id);
  res.redirect('/admin/enrollment-list');
});

// POST: Save enrollment form data
router.post("/enroll", async (req, res) => {
  try {
    const { fullName, email, phone, dob, state, courseChoice } = req.body;

    await Enrollment.create({
      fullName,
      email,
      phone,
      dob,
      state,
      courseChoice,
    });

    res.redirect("/");
  } catch (error) {
    console.error("Enrollment save error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const ContactInquiry = require("../models/ContactInquiry");

// POST: Save contact form data
router.post("/contact-inquiry", async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    await ContactInquiry.create({ name, email, phone });

    // If it’s an AJAX form:
    // return res.status(200).json({ message: "Success" });

    // If regular form POST:
    res.redirect("/");
  } catch (err) {
    console.error("Contact inquiry error:", err);
    res.status(500).send("Something went wrong");
  }
});
router.get("/admin/get-in-touch-list", async (req, res) => {
  const inquiries = await ContactInquiry.find().sort({ createdAt: -1 });
  res.render("admin/get-in-touch", { inquiries });
});
router.post("/admin/get-in-touch/:id/delete", async (req, res) => {
  await ContactInquiry.findByIdAndDelete(req.params.id);
  res.redirect("/admin/get-in-touch-list");
});

module.exports = router;
