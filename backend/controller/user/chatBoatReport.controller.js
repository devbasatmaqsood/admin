const ChatBoatReport = require("../../models/chatBoatReport.model");

// Submit a report
exports.submitReport = async (req, res) => {
  try {
    const { user, text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ success: false, message: "Report text is required." });
    }

    const report = await ChatBoatReport.create({
      user: user || null,
      text: text.trim(),
    });

    res.status(200).json({
      success: true,
      message: "Report submitted successfully.",
      data: report,
    });
  } catch (err) {
    console.error("Error submitting report:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
