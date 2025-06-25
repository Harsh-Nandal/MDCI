const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { isAdminLoggedIn } = require("./middleware/authMiddleware");

// Load environment variables
dotenv.config();

const app = express(); // ✅ Initialize app before any app.use
const port = process.env.PORT || 3000;

// Controllers
const homeController = require("./controllers/homeController");
const aboutController = require("./controllers/aboutController");
const contentController = require("./controllers/contentController");
const brochureController = require("./controllers/brochureController");
const placementImagesController = require("./controllers/PlacementImagesController");
const termsConditionsController = require("./controllers/terms&conditionsController");
const privacyPolicyController = require("./controllers/privacyPolicyController");
const EnrollmentRoutes = require("./routes/enrollmentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Routes
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

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Optional: stop app if DB fails
  }
};

module.exports = connectDB;

// Ensure upload path exists
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

// Routes
app.get("/", homeController.renderHomePage);
app.get("/aboutUs", aboutController.renderPageAboutUs);
app.get("/edit-page", homeController.renderAdminPage);
app.get("/admin-aboutUs", aboutController.renderAdminPageAboutUs);

app.use(aboutRoutes);
app.use(contactRoutes);
app.use("/", mdciGalleryRoutes);
app.use("/", logoImageRoutes);

// Placement Partners Images
app.post(
  "/placement-image",
  upload.array("image", 10),
  placementImagesController.uploadPlacementImages
);
app.post("/delete-image/:id", placementImagesController.deletePlacementImage);

// Other Routes
app.use("/", galleryRoutes);
app.use("/", educationRoutes);
app.use(studentReviewRoutes);
app.use("/", placementStudentsRoutes);
app.use("/", studentRoutes);
app.use("/", eventRoutes);
app.use("/", courseRoutes);
app.use("/admin", universityRoutes);
app.use("/", EnrollmentRoutes);
app.use("/", bannerInquiryRoutes);
app.use("/", adminRoutes);

// Content update
app.post("/update-content", contentController.updateContent);

// Terms and Conditions admin page routes
app.get(
  "/admin-terms&conditions",
  termsConditionsController.getAdminTermsConditionsSection
);
app.get(
  "/terms&conditions",
  termsConditionsController.getTermsConditionsSection
);

// Privacy Policy admin page routes
app.get(
  "/admin-privacyPolicy",
  privacyPolicyController.getAdminprivacyPolicySection
);
app.get("/privacyPolicy", privacyPolicyController.getprivacyPolicySection);

// Brochure routes
app.use("/admin/brochure", brochureController(upload, uploadPath));

// FAQ routes
app.use("/", faqRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send("Something went wrong!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
