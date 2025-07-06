const Enrollment = require("../models/Student");
const Student = require("../models/Student");
const University = require("../models/University");
const Course = require("../models/Course");
const BannerInquiry = require("../models/BannerInquiry");
const ContactInquiry = require("../models/ContactInquiry");
const EnrollmentInquiry = require("../models/Enrollment");

// ================= Admin Dashboard =================
const getAdminDashboard = async (req, res) => {
  try {
    const courses = await Course.find();

    const categoryMap = {
      "Govt Typing Exams": [],
      "Computer Basics": [],
      "Digital Marketing": [],
      "Design Courses": [],
      Development: [],
    };

    courses.forEach((course) => {
      const cat = course.category?.trim();
      if (categoryMap[cat]) {
        categoryMap[cat].push(course.name);
      }
    });

    const typingCount = await Enrollment.countDocuments({
      courseChoice: { $in: categoryMap["Govt Typing Exams"] },
    });

    const basicsCount = await Enrollment.countDocuments({
      courseChoice: { $in: categoryMap["Computer Basics"] },
    });

    const marketingCount = await Enrollment.countDocuments({
      courseChoice: { $in: categoryMap["Digital Marketing"] },
    });

    const developmentCount = await Enrollment.countDocuments({
      courseChoice: { $in: categoryMap["Development"] },
    });

    const designCount = await Enrollment.countDocuments({
      $or: [
        { courseChoice: { $in: categoryMap["Design Courses"] } },
        { courseChoice: { $regex: /ui[\s\/]?ux/i } },
        { courseChoice: { $regex: /graphic/i } },
      ],
    });

    const allKnownCourses = Object.values(categoryMap).flat();

    const otherCount = await Enrollment.countDocuments({
      $and: [
        { courseChoice: { $nin: allKnownCourses } },
        { courseChoice: { $not: /graphic|ui[\s\/]?ux/i } },
      ],
    });

    const totalEnrollments = await Enrollment.countDocuments();
    const totalUniversities = await University.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalCouncilList = await BannerInquiry.countDocuments();
    const totalGetInTouch = await ContactInquiry.countDocuments();
    const totalEnrollmentRequests = await EnrollmentInquiry.countDocuments();

    res.render("admin/dashboard", {
      currentPath: req.path,
      designCount,
      developmentCount,
      marketingCount,
      otherCount,
      totalUniversities,
      totalCourses,
      totalEnrollments,
      totalCouncilList,
      totalGetInTouch,
      totalEnrollmentRequests,
    });
  } catch (error) {
    console.error("Admin Dashboard render error:", error);
    res.status(500).send("Internal Server Error");
  }
};

// ================= Student Dashboard =================
const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.session.student.email }).populate("course");

    if (!student) return res.status(404).send("Student not found");
    console.log("Dashboard accessed, session:", req.session.student);

    res.render("studentdashboard", {
      student,
      currentPath: req.path,
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getAdminDashboard,
  getStudentDashboard,
};
