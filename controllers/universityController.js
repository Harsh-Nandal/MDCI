const fs = require("fs");
const University = require("../models/University");

// ---------- Main University ----------
exports.getUniversities = async (req, res) => {
  try {
    const universities = await University.find();
    res.render("admin/admin-university", { universities,currentPath: req.path, });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.postAddUniversity = async (req, res) => {
  try {
    const image = req.file ? "/uploads/universities/" + req.file.filename : "";
    await University.create({ ...req.body, image });
    res.redirect("/admin/universities");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getEditUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    res.render("admin/admin-universityEdit", { university,currentPath: req.path, });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.postEditUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);

    // Update image if a new one was uploaded
    if (req.file) {
      if (university.image && fs.existsSync("." + university.image)) {
        fs.unlinkSync("." + university.image);
      }
      req.body.image = "/uploads/universities/" + req.file.filename;
    } else {
      req.body.image = university.image;
    }

    await University.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/admin/universities");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.deleteUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (university.image && fs.existsSync("." + university.image)) {
      fs.unlinkSync("." + university.image);
    }
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
    res.render("admin/admin-universityGallery", { university ,currentPath: req.path,});
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
      const imagePath = university.gallery[index];
      if (fs.existsSync("." + imagePath)) {
        fs.unlinkSync("." + imagePath);
      }
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
    res.render("admin/admin-universityPlacement", { university,currentPath: req.path, });
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
      const imagePath = university.placementPartnerImages[index];
      if (fs.existsSync("." + imagePath)) {
        fs.unlinkSync("." + imagePath);
      }
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
    res.render("admin/admin-universityReviews", { university,currentPath: req.path, });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

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
      const imagePath = university.reviews[index].review.image;
      if (imagePath && fs.existsSync("." + imagePath)) {
        fs.unlinkSync("." + imagePath);
      }
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
    res.render("admin/admin-universityCourses", { university,currentPath: req.path, });
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
      const imagePath = university.courses[index].course.image;
      if (imagePath && fs.existsSync("." + imagePath)) {
        fs.unlinkSync("." + imagePath);
      }
      university.courses.splice(index, 1);
      await university.save();
    }
    res.redirect(`/admin/university/${req.params.id}/courses`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

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
    currentPath: req.path,
  });
};

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

  if (req.file) {
    try {
      if (course.course.image && fs.existsSync("." + course.course.image)) {
        fs.unlinkSync("." + course.course.image);
      }
    } catch (err) {
      console.error("Image delete error:", err);
    }

    course.course.image = "/uploads/universities/" + req.file.filename;
  }

  await university.save();
  res.redirect(`/admin/university/${id}/courses`);
};