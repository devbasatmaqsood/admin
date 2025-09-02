const OTP = require("../../models/otp.model");
const EmailVerify = require("../../models/emailVerify.model");

//import model
const User = require("../../models/user.model");
const { Resend } = require("resend");

//create OTP and send the email for password security
exports.store = async (req, res) => {
  try {
    const trimmedEmail = req.query.email.trim();
    if (!req.query.email) {
      return res.status(200).json({ status: false, message: "Email must be requried!!" });
    }

    var newOtp = Math.floor(Math.random() * 8999) + 1000;

    const [userEmail, existOTP] = await Promise.all([User.findOne({ email: req.query.email }), OTP.findOne({ email: req.query.email })]);

    if (!userEmail) {
      return res.status(200).json({
        status: false,
        message: "User does not found with that email.",
      });
    }

    if (existOTP) {
      existOTP.otp = newOtp;
      await existOTP.save();
    } else {
      const otp = new OTP();

      otp.email = req.query.email;
      otp.otp = newOtp;
      await otp.save();
    }

    //OTP MAIL
    var tab = ``;
    tab += `<!DOCTYPE html><html lang="en"><head>`;
    tab += `<meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">`;
    tab += `</head><body><div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">`;
    tab += `<div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Hi, Mr./Mis. ${userEmail.fname}</a>
          </div>`;
    tab += ` <p style="font-size:1.1em">Hi,</p><p>Thank you for choosing ${process.env.projectName}. Use the following OTP to forget the Password for Password Security</p>`;
    tab += `<h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${newOtp}</h2>`;
    tab += ` <p style="font-size:0.9em;">Regards,<br />${process.env.projectName}</p><hr style="border:none;border-top:1px solid #eee" />`;
    tab += ` <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">`;
    tab += `  </div></div></div></body></html>`;

    const resend = new Resend(settingJSON?.resendApiKey);

    const response = await resend.emails.send({
      from: process?.env?.EMAIL,
      to: trimmedEmail,
      subject: `Sending email from ${process?.env?.projectName} for Password Security`,
      html: tab,
    });

    if (response.error) {
      console.error("Error sending email via Resend:", response.error);
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP email",
        error: response.error.message,
      });
    }

    return res.status(200).json({ status: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//create otp when user login with email-password
exports.otplogin = async (req, res) => {
  try {
    if (!req.query.email) {
      return res.status(200).json({ status: false, message: "Email must be requried." });
    }

    var newOtp = Math.floor(Math.random() * 8999) + 1000;

    const existOTP = await OTP.findOne({ email: req.query.email });
    if (existOTP) {
      existOTP.otp = newOtp;
      await existOTP.save();
    } else {
      const otp = new OTP();
      otp.email = req.query.email;
      otp.otp = newOtp;
      await otp.save();
    }

    let tab;

    if (req.query.type === "emailVerify") {
      tab = `<!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
        }
        p {
          color: #666;
        }
        .otp {
          margin: 20px 0;
          padding: 10px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 17px
        }
        .support {
          color: #007bff;
          text-decoration: none;
        }
      </style>
  
      </head>
      <body>
        <div class="container">
          <p>Please use the following One-Time Password (OTP) to complete the verify your email:</p>
          <div class="otp">
            <b>OTP: ${newOtp}</b>
            <p>(Note: This OTP is valid for a limited time, so make sure to use it promptly.)</p>
          </div>
  
          <p>If you encounter any issues during the verification process or have any questions, feel free to <a class="support" href="#">reach out to our support team</a>.</p>
        </div>
      </body>
      </html>`;
    } else {
      //OTP MAIL
      tab = `<!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #333;
        }
        p {
          color: #666;
        }
        .otp {
          margin: 20px 0;
          padding: 10px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 17px
        }
        .support {
          color: #007bff;
          text-decoration: none;
        }
      </style>
  
      </head>
      <body>
        <div class="container">
          <p>Please use the following One-Time Password (OTP) to complete the verification process:</p>
          <div class="otp">
            <b>OTP: ${newOtp}</b>
            <p>(Note: This OTP is valid for a limited time, so make sure to use it promptly.)</p>
          </div>
  
          <p>If you encounter any issues during the verification process or have any questions, feel free to <a class="support" href="#">reach out to our support team</a>.</p>
        </div>
      </body>
      </html>`;
    }

    const resend = new Resend(settingJSON?.resendApiKey);

    const response = await resend.emails.send({
      from: process?.env?.EMAIL,
      to: req.query.email,
      subject: `Sending email from ${process?.env?.projectName} for Password Security`,
      html: tab,
    });

    if (response.error) {
      console.error("Error sending email via Resend:", response.error);
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP email",
        error: response.error.message,
      });
    }

    return res.status(200).json({ status: true, message: "OTP Sent Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//verify the OTP
exports.verify = async (req, res) => {
  try {
    if (!req.query.email || !req.query.otp) {
      return res.status(200).json({ status: false, message: "OTP and email must be requried." });
    }

    const otpUser = await OTP.findOne({ email: req.query.email }).sort({
      createdAt: -1,
    });
    if (!otpUser) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (parseInt(req.query.otp) === otpUser.otp) {
      otpUser.deleteOne();

      res.status(200).json({ status: true, message: "OTP Verified Successfully!" });

      // if (req.query.type === 'emailVerify') {
      //   await EmailVerify.create({
      //     email: req.query.email,
      //   });
      // }

      return;
    } else {
      return res.status(200).json({ status: false, message: "OTP does not matched!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//create OTP and send the email for email verification
exports.sendOtpForEmailVerify = async (req, res) => {
  try {
    console.log("req.query.email: ", req.query.email);
    if (!req.query.email) {
      return res.status(200).json({ status: false, message: "Email must be requried!!" });
    }
    const alreadyEmail = await EmailVerify.findOne({ email: req.query.email });
    if (alreadyEmail) {
      return res.status(200).json({ status: false, message: "Email is already registered" });
    }
    var newOtp = Math.floor(Math.random() * 8999) + 1000;

    const [userEmail, existOTP] = await Promise.all([OTP.findOne({ email: req.query.email })]);

    if (existOTP) {
      existOTP.otp = newOtp;
      await existOTP.save();
    } else {
      const otp = new OTP();

      otp.email = req.query.email;
      otp.otp = newOtp;
      await otp.save();
    }

    //OTP MAIL
    var tab = ``;
    tab += `<!DOCTYPE html><html lang="en"><head>`;
    tab += `<meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">`;
    tab += `</head><body><div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">`;
    tab += `<div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Hi</a>
          </div>`;
    tab += ` <p style="font-size:1.1em">Hi,</p><p>Thank you for choosing ${process.env.projectName}. Use the following OTP to forget the Password for Verify your emailId</p>`;
    tab += `<h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${newOtp}</h2>`;
    tab += ` <p style="font-size:0.9em;">Regards,<br />${process.env.projectName}</p><hr style="border:none;border-top:1px solid #eee" />`;
    tab += ` <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">`;
    tab += `  </div></div></div></body></html>`;

    // const resend = new Resend('re_YDcoDtQD_3CUNrHVuNuMZXiLD8oDMebBj');
    const resend = new Resend(settingJSON?.resendApiKey);
    console.log("resend: ", resend);

    const response = await resend.emails.send({
      from: process?.env?.EMAIL,
      to: req.query.email,
      subject: `Sending email from ${process?.env?.projectName} for Password Security`,
      html: tab,
    });

    if (response.error) {
      console.error("Error sending email via Resend:", response.error);
      return res.status(500).json({
        status: false,
        message: "Failed to send OTP email",
        error: response.error.message,
      });
    }

    return res.status(200).json({ status: true, message: "OTP Sent Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
