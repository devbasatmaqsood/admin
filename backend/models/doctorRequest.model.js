const mongoose = require("mongoose");
const { DOCTOR_TYPE } = require("../types/constant");
const { DOCTOR_REQUEST_STATUS } = require("../types/constant");

const doctorRequestSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    email: { type: String, default: "" },
    password: String,
    age: { type: Number },
    mobile: { type: String, default: "" },
    gender: { type: String, default: "" },
    dob: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    country: { type: String, default: "" },

    service: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],

    designation: { type: String, default: "" },
    degree: [{ type: String, default: "" }],
    language: [{ type: String, default: "" }],
    experience: { type: Number, default: 0 },
    charge: { type: Number, default: 0 },

    type: { type: Number, default: 2, enum: DOCTOR_TYPE }, //offline online both

    clinicName: { type: String },
    address: { type: String },

    awards: [{ type: String, default: "" }],
    expertise: [{ type: String, default: "" }],
    yourSelf: { type: String, default: "" },
    education: { type: String, default: "" },
    experienceDetails: [{ type: String, default: "" }],

    requestId: { type: String, default: "", unique: true },
    status: { type: Number, default: 1, enum: DOCTOR_REQUEST_STATUS },

    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("DoctorRequest", doctorRequestSchema);
