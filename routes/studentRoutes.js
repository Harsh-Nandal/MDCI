const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../middleware/authMiddleware");


// Upload folder setup
const uploadPath = path.join(__dirname, "../uploads/students");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + ext);
  },
});
const upload = multer({ storage });

// 🚀 Show all students + form
router.get("/admin/student/enroll",protect, async (req, res) => {
  const students = await Student.find()
    .populate("course")
    .sort({ createdAt: -1 });
  const courses = await Course.find();
  res.render("admin/student-enroll", { students, courses });
});

// ✅ Handle new student creation
router.post("/student/enroll", upload.single("image"), async (req, res) => {
  const studentData = req.body;

  if (req.file) {
    studentData.imagePath = "/uploads/students/" + req.file.filename;
  }

  if (!studentData.course || studentData.course.trim() === "") {
    return res.status(400).send("Course selection is required");
  }

  await Student.create(studentData);
  res.redirect("/admin/student/enroll");
});

// ❌ Delete student
router.post("/admin/student/delete/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (student?.imagePath) {
    const fullPath = path.join(__dirname, "..", student.imagePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
  await Student.findByIdAndDelete(req.params.id);
  res.redirect("/admin/student/enroll");
});

// ✏️ Show edit student form
router.get("/admin/student/edit/:id",protect, async (req, res) => {
  const student = await Student.findById(req.params.id);
  const courses = await Course.find();
  if (!student) return res.status(404).send("Student not found");
  res.render("admin/student-edit", { student, courses });
});

// ✅ Handle student update
router.post(
  "/admin/student/edit/:id",
  upload.single("image"),
  async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send("Student not found");

    if (req.file) {
      if (student.imagePath) {
        const oldPath = path.join(__dirname, "..", student.imagePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.imagePath = "/uploads/students/" + req.file.filename;
    } else {
      req.body.imagePath = student.imagePath;
    }

    if (!req.body.course || req.body.course.trim() === "") {
      return res.status(400).send("Course selection is required");
    }

    await Student.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin/student/enroll");
  }
);

// ✨ Show fees form
router.get("/admin/student/:id/fees",protect, async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).send("Student not found");
  res.render("admin/student-fees", { student });
});

router.post("/admin/student/:id/fees", async (req, res) => {
  const { totalFees, discountPercent, amountPaid, lastPaidDate, receiptNo } =
    req.body;

  const total = parseFloat(totalFees) || 0;
  const discount = parseFloat(discountPercent) || 0;
  const discountAmount = (total * discount) / 100;
  const finalAmount = total - discountAmount;
  const paid = parseFloat(amountPaid) || 0;
  const dues = finalAmount - paid;

  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).send("Student not found");

  // Initialize fees & installments if missing
  if (!student.fees) student.fees = {};
  if (!student.fees.installments) student.fees.installments = [];

  const prevPaid = parseFloat(student.fees.amountPaid || 0);
  const delta = paid - prevPaid;

  // ✅ FIRST PAYMENT (no installments yet)
  if (
    student.fees.installments.length === 0 &&
    paid > 0 &&
    lastPaidDate &&
    receiptNo
  ) {
    student.fees.installments.push({
      amount: paid,
      date: new Date(lastPaidDate),
      receiptNo,
    });
  }

  // ✅ SUBSEQUENT PAYMENT (only add delta as installment)
  else if (delta > 0 && lastPaidDate && receiptNo) {
    student.fees.installments.push({
      amount: delta,
      date: new Date(lastPaidDate),
      receiptNo,
    });
  }

  // ✅ Update fees object
  student.fees.totalFees = total;
  student.fees.discountPercent = discount;
  student.fees.discountAmount = discountAmount;
  student.fees.finalAmount = finalAmount;
  student.fees.amountPaid = paid;
  student.fees.dues = dues;
  student.fees.lastPaidDate = lastPaidDate || null;
  student.fees.receiptNo = receiptNo || "";

  await student.save();

  res.redirect("/admin/student/enroll");
});

// 💰 Fees structure table
router.get("/admin/student/fees-structure",protect, async (req, res) => {
  const students = await Student.find().populate("course").sort({ name: 1 });
  res.render("admin/fees-Structure", { students });
});

module.exports = router;
