const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Course = require("../models/Course");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const protect = require("../middleware/authMiddleware");
const catchAsync = require("../utils/catchAsync");

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
router.get(
  "/admin/student/enroll",
  protect,
  catchAsync(async (req, res) => {
    const students = await Student.find()
      .populate("course")
      .sort({ createdAt: -1 });
    const courses = await Course.find();
    res.render("admin/student-enroll", {
      students,
      courses,
      currentPath: req.path,
    });
  })
);


// ❌ Delete student
router.post(
  "/admin/student/delete/:id",
  catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (student?.imagePath?.startsWith("/uploads/")) {
      const fullPath = path.join(__dirname, "..", student.imagePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await Student.findByIdAndDelete(req.params.id);
    res.redirect("/admin/student/enroll");
  })
);

// ✏️ Show edit student form
router.get(
  "/admin/student/edit/:id",
  protect,
  catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);
    const courses = await Course.find();
    if (!student) return res.status(404).send("Student not found");
    res.render("admin/student-edit", {
      student,
      courses,
      currentPath: req.path,
    });
  })
);

// ... (your imports remain unchanged)

router.post(
  "/student/enroll",
  upload.single("image"),
  catchAsync(async (req, res) => {
    const studentData = req.body;

    // ✅ Set image path
    if (req.file) {
      studentData.imagePath = "/uploads/students/" + req.file.filename;
    }

    // ✅ Basic validation
    if (!studentData.course || studentData.course.trim() === "") {
      return res.status(400).send("Course selection is required");
    }
    if (!studentData.password || studentData.password.trim() === "") {
      return res.status(400).send("Password is required");
    }

    // ✅ Ensure registration number is unique
    const existingStudent = await Student.findOne({ regNo: studentData.regNo });
    if (existingStudent) {
      return res
        .status(400)
        .send("Student with this registration number already exists.");
    }

    // ✅ Set courseCategory (safe fallback)
    studentData.courseCategory = studentData.courseCategory || "";

    await Student.create(studentData);
    res.redirect("/admin/student/enroll");
  })
);

// ✅ Handle student update with courseCategory
router.post(
  "/admin/student/edit/:id",
  upload.single("image"),
  catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send("Student not found");

    // ✅ Handle new image
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

    // ✅ Preserve courseCategory
    req.body.courseCategory = req.body.courseCategory || "";

    await Student.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin/student/enroll");
  })
);

// ✨ Show fees form
router.get(
  "/admin/student/:id/fees",
  protect,
  catchAsync(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send("Student not found");
    res.render("admin/student-fees", { student, currentPath: req.path });
  })
);

// 💰 Handle fees submission
router.post(
  "/admin/student/:id/fees",
  catchAsync(async (req, res) => {
    const { totalFees, discountPercent, payAmount, lastPaidDate, receiptNo } =
      req.body;
    const total = parseFloat(totalFees) || 0;
    const discount = parseFloat(discountPercent) || 0;
    const discountAmount = (total * discount) / 100;
    const finalAmount = total - discountAmount;
    const payNow = parseFloat(payAmount) || 0;

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send("Student not found");

    if (!student.fees) student.fees = {};
    if (!student.fees.installments) student.fees.installments = [];

    const prevPaid = parseFloat(student.fees.amountPaid || 0);
    const newTotalPaid = prevPaid + payNow;
    const dues = finalAmount - newTotalPaid;

    if (payNow > 0 && lastPaidDate && receiptNo) {
      student.fees.installments.push({
        amount: payNow,
        date: new Date(lastPaidDate),
        receiptNo,
      });
    }

    const isFirstInstallment = student.fees.installments.length <= 1;
    if (isFirstInstallment) {
      student.fees.totalFees = total;
      student.fees.discountPercent = discount;
      student.fees.discountAmount = discountAmount;
      student.fees.finalAmount = finalAmount;
    }

    student.fees.amountPaid = newTotalPaid;
    student.fees.dues = dues;
    student.fees.lastPaidDate = lastPaidDate || null;
    student.fees.receiptNo = receiptNo || "";

    await student.save();
    res.redirect("/admin/student/enroll");
  })
);

// 💰 Fees structure table
router.get(
  "/admin/student/fees-structure",
  protect,
  catchAsync(async (req, res) => {
    const students = await Student.find().populate("course").sort({ name: 1 });
    res.render("admin/fees-Structure", { students, currentPath: req.path });
  })
);

module.exports = router;
