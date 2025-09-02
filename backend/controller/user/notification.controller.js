const Notification = require('../../models/notification.model');
const User = require('../../models/user.model');

exports.getNotificationForUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        ?.status(200)
        .send({ status: false, message: 'Invalid details' });
    }
    const user = await User.findById(req.query.userId);
    if (!user) {
      return res
        .status(200)
        .send({ status: false, message: 'User does not exist' });
    }

    const notification = await Notification.find({ user: user._id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      status: true,
      message: 'Success',
      notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || 'Internal Server Error',
    });
  }
};
