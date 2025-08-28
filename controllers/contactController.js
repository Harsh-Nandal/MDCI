// ===========================
// contactController.js (Final Fixed)
// ===========================

const ContactSection = require("../models/ContactSection");
const fs = require("fs");
const path = require("path");
const Content = require("../models/Content");
const SiteConfig = require("../models/SiteConfig");

exports.getContactSection = async (req, res) => {
  try {
    const [
      siteConfig,
      contactMetaHeading,
      contactMetaDescription,
      contactMetaKeyword,
      topContactSection,
      homepage,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "contactMetaHeading" }),
      Content.findOne({ section: "contactMetaDescription" }),
      Content.findOne({ section: "contactMetaKeyword" }),
      Content.findOne({ section: "topContactSection" }),
      Content.findOne({ section: "homepage" }),
    ]);

    const contactSections = await ContactSection.find();

    res.render("contact", {
      homepage: homepage?.html || "",
      contactMetaHeading: contactMetaHeading?.html || "",
      contactMetaDescription: contactMetaDescription?.html || "",
      contactMetaKeyword: contactMetaKeyword?.html || "",
      topContactSection: topContactSection?.html || "",
      siteConfig,
      contactSections,
      currentPath: req.path,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAdminContactSection = async (req, res) => {
  try {
    const [
      siteConfig,
      contactMetaHeading,
      contactMetaDescription,
      contactMetaKeyword,
      topContactSection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "contactMetaHeading" }),
      Content.findOne({ section: "contactMetaDescription" }),
      Content.findOne({ section: "contactMetaKeyword" }),
      Content.findOne({ section: "topContactSection" }),
    ]);

    const contactSections = await ContactSection.find();

    res.render("admin/admin-contact", {
      contactMetaHeading: contactMetaHeading?.html || "",
      contactMetaDescription: contactMetaDescription?.html || "",
      contactMetaKeyword: contactMetaKeyword?.html || "",
      topContactSection: topContactSection?.html || "",
      siteConfig,
      contactSections,
      currentPath: req.path,
    });
  } catch (err) {
    next(err)
  }
};



exports.postContactSection = async (req, res) => {
  const { id = [], name = [], heading = [], content = [] } = req.body;

  try {
    for (let i = 0; i < 3; i++) {
      // ✅ Only check required fields: heading and content
      if (!heading[i] || !content[i]) continue;

      const imageFile = req.files[`image${i}`]?.[0]; // May be undefined
      const imagePath = imageFile
        ? `/uploads/contact/${imageFile.filename}`
        : undefined;

      const updateData = {
        name: name[i] || `Section ${i + 1}`, // fallback if name is missing
        heading: heading[i],
        content: content[i],
      };

      if (imagePath) {
        updateData.imagePath = imagePath;
      }

      if (id[i]) {
        const oldDoc = await ContactSection.findById(id[i]);
        if (oldDoc?.imagePath && imagePath && oldDoc.imagePath !== imagePath) {
          const fullPath = path.join(__dirname, "..", oldDoc.imagePath);
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
        await ContactSection.findByIdAndUpdate(id[i], updateData);
      } else {
        await new ContactSection(updateData).save();
      }
    }

    res.redirect("/admin-contact");
  } catch (err) {
    next(err)
  }
};
