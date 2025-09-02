const ChatBoat = require("../../models/chatBoat.model");
const User = require("../../models/user.model");

//create data in chatBoat
exports.createChatBoat = async (req, res) => {
  try {
    const { userId, message, time, isSendByUser } = req.body;

    if (!userId || !message || !time) {
      return res.status(400).json({ status: false, message: "Oops! Invalid details." });
    }

    const [chatBoat, user] = await Promise.all([ChatBoat.findOne({ user: userId }), User.findById(userId)]);

    if (!user) {
      return res.status(200).json({
        status: false,
        message: "User not found.",
      });
    }

    const messageObject = { text: message, time, isSendByUser };

    if (chatBoat) {
      chatBoat.message.push(messageObject);
      await chatBoat.save();

      return res.status(200).json({
        status: true,
        message: "Message added to ChatBoat.",
        data: chatBoat,
      });
    } else {
      const newChatBoat = new ChatBoat();
      newChatBoat.user = userId;
      newChatBoat.message = [messageObject];
      await newChatBoat.save();

      return res.status(200).json({
        status: true,
        message: "ChatBoat created with the first message.",
        data: newChatBoat,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get old data of chatBoat
exports.getChatBoat = async (req, res) => {
  try {
    const { chatBoatId } = req.query;

    if (!chatBoatId) {
      return res.status(400).json({ status: false, message: "Oops ! Invalid details." });
    }

    const chatBoat = await ChatBoat.findOne({ _id: chatBoatId });

    if (!chatBoat) {
      return res.status(200).json({
        status: false,
        message: "ChatBoat not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      data: chatBoat,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
