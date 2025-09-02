const Withdraw = require("../../models/withdraw.model");

//get Withdraw for doctor
exports.getWithdrawMethods = async (req, res) => {
  try {
    const withdraw = await Withdraw.find({ isEnabled: true }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ status: true, message: "Retrive Withdraw methods.", data: withdraw });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
