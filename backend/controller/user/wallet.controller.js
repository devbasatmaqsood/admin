const Wallet = require('../../models/userWallet.model');
const User = require('../../models/user.model');
const Coupon = require('../../models/coupon.model');
const WalletHistory = require('../../models/userWalletHistory.model');
const moment = require('moment');
const path = require('path');
const { userInfo } = require('os');

exports.get = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res
        .status(200)
        .send({ status: false, message: 'userId is required' });
    }
    const user = await User.findOne({
      _id: req?.query?.userId,
      isDelete: false,
    });
    if (!user) {
      return res.status(200).send({ status: false, message: 'User Not Found' });
    }

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return res
        .status(200)
        .send({ status: false, message: 'User wallet data not found' });
    }
    return res.status(200).send({
      status: true,
      message: 'Wallet fetch successfully',
      data: wallet,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error',
    });
  }
};

exports.loadWallet = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.amount || !req.query.paymentGateway) {
      return res
        .status(200)
        .send({ status: false, message: 'Invalid Details' });
    }

    const user = await User.findOne({
      _id: req?.query?.userId,
      isDelete: false,
    });
    if (!user) {
      return res.status(200).send({ status: false, message: 'User Not Found' });
    }
    let coupon;
    let bonusAmount = 0;
    if (req.query.couponId) {
      coupon = await Coupon.findOne({
        code: req.query.couponId,
        isActive: true,
      });
      if (!coupon || coupon.type == 2) {
        return res.status(200).send({
          status: false,
          message:
            'Coupon not found or invalid,retry with valid coupon or remove coupon',
        });
      }
      if (coupon.discountType == 1) {
        bonusAmount = coupon.maxDiscount;
      } else if (coupon.discountType == 2) {
        let amount =
          (parseInt(req.query.amount) * coupon.discountPercent) / 100;
        bonusAmount = amount > coupon.maxDiscount ? coupon.maxDiscount : amount;
      }
    }

    const wallet = await Wallet.findOne({ user: req.query.userId });
    if (!wallet) {
      return res
        .status(200)
        .send({ status: false, message: 'User wallet data not found' });
    }
    let finalAmount = 0;
    finalAmount = parseInt(req.query.amount) + bonusAmount;
    updatedAmount =
      parseFloat(wallet.amount.toFixed(2)) + parseFloat(finalAmount.toFixed(2));

    wallet.amount = updatedAmount;

    await wallet.save();

    const history = await new WalletHistory({
      user: user._id,
      wallet: wallet._id,
      amount: parseInt(req.query.amount),
      type: 1,
      paymentGateway: req.query.paymentGateway,
      couponId: coupon && coupon.code,
      couponAmount: coupon && bonusAmount,
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:MM a'),
      uniqueId: await generateId(),
    });

    console.log('history', history);
    await history.save();
    return res.status(200).send({
      status: true,
      message: 'Wallet load successfully',
      data: wallet,
      history,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error',
    });
  }
};

exports.getWalletHistory = async (req, res) => {
  // try {
  //   const userId = req.query.userId;
  //   if (!userId) {
  //     return res
  //       .status(200)
  //       .send({ status: false, message: "Oops ! Invalid details!!" });
  //   }
  //   const user = await User.findById(userId);
  //   if (!user) {
  //     return res.status(200).send({ status: false, message: "User not found" });
  //   }

  //   const currentMonth = moment().format("YYYY-MM");
  //   const month = req.query.month || currentMonth;

  //   let dateFilter = {
  //     month: {
  //       $eq: month,
  //     },
  //   };

  //   const [wallet, history] = await Promise.all([
  //     Wallet.findOne({ user: user._id }),
  //     WalletHistory.aggregate([
  //       {
  //         $addFields: {
  //           month: { $substr: ["$date", 0, 7] },
  //         },
  //       },
  //       {
  //         $sort: { createdAt: -1 },
  //       },
  //       {
  //         $match: { user: user._id, ...dateFilter },
  //       },
  //       {
  //         $lookup: {
  //           from: 'appointments',
  //           localField: 'appointment',
  //           foreignField: '_id',
  //           as: 'appointment'
  //         }
  //       },
  //       {
  //           $unwind:{
  //             path:'$appointment',
  //             preserveNullAndEmptyArrays: true
  //           }
  //       },
  //       {
  //         $lookup: {
  //           from: 'users',
  //           localField: 'user',
  //           foreignField: '_id',
  //           as: 'user'
  //         }
  //       },
  //       {
  //         $unwind:{
  //           path:'$user',
  //           preserveNullAndEmptyArrays: true
  //         }
  //       }

  //     ]),
  //   ]);
  //   if (!wallet) {
  //     return res
  //       .status(200)
  //       .send({ status: false, message: "User wallet details not found" });
  //   }
  //   return res.status(200).send({
  //     status: true,
  //     message: "Success",
  //     data: wallet,
  //     history,
  //   });
  // }

  try {
    if (!req.query.userId || !req.query.month) {
      return res
        .status(200)
        .send({ status: false, message: 'UserId and month is required' });
    }

    let dateFilter = {
      month: {
        $eq: req.query.month,
      },
    };

    const user = await User.findOne({
      _id: req.query.userId,
      isDelete: false,
    }).sort({ date: 1 });

    if (!user) {
      return res.status(200).send({ status: false, message: 'User not found' });
    }

    if (user.isBlock) {
      return res.status(200).send({
        status: false,
        message: 'Your are blocked by admin,contact admin for further details',
      });
    }

    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    const data = await WalletHistory.aggregate([
      {
        $addFields: {
          month: { $substr: ['$date', 0, 7] },
        },
      },
      {
        $match: {
          user: user._id,
          ...dateFilter,
        },
      },

      {
        $lookup: {
          from: 'appointments',
          localField: 'appointment',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                appointmentId: 1,
                date: 1,
                time: 1,
                user: 1,
              },
            },
          ],
          as: 'appointment',
        },
      },
      {
        $unwind: {
          path: '$appointment',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ]);
    const total = await WalletHistory.countDocuments({ user: user._id });
    return res
      .status(200)
      .send({ status: true, message: 'Success', total, data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error!!',
    });
  }
};
exports.getUserWalletHistory = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.month) {
      return res
        .status(200)
        .send({ status: false, message: 'UserId and month is required' });
    }

    let dateFilter = {
      month: {
        $eq: req.query.month,
      },
    };

    const start = parseInt(req?.query?.start) || 0;
    const limit = parseInt(req?.query?.limit) || 10;
    const skipAmount = start * limit;

    const user = await User.findOne({
      _id: req.query.userId,
      isDelete: false,
    }).sort({ date: 1 });

    if (!user) {
      return res.status(200).send({ status: false, message: 'User not found' });
    }

    if (user.isBlock) {
      return res.status(200).send({
        status: false,
        message: 'Your are blocked by admin,contact admin for further details',
      });
    }

    const data = await WalletHistory.aggregate([
      {
        $addFields: {
          month: { $substr: ['$date', 0, 7] },
        },
      },
      {
        $match: {
          user: user._id,
          ...dateFilter,
        },
      },

      {
        $lookup: {
          from: 'appointments',
          localField: 'appointment',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                appointmentId: 1,
                date: 1,
                time: 1,
                user: 1,
              },
            },
          ],
          as: 'appointment',
        },
      },
      {
        $unwind: {
          path: '$appointment',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'appointment.user',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                image: 1,
              },
            },
          ],
          as: 'appointment.user',
        },
      },
      {
        $unwind: {
          path: '$appointment.user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skipAmount,
      },
      {
        $limit: limit,
      },
    ]);
    const total = await WalletHistory.countDocuments({ user: user._id });
    return res
      .status(200)
      .send({ status: true, message: 'Success', total, data, user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || 'Internal Server Error!!',
    });
  }
};

async function generateId() {
  let newId;

  do {
    newId = Math.floor(Math.random() * 1000000 + 999999);
  } while (await WalletHistory.exists({ uniqueId: newId }));

  return newId;
}
