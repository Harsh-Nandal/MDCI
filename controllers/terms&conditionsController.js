const Content = require("../models/Content");
const SiteConfig = require("../models/SiteConfig");

exports.getAdminTermsConditionsSection = async (req, res) => {
  try {
    const [
      siteConfig,
      termsConditionsMetaHeading,
      termsConditionsMetaDescription,
      termsConditionsMetaKeyword,
      termsConditionsSection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "termsConditionsMetaHeading" }),
      Content.findOne({ section: "termsConditionsMetaDescription" }),
      Content.findOne({ section: "termsConditionsMetaKeyword" }),
      Content.findOne({ section: "termsConditionsSection" }),
    ]);

    res.render("admin/admin-terms&conditions", {
      termsConditionsMetaHeading: termsConditionsMetaHeading?.html || "",
      termsConditionsMetaDescription:
        termsConditionsMetaDescription?.html || "",
      termsConditionsMetaKeyword: termsConditionsMetaKeyword?.html || "",
      termsConditionsSection: termsConditionsSection?.html || "",
      siteConfig,
    });
  } catch (err) {
    console.error("Error fetching admin terms & conditions section:", err);
    res.status(500).send("Server error");
  }
};

exports.getTermsConditionsSection = async (req, res) => {
  try {
    const [
      siteConfig,
      termsConditionsMetaHeading,
      termsConditionsMetaDescription,
      termsConditionsMetaKeyword,
      termsConditionsSection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "termsConditionsMetaHeading" }),
      Content.findOne({ section: "termsConditionsMetaDescription" }),
      Content.findOne({ section: "termsConditionsMetaKeyword" }),
      Content.findOne({ section: "termsConditionsSection" }),
    ]);

    res.render("terms&conditions", {
      termsConditionsMetaHeading: termsConditionsMetaHeading?.html || "",
      termsConditionsMetaDescription:
        termsConditionsMetaDescription?.html || "",
      termsConditionsMetaKeyword: termsConditionsMetaKeyword?.html || "",
      termsConditionsSection: termsConditionsSection?.html || "",
      siteConfig,
    });
  } catch (err) {
    console.error("Error fetching terms & conditions section:", err);
    res.status(500).send("Server error");
  }
};
