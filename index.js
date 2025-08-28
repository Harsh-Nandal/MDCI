const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const session = require("express-session");

const connectDB = require("./connectDB");
const protect = require("./middleware/authMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware"); // ✅ Include errorHandler
const University = require("./models/University");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

connectDB();

// Ensure upload folder exists
const uploadPath = path.join(__dirname, "public", "uploads", "placement");
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.get("/test-error", (req, res) => {
  throw new Error("Test error!");
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("env", "production");

// Load Controllers and Routes
const homeController = require("./controllers/homeController");
const aboutController = require("./controllers/aboutController");
const contentController = require("./controllers/contentController");
const brochureController = require("./controllers/brochureController");
const placementImagesController = require("./controllers/PlacementImagesController");
const termsConditionsController = require("./controllers/terms&conditionsController");
const privacyPolicyController = require("./controllers/privacyPolicyController");
const ourCoursesController = require("./controllers/ourCoursesController");

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
const adminDashboardRoutes = require("./routes/adminDashboard");
const studentDashboardRoutes = require("./routes/studentDashboard");
const marksRoutes = require("./routes/marksRoutes");
const subjectRoutes = require("./routes/subjectRoutes");

const SiteConfig = require("./models/SiteConfig");
const Image = require("./models/Image");

// Set global header image
app.use(async (req, res, next) => {
  try {
    const config = await SiteConfig.findOne();
    let headerImageUrl = "/simpleImage.png";

    if (config?.headerImageId) {
      const image = await Image.findById(config.headerImageId);
      if (image) headerImageUrl = image.url;
    }

    res.locals.headerImageUrl = headerImageUrl;
    next();
  } catch (err) {
    console.error("Header image error:", err);
    res.locals.headerImageUrl = "/simpleImage.png";
    next();
  }
});

// Static routes
app.get("/", homeController.renderHomePage);
app.get("/edit-page", protect, homeController.renderAdminPage);
app.get("/aboutUs", aboutController.renderPageAboutUs);
app.get("/admin-aboutUs", protect, aboutController.renderAdminPageAboutUs);
app.get("/ourCourses", ourCoursesController.renderOurCoursesPage);
app.get("/ourCourses/:id", ourCoursesController.renderCourseDetailsPage);
app.get("/gallery", (req, res) => res.render("gallery"));
app.get(
  "/terms&conditions",
  termsConditionsController.getTermsConditionsSection
);
app.get("/privacyPolicy", privacyPolicyController.getprivacyPolicySection);

app.get("/university/colleges", async (req, res) => {
  const universities = await University.find();
  res.render("university", { universities, currentPath: req.path });
});

app.get("/amityUniversity", (req, res) => res.render("amity_university"));
app.get("/chitkaraUniversity", (req, res) => res.render("chitkara_university"));
app.get("/kalingaUniversity", (req, res) => res.render("kalinga_university"));
app.get("/manavRachnaUniversity", (req, res) =>
  res.render("manav_rachna_university")
);
app.get("/vivekanandUniversity", (req, res) =>
  res.render("vivekanand_university")
);
app.get("/LPUUniversity", (req, res) => res.render("LPU_university"));

// Admin & other routes
app.use("/admin", adminDashboardRoutes);
app.use("/admin", universityRoutes);
app.use("/admin/marks", marksRoutes);
app.use("/admin/brochure", brochureController(upload, uploadPath));
app.get(
  "/admin-terms&conditions",
  protect,
  termsConditionsController.getAdminTermsConditionsSection
);
app.get(
  "/admin-privacyPolicy",
  protect,
  privacyPolicyController.getAdminprivacyPolicySection
);

app.use("/student", studentDashboardRoutes);
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
app.use("/", contactRoutes);
app.use(subjectRoutes);
app.use(aboutRoutes);
app.use(adminRoutes);
app.use(studentReviewRoutes);

// Placement image routes
app.post(
  "/placement-image",
  upload.array("image", 10),
  placementImagesController.uploadPlacementImages
);
app.post("/delete-image/:id", placementImagesController.deletePlacementImage);

// Update CMS content
app.post("/update-content", contentController.updateContent);

// ❌ Throw test error
app.get("/test-error", (req, res) => {
  throw new Error("Test error from /test-error");
});
app.get("/admin/test-error", (req, res) => {
  throw new Error("Admin test error!");
});

// ✅ 404 and Error Handlers
app.use(notFound);
app.use(errorHandler); // ✅ Error middleware

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
