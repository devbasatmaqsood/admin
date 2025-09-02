const Suggestion = require("../../models/suggestedService.model");

exports.create = async (req, res) => {
  try {
    const { name, description, doctor } = req.body;
    if (!name || !description || !doctor) {
      return res.status(200).send({ status: false, message: "Invalid details" });
    }

    const service = new Suggestion({ name, description, doctor });
    await service.save();
    
    res.status(200).send({
      status: true,
      message: "Suggest category submit successfully",
      data: service,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};
