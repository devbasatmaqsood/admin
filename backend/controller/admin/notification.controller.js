const Notification = require("../../models/notification.model");
const User = require("../../models/user.model");
const Doctor = require("../../models/doctor.model");
const admin = require("../../firebase");

exports.particularUserNotification = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).send({ status: false, message: "Oops! Invalid details!!" });
    }

    const [user, notification] = await Promise.all([
      User.findById(req.query.userId),
      Notification.create({
        user: req.query.userId,
        stateType: 2,
        title: req.body.title,
        image: req.file ? process?.env?.baseURL + req.file.path : "",
        message: req.body.message,
        notificationType: 1,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }),
    ]);

    if (!user) {
      return res.status(200).send({ status: false, message: "User does not exist" });
    }

    const payload = {
      token: user.fcmToken,
      notification: {
        body: req.body.message,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
      },
    };

    const adminPromise = await admin;
    if (user && user.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (user && user.webFcmToken !== null) {
      try {
        const payload = {
          token: user.webFcmToken,
          notification: {
            body: req.body.message,
            title: req.body.title,
            image: req.file ? process.env.baseURL + req.file.path : "",
          },
        };

        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    return res.status(200).json({ status: true, message: "Success", notification });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

exports.particularDoctorNotification = async (req, res) => {
  try {
    if (!req.body.message || !req.body.title || !req.query.doctorId) {
      return res.status(200).send({
        status: false,
        message: "Oops ! Invalid details!!",
      });
    }

    const [doctor, notification] = await Promise.all([
      Doctor.findById(req.query.doctorId),
      Notification.create({
        doctor: doctor._id,
        title: req.body.title,
        image: req.file ? process?.env?.baseURL + req.file.path : "",
        message: req.body.message,
        notificationType: 2,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }),
    ]);

    if (!doctor) {
      return res.status(200).send({ status: false, message: "Doctor does not exist" });
    }

    res.status(200).json({ status: true, message: "Success", notification });

    const payload = {
      token: doctor.fcmToken,
      notification: {
        body: req.body.message,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
      },
    };

    await notification.save();

    const adminPromise = await admin;
    if (doctor && doctor.fcmToken !== null) {
      try {
        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }

    if (doctor && doctor.webFcmToken !== null) {
      try {
        const payload = {
          token: doctor.webFcmToken,
          notification: {
            body: req.body.message,
            title: req.body.title,
            image: req.file ? process.env.baseURL + req.file.path : "",
          },
        };

        const response = await adminPromise.messaging().send(payload);
        console.log("Successfully sent message:", response);
      } catch (error) {
        console.log("Error sending message:", error);
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// exports.allUserNotification = async (req, res) => {
//   try {
//     // Fetch all users from the database
//     const users = await User.find({});
//     if (!users || users.length === 0) {
//       return res
//         .status(404) // Changed status to 404 for not found
//         .send({ status: false, message: "No users found" });
//     }

//     // Create an array to store the results of each notification attempt
//     const notificationResults = [];

//     // Iterate over each user to send the notification
//     for (const user of users) {
//       const payload = {
//         token: user.fcmToken,
//         notification: {
//           body: req.body.message,
//           title: req.body.title,
//           image: req.file ? process.env.baseURL + req.file.path : "",
//         },
//       };

//       const notification = new Notification({
//         user: user._id,
//         stateType: 2,
//         title: req.body.title,
//         image: req.file ? process?.env?.baseURL + req.file.path : "",
//         message: req.body.message,
//         notificationType: 1,
//         date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
//       });

//       await notification.save();

//       const adminPromise = await admin;
//       if (user && user.fcmToken !== null) {
//         try {
//           const response = await adminPromise.messaging().send(payload);
//           console.log("Successfully sent message:", response);

//           notificationResults.push({
//             user: user._id,
//             status: true,
//             message: "Notification sent",
//           });
//         } catch (error) {
//           console.log("Error sending message:", error);

//           notificationResults.push({
//             user: user._id,
//             status: false,
//             message: error.message || "Internal Server Error",
//           });
//         }
//       }
//     }

//     return res.status(200).json({
//       status: true,
//       message: "Notifications processed",
//       results: notificationResults,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send({
//       status: false,
//       message: error.message || "Internal Server Error",
//     });
//   }
// };

exports.allUserNotification = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users || users.length === 0) {
      return res.status(404).send({
        status: false,
        message: "No users found",
      });
    }

    const notificationResults = [];

    for (const user of users) {
      const hasFcmToken = user.fcmToken && user.fcmToken !== "";
      const hasWebFcmToken = user.webFcmToken && user.webFcmToken !== "";

      if (!hasFcmToken && !hasWebFcmToken) continue;

      const token = hasFcmToken ? user.fcmToken : user.webFcmToken;

      const payload = {
        token: token,
        notification: {
          body: req.body.message,
          title: req.body.title,
          image: req.file ? process.env.baseURL + req.file.path : "",
        },
      };

      const notification = new Notification({
        user: user._id,
        stateType: 2,
        title: req.body.title,
        image: req.file ? process.env.baseURL + req.file.path : "",
        message: req.body.message,
        notificationType: 1,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      });

      await notification.save();

      try {
        const adminPromise = await admin;
        const response = await adminPromise.messaging().send(payload);

        console.log("Successfully sent message:", response);

        notificationResults.push({
          user: user._id,
          status: true,
          message: "Notification sent",
        });
      } catch (error) {
        console.error("Error sending message:", error);

        notificationResults.push({
          user: user._id,
          status: false,
          message: error.message || "Internal Server Error",
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Notifications processed",
      results: notificationResults,
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).send({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
