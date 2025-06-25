const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  regNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  imagePath: { type: String },
  fatherName: { type: String },
  gender: { type: String },
  bloodGroup: { type: String },
  contactNo: { type: String },
  email: { type: String },
  aadharNo: { type: String },
  fatherOccupation: { type: String },
  motherName: { type: String },
  motherOccupation: { type: String },
  parentsNo: { type: String },
  qualification: { type: String },
  address: { type: String },
  maritalStatus: { type: String },
  studentOccupation: { type: String },
  dateOfAdmission: { type: Date },
  referenceBy: { type: String },
  password: { type: String }, // Ideally hashed

  // ✅ Course Field
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  fees: {
    receiptNo: {
      type: String,
      default: "",
    },
    totalFees: {
      type: Number,
      default: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalAmount: {
      type: Number,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    dues: {
      type: Number,
      default: 0,
    },
    lastPaidDate: {
      type: Date,
      default: null,
    },

    // ✅ Installments Array
    installments: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
        receiptNo: { type: String, required: true },
      },
    ],
  },
});

module.exports = mongoose.model("Student", studentSchema);
