// controllers/universityController.js
const University = require("../models/University");

// ---------- Main University ----------
exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find();
    res.render("admin/admin-university", { universities });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.postAddUniversity = async (req, res) => {
  try {
    await University.create(req.body);
    res.redirect("/admin/universities");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getEditUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityEdit", { university });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.postEditUniversity = async (req, res) => {
  try {
    await University.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin/universities");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    await University.findByIdAndDelete(req.params.id);
    res.redirect("/admin/universities");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ---------- Gallery ----------
exports.getGalleryPage = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityGallery", { university });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.uploadGalleryImages = async (req, res) => {
  const files = req.files;
  const filePaths = files.map(
    (file) => "/uploads/universities/" + file.filename
  );
  await University.findByIdAndUpdate(req.params.id, {
    $push: { gallery: { $each: filePaths } },
  });
  res.redirect(`/admin/university/${req.params.id}/gallery`);
};

exports.deleteGalleryImage = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    const index = req.params.index;
    if (index >= 0 && index < university.gallery.length) {
      university.gallery.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/gallery`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ---------- Placement Partners ----------
exports.getPartnerPage = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityPlacement", { university });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.uploadPartnerImages = async (req, res) => {
  const files = req.files;
  const filePaths = files.map(
    (file) => "/uploads/universities/" + file.filename
  );
  await University.findByIdAndUpdate(req.params.id, {
    $push: { placementPartnerImages: { $each: filePaths } },
  });
  res.redirect(`/admin/university/${req.params.id}/partners`);
};

exports.deletePartnerImage = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    const index = req.params.index;
    if (index >= 0 && index < university.placementPartnerImages.length) {
      university.placementPartnerImages.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/partners`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ---------- Reviews ----------
exports.getReviewPage = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityReviews", { university });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// controllers/universityController.js
exports.addReview = async (req, res) => {
  const universityId = req.params.id;
  const { reviewText, name, rating, review } = req.body;
  const imagePath = req.file
    ? "/uploads/universities/" + req.file.filename
    : "";

  try {
    await University.findByIdAndUpdate(universityId, {
      $push: {
        reviews: {
          reviewText,
          review: {
            name,
            rating: parseInt(rating),
            review,
            image: imagePath,
          },
        },
      },
    });

    res.redirect(`/admin/university/${universityId}/reviews`);
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    const index = req.params.index;
    if (index >= 0 && index < university.reviews.length) {
      university.reviews.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/reviews`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ---------- Courses ----------
exports.getCoursePage = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityCourses", { university });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.addCourse = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded.");
    const filePath = "/uploads/universities/" + req.file.filename;
    const newCourse = {
      offeredCourseText: req.body.offeredCourseText,
      viewLink: req.body.viewLink,
      course: {
        name: req.body.courseName,
        image: filePath,
        duration: req.body.duration,
      },
    };
    await University.findByIdAndUpdate(req.params.id, {
      $push: { courses: newCourse },
    });
    res.redirect(`/admin/university/${req.params.id}/courses`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    const index = req.params.index;
    if (index >= 0 && index < university.courses.length) {
      university.courses.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/courses`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
// GET: Show edit course page
exports.getEditCoursePage = async (req, res) => {
  const { id, index } = req.params;
  const university = await University.findById(id);

  if (!university || !university.courses[index]) {
    return res.status(404).send("Course not found");
  }

  const course = university.courses[index];
  res.render("admin/admin-universityEditCourse", {
    university,
    index,
    course,
  });
};

// POST: Handle edit course form
exports.postEditCourse = async (req, res) => {
  const { id, index } = req.params;
  const university = await University.findById(id);
  if (!university || !university.courses[index]) {
    return res.status(404).send("Course not found");
  }

  const { offeredCourseText, viewLink, courseName, duration } = req.body;
  const course = university.courses[index];

  course.offeredCourseText = offeredCourseText;
  course.viewLink = viewLink;
  course.course.name = courseName;
  course.course.duration = duration;

  // If a new image is uploaded, replace the old one
  if (req.file) {
    // Optionally delete old image from disk
    try {
      if (fs.existsSync(course.course.image)) {
        fs.unlinkSync(course.course.image);
      }
    } catch (err) {
      console.error("Image delete error:", err);
    }

    course.course.image = "/uploads/universities/" + req.file.filename;
  }

  await university.save();
  res.redirect(`/admin/university/${id}/courses`);
};
