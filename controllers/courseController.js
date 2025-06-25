const Course = require("../models/Course");
const fs = require("fs");
const path = require("path");

// Show add-course page with all existing courses
exports.renderCourseForm = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.render("admin/admin-course", { courses });
  } catch (error) {
    console.error("Error loading course form:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Add a new course
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
    } = req.body;

    const topics = [];
    if (req.body.topics && Array.isArray(req.body.topics)) {
      req.body.topics.forEach(t => {
        topics.push({
          name: t.name,
          duration: t.duration
        });
      });
    } else if (req.body.topics && typeof req.body.topics === 'object') {
      for (let key in req.body.topics) {
        topics.push({
          name: req.body.topics[key].name,
          duration: req.body.topics[key].duration
        });
      }
    }

    const courseImage = req.files?.courseImage?.[0]?.path?.replace(/\\/g, "/");
    const pdf = req.files?.pdf?.[0]?.path?.replace(/\\/g, "/");

    const newCourse = new Course({
      name,
      rating,
      fees,
      courseImage: courseImage ? "/" + courseImage : undefined,
      pdf: pdf ? "/" + pdf : undefined,
      topicCoverContent,
      topics,
      metaTitle,
      metaDescription,
      metaKeywords,
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
    if (!course) return res.status(404).send("Course not found");
    res.render("admin/edit-course", { course });
  } catch (error) {
    console.error("Error loading course:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Update the course
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
    } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).send("Course not found");

    const topics = [];
    if (req.body.topics && typeof req.body.topics === 'object') {
      for (let key in req.body.topics) {
        topics.push({
          name: req.body.topics[key].name,
          duration: req.body.topics[key].duration
        });
      }
    }

    // Optional file replacements
    const courseImage = req.files?.courseImage?.[0]?.path?.replace(/\\/g, "/");
    const pdf = req.files?.pdf?.[0]?.path?.replace(/\\/g, "/");

    if (courseImage) course.courseImage = "/" + courseImage;
    if (pdf) course.pdf = "/" + pdf;

    course.name = name;
    course.rating = rating;
    course.fees = fees;
    course.topicCoverContent = topicCoverContent;
    course.metaTitle = metaTitle;
    course.metaDescription = metaDescription;
    course.metaKeywords = metaKeywords;
    course.topics = topics;

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
    await Course.findByIdAndDelete(req.params.id);
    res.redirect("/admin-course");
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).send("Internal Server Error");
  }
};
