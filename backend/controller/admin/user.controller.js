const User = require("../../models/user.model");

exports.getAllUsers = async (req, res) => {
    try {
      const start = parseInt(req.query.start) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = start * limit;
      let matchQuery = {};
  
      const searchString = req.query.search || "";
    
  
      if (req.query.search !== "ALL" && req.query.search !== "") {
        const searchRegex = new RegExp(searchString, "i");
        matchQuery = {
          $or: [
            { name: { $regex: searchString, $options: "i" } },
            { email: { $regex: searchString, $options: "i" } },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$mobile" },
                  regex: searchRegex,
                },
              },
            },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$uniqueId" },
                  regex: searchRegex,
                },
              },
            },
          ],
        };
      }
  
      const users = await User.aggregate([
        {
          $match: { isDelete: false ,...matchQuery}
        },
        {
          $sort: { createdAt: -1 },
        },
        { $skip: skip},
        { $limit: limit }
      ]);

      const total = await User.countDocuments({isDelete:false,...matchQuery});
  
      return res.status(200).send({
        status: true,
        message: "Success",
        users, 
        total: total ? total : 0,
      });
      
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        error: error.message || "Internal Server Error!!",
      });
    }
  };
  
  exports.userBlock = async (req, res) => {
    try {
      if (!req.query.userId) {
        return res
          .status(400)
          .send({ status: false, message: "Oops ! Invalid details!!" });
      }
      const user = await User.findById(req.query.userId);
      if (!user) {
        return res.status(200).send({ status: false, message: "User not exist" });
      }
      user.isBlock = !user.isBlock;
      await user.save();
      return res.status(200).send({
        status: true,
        message: "Status Updated Successfully",
        user: user,
      });
    } catch (error) {
      console.log(error);
      return res.status({
        status: false,
        message: error.message || "Internal Server Error!!",
      });
    }
  };
  
  exports.getProfile = async (req, res) => {
    try {
      if (!req.query.userId) {
        return res
          .status(200)
          .send({ status: false, message: "Invalid Details" });
      }
      const user = await User.findOne({
        _id: req?.query?.userId,
        isDelete: false,
      }).lean()
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
      return res
        .status(500)
        .send({ status: false, message: "Internal server error" });
    }
  };
  

  