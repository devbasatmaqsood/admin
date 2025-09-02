const User = require("../../models/user.model");
const Wallet = require("../../models/userWallet.model");
const ChatBoat = require("../../models/chatBoat.model");
const EmailVerify = require("../../models/emailVerify.model");

const { capitalizeFirstLetter } = require("../../middleware/capitalize");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");
const fs = require("fs");

const userFunction = async (user, data_) => {
  const data = data_.body;
  const file = data_.file;

  user.image = data.image ? data.image : !user.image && !file ? `${process?.env?.baseURL}storage/male.png` : file ? process?.env?.baseURL + file.path : user.image;

  user.uniqueId = user.uniqueId ? user.uniqueId : Math.floor(Math.random() * 1000000 + 999999);
  user.name = data.name ? capitalizeFirstLetter(data.name.trim()) : user?.name;

  user.email = data.email ? data.email.trim() : user?.email;
  user.password = data?.password ? cryptr.encrypt(data?.password) : user?.password;

  user.loginType = data?.loginType ? data?.loginType : user.loginType;
  user.age = data?.age ? data.age : user?.age;
  user.dob = data?.dob || user?.dob;
  user.country = data?.country || user?.country;
  user.mobile = data?.mobile || user?.mobile;
  user.gender = data?.gender ? data.gender : user?.gender;

  user.bio = data?.bio || user?.bio;
  user.fcmToken = data?.fcmToken || user?.fcmToken;
  user.webFcmToken = data?.webFcmToken || user?.webFcmToken;
  await user.save();

  //return user with decrypt password
  user.password = data.password ? await cryptr.decrypt(user.password) : user.password;

  return user;
};

//check the user is exists or not with loginType 1 (email-password)
exports.checkUser = async (req, res) => {
  try {
    if (!req.query.email || !req.query.loginType || !req.query.password) return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });

    const user = await User.findOne({
      email: req.query.email,
      loginType: 1,
      isDelete: false,
    });

    if (user) {
      if (cryptr.decrypt(user.password ? user.password.toString() : "") !== req.query.password) {
        return res.status(200).json({
          status: false,
          message: "Password doesn't match for this user.",
          isLogin: false,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "User login Successfully.",
          user,
          isLogin: true,
        });
      }
    } else {
      return res.status(200).json({
        status: true,
        message: "User must have sign up.",
        isLogin: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

exports.checkUserMobile = async (req, res) => {
  try {
    const lang = req.query.langCode || "en_US";
    if (!req.query.mobile) return res.status(200).json({ status: false, message: "Invalid Details!!" });

    const mobile = req.query.mobile.toString();

    const user = await User.findOne({
      mobile: mobile,
      loginType: 3,
      isDelete: false,
    });

    if (user) {
      return res.status(200).json({
        status: true,
        message: "User logged in successfully",
        user,
        isLogin: true,
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "You must have sign up",
        isLogin: false,
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

exports.loginSignup = async (req, res) => {
  try {
    if (!req.body.loginType) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    let userQuery;
    if (req.body.loginType == 3) {
      if (!req.body.mobile) {
        return res.status(200).json({ status: false, message: "Mobile must be required!" });
      }

      const userQuery = await User.findOne({
        mobile: req.body.mobile,
        isDelete: false,
      });

      if (userQuery) {
        if (userQuery.isBlock) {
          return res.status(200).json({ status: false, message: "You are blocked by admin." });
        }

        const user_ = await userFunction(userQuery, req);
        return res.status(200).json({
          status: true,
          message: "finally, user login Successfully!!",
          user: user_,
          signup: false,
        });
      } else {
        console.log("with mobile no signup ");

        const newUser = new User();

        const user = await userFunction(newUser, req);
        const chatBoat = new ChatBoat({ user: user._id });
        const wallet = new Wallet({
          user: user._id,
        });

        await Promise.all([user.save(), chatBoat.save()]);

        return res.status(200).json({
          status: true,
          message: "finally, user Signup Successfully!",
          user,
          wallet,
          signup: true,
        });
      }
    } else if (req.body.loginType == 2) {
      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "Email must be required!" });
      }

      if (req.body.email) {
        userQuery = await User.findOne({
          email: req.body.email,
          isDelete: false,
        });
      }
    } else if (req.body.loginType == 1) {
      if (!req.body.email || !req.body.password) {
        return res.status(200).json({
          status: false,
          message: "email and password both must be required.",
        });
      }

      // const user = await User.findOne({
      //   email: req.body.email,
      //   isDelete: false,
      // });

      const [user, isUserVerified] = await Promise.all([
        User.findOne({
          email: req.body.email,
          isDelete: false,
          loginType: 1,
        }),
        // EmailVerify.findOne({
        //   email: req.body.email,
        // }),
      ]);

      if (user) {
        // if (!isUserVerified) {
        //   return res.status(200).json({
        //     status: false,
        //     message: "User's email not verified",
        //   });
        // }
        if (!user.password) {
          return res.status(200).json({
            status: false,
            message: "User's password not found.",
          });
        }

        if (cryptr.decrypt(user.password) !== req.body.password) {
          return res.status(200).json({
            status: false,
            message: "Oops ! Password doesn't match.",
          });
        }
        userQuery = user;
      } else {
        // if (!isUserVerified) {
        //   return res.status(200).json({
        //     status: false,
        //     message: "User's email not verified",
        //   });
        // }
        userQuery = user;
      }
    } else if (req.body.loginType == 4) {
      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "Email must be required!" });
      }

      if (req.body.email) {
        userQuery = await User.findOne({
          email: req.body.email,
          isDelete: false,
        });
      }
    }

    const user = userQuery;

    if (user) {
      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by admin." });
      }

      const user_ = await userFunction(user, req);

      return res.status(200).json({
        status: true,
        message: "finally, user login Successfully.",
        user: user_,
        signup: false,
      });
    } else {
      console.log("---------signup----------");

      let emailExists;

      if (req.body.email) {
        emailExists = await User.findOne({
          email: req.body.email,
          isDelete: false,
        });
      }

      if (emailExists) {
        return res.status(200).json({ status: false, message: "Email already exists!" });
      }

      const newUser = new User();

      const user = await userFunction(newUser, req);

      const chatBoat = new ChatBoat({ user: user._id });
      const wallet = new Wallet({ user: user._id });

      await Promise.all([wallet.save(), chatBoat.save()]);

      return res.status(200).json({
        status: true,
        message: "User Signup Successfully!",
        user,
        wallet,
        signup: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).send({ status: false, message: "Invalid Details" });
    }
    const user = await User.findOne({
      _id: req?.query?.userId,
      isDelete: false,
    });
    if (!user) {
      return res.status(200).send({ status: false, message: "User Not Found" });
    }

    return res.status(200).send({
      status: true,
      message: "success!!",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return req.status(200).send({ status: false, message: "invalid details" });
    }
    const user = await User.findById(req.query.userId);
    if (!user || user?.isDelete === true) {
      return res.status(200).send({ status: false, message: "User Not found" });
    }
    user.name = req?.body?.name ? req?.body?.name : user.name;
    if (req.file) {
      var image_ = user?.image?.split("storage");
      if (image_[1] !== "/male.png" && image_[1] !== "/female.png") {
        if (fs.existsSync("storage" + image_[1])) {
          fs.unlinkSync("storage" + image_[1]);
        }
      }

      user.image = process?.env?.baseURL + req?.file?.path;
    }
    user.password = req.body.password ? cryptr.encrypt(req.body.password) : user.password;

    user.age = req?.body?.age ? req?.body?.age : user.age;
    user.mobile = req.body.mobile ? req.body.mobile : user.mobile;
    user.gender = req?.body?.gender ? req?.body?.gender : user.gender;
    user.bio = req?.body?.bio ? req?.body?.bio : user.bio;
    user.email = req?.body?.email || user.email;
    user.dob = req?.body?.dob || user?.dob;
    user.country = req?.body.country || user?.country;
    user.isUpdate = true;
    user.fcmToken = req?.body?.fcmToken || user?.fcmToken;
    user.webFcmToken = req?.body?.webFcmToken || user?.webFcmToken;
    user.gender = req?.body?.gender || user.gender;
    await user.save();

    return res.status(200).send({ status: true, message: "User Updated Successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!req.query.userId) {
      return req.status(200).send({ status: false, message: "invalid details" });
    }
    const user = await User.findById(req.query.userId);
    if (!user || user?.isDelete === true) {
      return res.status(200).send({ status: false, message: "User Not found" });
    }

    user.isDelete = true;
    await user.save();
    return res.status(200).send({ status: true, message: "User Deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ status: false, message: "Internal server error" });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!req.body || !req.body.newPassword || !req.body.confirmPassword) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    if (req.body.newPassword === req.body.confirmPassword) {
      user.password = cryptr.encrypt(req.body.newPassword);
      await user.save();

      user.password = await cryptr.decrypt(user.password);

      return res.status(200).json({
        status: true,
        message: "Password Changed Successfully!!",
        user,
      });
    } else {
      return res.status(200).json({ status: false, message: "Password does not matched!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
