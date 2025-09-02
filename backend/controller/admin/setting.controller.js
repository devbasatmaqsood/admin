const Setting = require("../../models/setting.model");
const Category = require("../../models/service.model");
const ContentPage = require("../../models/contentPage.model");

const mongoose = require("mongoose");
const fs = require("fs");

exports.get = async (req, res) => {
  try {
    const setting = settingJSON ? settingJSON : null;
    if (!setting) {
      return res.status(200).send({ status: false, message: "Setting Not Exist" });
    }

    return res.status(200).send({
      status: true,
      message: "success!!",
      setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      return res.status(200).send({ status: false, message: "Setting Not Exist" });
    }

    setting.tnc = req.body.tnc || setting.tnc;
    setting.privacyPolicyLink = req.body.privacyPolicyLink || setting.privacyPolicyLink;
    setting.razorPayId = req.body.razorPayId || setting.razorPayId;
    setting.razorSecretKey = req.body.razorSecretKey || setting.razorSecretKey;
    setting.stripePublishableKey = req.body.stripePublishableKey || setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey || setting.stripeSecretKey;

    setting.zegoAppId = req.body.zegoAppId || setting.zegoAppId;
    setting.zegoAppSignIn = req.body.zegoAppSignIn || setting.zegoAppSignIn;
    setting.zegoServerSecret = req.body.zegoServerSecret || setting.zegoServerSecret;

    setting.flutterWaveKey = req.body.flutterWaveKey || setting.flutterWaveKey;
    setting.currencySymbol = req.body.currencySymbol || setting.currencySymbol;
    setting.currencyName = req.body.currencyName || setting.currencyName;

    if (req.body.tax !== undefined && req.body.tax !== null) {
      setting.tax = req.body.tax;
    }

    setting.minWithdraw = req.body.minWithdraw || setting.minWithdraw;
    setting.commissionPercent = req.body.commissionPercent || setting.commissionPercent;
    setting.durationOfvideo = req.body.durationOfvideo ? Number(req.body.durationOfvideo) : setting.durationOfvideo;

    try {
      if (typeof req.body.firebaseKey === "string") {
        setting.firebaseKey = JSON.parse(req.body.firebaseKey.trim());
      } else if (req.body.firebaseKey) {
        setting.firebaseKey = req.body.firebaseKey;
      }
    } catch (_) {}

    setting.companyEmail = req?.body?.companyEmail?.trim() || setting?.companyEmail;
    setting.companyContact = req?.body?.companyContact?.trim() || setting?.companyContact;
    setting.companyName = req?.body?.companyName?.trim() || setting?.companyName;
    setting.businessAddress = req?.body?.businessAddress?.trim() || setting?.businessAddress;
    setting.businessOverview = req?.body?.businessOverview?.trim() || setting?.businessOverview;

    if (Array.isArray(req.body.categories) && req.body.categories.length > 0) {
      const isValidIds = req.body.categories.every((id) => mongoose.Types.ObjectId.isValid(id));
      if (!isValidIds) {
        return res.status(200).json({ status: false, message: "Invalid Category IDs" });
      }

      const foundCategories = await Category.find({ _id: { $in: req.body.categories } }).select("_id");

      if (foundCategories.length !== req.body.categories.length) {
        return res.status(200).json({
          status: false,
          message: "Some categories do not exist in database",
        });
      }

      setting.categories = req.body.categories;
    }

    if (req.body.customPages !== undefined) {
      if (!Array.isArray(req.body.customPages)) {
        return res.status(200).json({
          status: false,
          message: "customPages must be an array of ObjectId strings",
        });
      }

      if (req.body.customPages.length === 0) {
        setting.customPages = [];
      } else {
        const pageIdsRaw = req.body.customPages.map(String).filter(Boolean);
        const pageIdsUnique = [...new Set(pageIdsRaw)];

        const allValid = pageIdsUnique.every((id) => mongoose.Types.ObjectId.isValid(id));
        if (!allValid) {
          return res.status(200).json({
            status: false,
            message: "Invalid ContentPage IDs",
          });
        }

        const foundPages = await ContentPage.find({ _id: { $in: pageIdsUnique } }).select("_id");

        if (foundPages.length !== pageIdsUnique.length) {
          return res.status(200).json({
            status: false,
            message: "Some content pages do not exist in database",
          });
        }

        setting.customPages = pageIdsUnique.map((id) => new mongoose.Types.ObjectId(id));
      }
    }

    setting.resendApiKey = req.body.resendApiKey || setting.resendApiKey;
    setting.openAIkey = req.body.openAIkey || setting.openAIkey;

    await setting.save();

    console.log("setting.categories : ", setting.categories);

    res.status(200).send({ status: true, message: "Success!!", setting });

    updateSettingFile(setting);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.handleSwitch = async (req, res) => {
  try {
    const type = req.query.type;
    if (!type) {
      return res.status(200).send({ status: false, message: "Oops ! Invalid details!!" });
    }

    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (!setting) {
      return res.status(200).send({ status: false, message: "Setting Not Exist" });
    }

    if (type == 1) {
      setting.isRazorPay = !setting.isRazorPay;
    }
    if (type == 2) {
      setting.isStripePay = !setting.isStripePay;
    }
    if (type == 3) {
      setting.maintenanceMode = !setting.maintenanceMode;
    }
    if (type == 4) {
      setting.isFlutterWave = !setting.isFlutterWave;
    }
    if (type == 5) {
      setting.cashAfterService = !setting.cashAfterService;
    }
    await setting.save();

    updateSettingFile(setting);

    return res.status(200).send({ status: true, message: "success!!", setting });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.updateCompanyLogo = async (req, res) => {
  try {
    if (!req.body.settingId) {
      return res.status(200).json({ status: false, message: "Invalid details!" });
    }

    const setting = await Setting.findById(req.body.settingId);
    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting does not found." });
    }

    if (setting?.companyLogo) {
      const companyLogo = setting?.companyLogo?.split("storage");
      if (companyLogo) {
        if (fs.existsSync("storage" + companyLogo[1])) {
          fs.unlinkSync("storage" + companyLogo[1]);
        }
      }
    }

    setting.companyLogo = req.file ? req.file.path : setting?.companyLogo;

    await setting.save();

    updateSettingFile(setting);

    return res.status(200).json({
      status: true,
      message: "Company logo has been updated by admin.",
      setting: setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.retrieveFooterSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne()
      .populate({ path: "customPages", select: "_id name title description" })
      .populate({ path: "categories", select: "_id name" })
      .select("_id customPages categories companyName companyLogo businessAddress businessOverview companyEmail companyContact")
      .sort({ createdAt: -1 })
      .lean();

    if (!setting) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Setting details fetched successfully.",
      data: setting,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
