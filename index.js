const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");

const connectDB = require("./connectDB");
const protect = require("./middleware/authMiddleware");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Ensure upload directory exists
const uploadPath = path.join(__dirname, "public", "uploads", "placement");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer setup for placement images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Controllers
const homeController = require("./controllers/homeController");
const aboutController = require("./controllers/aboutController");
const contentController = require("./controllers/contentController");
const brochureController = require("./controllers/brochureController");
const placementImagesController = require("./controllers/PlacementImagesController");
const termsConditionsController = require("./controllers/terms&conditionsController");
const privacyPolicyController = require("./controllers/privacyPolicyController");

// Route files
const EnrollmentRoutes = require("./routes/enrollmentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const galleryRoutes = require("./routes/gallery");
const educationRoutes = require("./routes/educationPartner");
const studentRoutes = require("./routes/studentRoutes");
const placementStudentsRoutes = require("./routes/placementStudents");
const faqRoutes = require("./routes/faqRoutes");
const logoImageRoutes = require("./routes/logoImageRoutes");
const studentReviewRoutes = require("./routes/studentReviewRoutes");
const aboutRoutes = require("./routes/adminAboutRoutes");
const contactRoutes = require("./routes/contactRoutes");
const mdciGalleryRoutes = require("./routes/mdciGalleryRoutes");
const eventRoutes = require("./routes/eventRoutes");
const courseRoutes = require("./routes/courseRoutes");
const universityRoutes = require("./routes/universityRoutes");
const bannerInquiryRoutes = require("./routes/bannerInquiryRoutes");

// === Routes ===

// Static pages
app.get("/", homeController.renderHomePage);
app.get("/edit-page", protect, homeController.renderAdminPage);
app.get("/aboutUs", aboutController.renderPageAboutUs);
app.get("/admin-aboutUs", protect, aboutController.renderAdminPageAboutUs);
app.get("/ourCourses", (req, res) => res.render("OurCourses"));
app.get("/university/colleges", (req, res) => res.render("university"));
app.get("/contact", (req, res) => res.render("contact"));
app.get("/terms&conditions", termsConditionsController.getTermsConditionsSection);
app.get("/privacyPolicy", privacyPolicyController.getprivacyPolicySection);

// University detail pages
app.get("/amityUniversity", (req, res) => res.render("amity_university"));
app.get("/chitkaraUniversity", (req, res) => res.render("chitkara_university"));
app.get("/kalingaUniversity", (req, res) => res.render("kalinga_university"));
app.get("/manavRachnaUniversity", (req, res) => res.render("manav_rachna_university"));
app.get("/vivekanandUniversity", (req, res) => res.render("vivekanand_university"));
app.get("/LPUUniversity", (req, res) => res.render("LPU_university"));

app.get("/gallery", (req, res) => res.render("gallery"));

// Admin dashboard
app.get("/admin/dashboard", protect, (req, res) => res.render("admin/dashboard"));

// Placement Partner Images
app.post("/placement-image", upload.array("image", 10), placementImagesController.uploadPlacementImages);
app.post("/delete-image/:id", placementImagesController.deletePlacementImage);

// Admin Terms & Privacy Policy Section
app.get("/admin-terms&conditions", protect, termsConditionsController.getAdminTermsConditionsSection);
app.get("/admin-privacyPolicy", protect, privacyPolicyController.getAdminprivacyPolicySection);

// Update content
app.post("/update-content", contentController.updateContent);

// Use modular routes
app.use("/admin/brochure", brochureController(upload, uploadPath));
app.use("/", faqRoutes);
app.use("/", mdciGalleryRoutes);
app.use("/", logoImageRoutes);
app.use("/", galleryRoutes);
app.use("/", educationRoutes);
app.use("/", placementStudentsRoutes);
app.use("/", studentRoutes);
app.use("/", eventRoutes);
app.use("/", courseRoutes);
app.use("/", EnrollmentRoutes);
app.use("/", bannerInquiryRoutes);
app.use("/admin", universityRoutes);
app.use(aboutRoutes);
app.use(contactRoutes);
app.use(adminRoutes);
app.use(studentReviewRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send("Something went wrong!");
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
