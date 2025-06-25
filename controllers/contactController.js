const ContactSection = require("../models/ContactSection");
const fs = require("fs");
const Content = require("../models/Content");
const SiteConfig = require("../models/SiteConfig");

exports.getAdminContactSection = async (req, res) => {
  try {
    const [
      siteConfig,
      contactMetaHeading,
      contactMetaDescription,
      contactMetaKeyword,
      topContactSection,
      homepage
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
      siteConfig, // Optional: in case you want to use it in the view
      contactSections
    });
  } catch (err) {
    console.error("Error fetching contact section:", err);
    res.status(500).send("Server error");
  }
};
exports.getContactSection = async (req, res) => {
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
      siteConfig, // Optional: in case you want to use it in the view
      contactSections
    });
  } catch (err) {
    console.error("Error fetching contact section:", err);
    res.status(500).send("Server error");
  }
};

exports.postContactSection = async (req, res) => {
  
   const { id = [], name = [], heading = [], content = [] } = req.body;
  const files = req.files || [];

  try {
    for (let i = 0; i < id.length; i++) {
      const imagePath = files[i] ? `/uploads/contact/${files[i].filename}` : undefined;

      if (id[i]) {
        const updateData = {
          heading: heading[i],
          content: content[i],
        };
        if (imagePath) {
          updateData.imagePath = imagePath;
        }

        await ContactSection.findByIdAndUpdate(id[i], updateData);
      }
    }

    res.redirect('/admin-contact');
  } catch (err) {
    console.error('Error updating contact sections:', err);
    res.status(500).send('Internal Server Error');
  }
};
