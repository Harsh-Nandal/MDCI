const express = require("express");
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: "uploads/courses/" }); // customize as needed
const courseController = require("../controllers/courseController");

router.get("/admin-course", courseController.renderCourseForm);
router.post(
  "/add-course",
  upload.fields([
    { name: "courseImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  courseController.addCourse
);
router.get("/edit-course/:id", courseController.editCourseForm);
router.post(
  "/edit-course/:id",
  upload.fields([
    { name: "courseImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  courseController.updateCourse
);

router.post("/delete-course/:id", courseController.deleteCourse);


module.exports = router;
