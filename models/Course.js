const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  fees: { type: Number, required: true },
  courseImage: { type: String }, // e.g., /uploads/courses/image.jpg
  pdf: { type: String },         // e.g., /uploads/courses/brochure.pdf

  topicCoverContent: { type: String }, // detailed content (HTML or plain text)

  topics: [topicSchema], // Array of topics with name + duration

  // SEO fields
  metaTitle: { type: String },
  metaDescription: { type: String },
  metaKeywords: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);
