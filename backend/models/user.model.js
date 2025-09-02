const mongoose = require("mongoose");
const { LOGIN_TYPE } = require("../types/constant");

const userSchema = new mongoose.Schema(
  {
    uniqueId: { type: Number, default: null },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    email: { type: String, default: "" },
    password: String,

    loginType: { type: Number, enum: LOGIN_TYPE }, //1.email-password 2.google 3.mobile No 4.apple

    age: { type: Number },
    mobile: { type: String, default: "" },
    gender: { type: String, default: "" },
    bio: { type: String, default: "" },
    dob: { type: String, default: "" },

    analyticDate: { type: String, default: "" },
    isBlock: { type: Boolean, default: false },
    fcmToken: { type: String, default: null },
    webFcmToken: { type: String, default: null },
    isDelete: { type: Boolean, default: false },
    isUpdate: { type: Boolean, default: false },

    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    country: { type: String, default: "" },

    subPatient: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubPatient",
      },
    ],
    doctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    ],

    isBusy: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },

    callId: { type: String, default: "" }, //for videoCall
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = new mongoose.model("User", userSchema);
