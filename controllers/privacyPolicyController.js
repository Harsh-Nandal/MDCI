const Content = require("../models/Content");
const SiteConfig = require("../models/SiteConfig");




exports.getAdminprivacyPolicySection = async (req, res) => {
  try {
    const [
      siteConfig,
      privacyPolicyMetaHeading,
      privacyPolicyMetaDescription,
      privacyPolicyMetaKeyword,
      privacyPolicySection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "privacyPolicyMetaHeading" }),
      Content.findOne({ section: "privacyPolicyMetaDescription" }),
      Content.findOne({ section: "privacyPolicyMetaKeyword" }),
      Content.findOne({ section: "privacyPolicySection" }),
    ]);

    res.render("admin/admin-privacyPolicy", {
      siteConfig,
      privacyPolicyMetaHeading: privacyPolicyMetaHeading?.html || "",
      privacyPolicyMetaDescription: privacyPolicyMetaDescription?.html || "",
      privacyPolicyMetaKeyword: privacyPolicyMetaKeyword?.html || "",
      privacyPolicySection: privacyPolicySection?.html || "",
    });
  } catch (err) {
    console.error("Error fetching privacy policy section:", err);
    res.status(500).send("Server error");
  }
};
exports.getprivacyPolicySection = async (req, res) => {
  try {
    const [
      siteConfig,
      privacyPolicyMetaHeading,
      privacyPolicyMetaDescription,
      privacyPolicyMetaKeyword,
      privacyPolicySection,
    ] = await Promise.all([
      SiteConfig.findOne(),
      Content.findOne({ section: "privacyPolicyMetaHeading" }),
      Content.findOne({ section: "privacyPolicyMetaDescription" }),
      Content.findOne({ section: "privacyPolicyMetaKeyword" }),
      Content.findOne({ section: "privacyPolicySection" }),
    ]);

    res.render("privacyPolicy", {
      siteConfig,
      privacyPolicyMetaHeading: privacyPolicyMetaHeading?.html || "",
      privacyPolicyMetaDescription: privacyPolicyMetaDescription?.html || "",
      privacyPolicyMetaKeyword: privacyPolicyMetaKeyword?.html || "",
      privacyPolicySection: privacyPolicySection?.html || "",
    });
  } catch (err) {
    console.error("Error fetching privacy policy section:", err);
    res.status(500).send("Server error");
  }
};

