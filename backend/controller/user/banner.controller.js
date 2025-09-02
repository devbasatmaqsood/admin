const Banner = require("../../models/banner.model");


exports.getAll = async (req, res) => {
    try {
      const data = await Banner.find({isActive:true}).populate('service');
        return res
        .status(200)
        .send({ status: true, message: "Success", data });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
          status: false,
          error: error.message || "Internal Server Error",
        });
    }
}