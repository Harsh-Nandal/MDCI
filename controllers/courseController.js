const Course = require("../models/Course");
const fs = require("fs");
const path = require("path");

// Show add-course page with all existing courses
exports.renderCourseForm = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.render("admin/admin-course", { courses, currentPath: req.path, });
  } catch (error) {
    console.error("Error loading course form:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.addCourse = async (req, res) => {
  try {
    const {
      name,
      rating,
      fees,
      topicCoverContent,
      metaTitle,
      metaDescription,
      metaKeywords,
      category, 
    } = req.body;

    // Parse topics from simpler arrays
    const names = req.body.topicNames || [];
    const durations = req.body.topicDurations || [];

    const parsedTopics = names.map((name, index) => ({
      name,
      duration: durations[index] || "",
    }));

    // File paths
    const courseImageFile = req.files?.courseImage?.[0]?.filename;
    const pdfFile = req.files?.pdf?.[0]?.filename;

    const newCourse = new Course({
      name,
      rating,
      fees,
      topicCoverContent,
      topics: parsedTopics,
      courseImage: courseImageFile
        ? `/uploads/courses/${courseImageFile}`
        : undefined,
      pdf: pdfFile ? `/uploads/courses/${pdfFile}` : undefined,
      metaTitle,
      metaDescription,
      metaKeywords,
        category, // ✅ ADDED

    });

    await newCourse.save();
    res.redirect("/admin-course");
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Render the course edit form
exports.editCourseForm = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.redirect("/admin-course?error=notfound");
    res.render("admin/edit-course", { course, currentPath: req.path, });
  } catch (error) {
    console.error("Error loading course:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const {
      name,
      rating,
      fees,
      topicCoverContent,
      metaTitle,
      metaDescription,
      metaKeywords,
        category, // ✅ ADDED

    } = req.body;

    const names = req.body.topicNames || [];
    const durations = req.body.topicDurations || [];

    const parsedTopics = names.map((name, index) => ({
      name,
      duration: durations[index] || "",
    }));

    const course = await Course.findById(req.params.id);
    if (!course) return res.redirect("/admin-course?error=notfound");

    // Replace files if new ones are uploaded
    const courseImageFile = req.files?.courseImage?.[0]?.filename;
    const pdfFile = req.files?.pdf?.[0]?.filename;

    if (courseImageFile) {
      if (course.courseImage) {
        const oldImagePath = path.join(__dirname, "..", course.courseImage);
        fs.existsSync(oldImagePath) && fs.unlinkSync(oldImagePath);
      }
      course.courseImage = `/uploads/courses/${courseImageFile}`;
    }

    if (pdfFile) {
      if (course.pdf) {
        const oldPdfPath = path.join(__dirname, "..", course.pdf);
        fs.existsSync(oldPdfPath) && fs.unlinkSync(oldPdfPath);
      }
      course.pdf = `/uploads/courses/${pdfFile}`;
    }

    // Update fields
    course.name = name;
    course.rating = rating;
    course.fees = fees;
    course.topicCoverContent = topicCoverContent;
    course.metaTitle = metaTitle;
    course.metaDescription = metaDescription;
    course.metaKeywords = metaKeywords;
    course.topics = parsedTopics; 
    course.category =   category; // ✅ ADDED
// Replace all topics with the new array

    await course.save();
    res.redirect("/admin-course");
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      // Delete course image and PDF
      if (course.courseImage) {
        const imagePath = path.join(__dirname, "..", course.courseImage);
        fs.existsSync(imagePath) && fs.unlinkSync(imagePath);
      }
      if (course.pdf) {
        const pdfPath = path.join(__dirname, "..", course.pdf);
        fs.existsSync(pdfPath) && fs.unlinkSync(pdfPath);
      }

      await Course.findByIdAndDelete(req.params.id);
    }

    res.redirect("/admin-course");
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).send("Internal Server Error");
  }
};
exports.deleteTopic = async (req, res) => {
  try {
    const { courseId, topicIndex } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).send("Course not found");
    }

    // Remove topic at given index
    course.topics.splice(topicIndex, 1);

    await course.save();
    res.redirect(`/edit-course/${courseId}`);
  } catch (error) {
    console.error("Error deleting topic:", error);
    res.status(500).send("Internal Server Error");
  }
};


exports.getCourses = async (req, res) => {
  try {
    const allCourses = await Course.find();

    const groupedCourses = {};

    allCourses.forEach(course => {
      const category = course.category || "Others";
      if (!groupedCourses[category]) {
        groupedCourses[category] = [];
      }
      groupedCourses[category].push(course);
    });

    res.render("ourCourses", { groupedCourses, currentPath: req.path, }); // your EJS view
  } catch (err) {
    console.error("Error loading courses:", err);
    res.status(500).send("Server Error");
  }
};

