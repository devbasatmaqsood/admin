require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const moment = require("moment");
var logger = require("morgan");
const path = require("path");
const cron = require("node-cron");

app.use(express.json());
app.use(cors());
app.use(logger("dev"));

const fs = require("fs");

const Setting = require("./models/setting.model");

//Declare global variable
global.settingJSON = {};

//handle global.settingJSON when pm2 restart
async function initializeSettings() {
  try {
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    if (setting) {
      console.log("In setting initialize Settings");
      global.settingJSON = setting.toObject();
    } else {
      global.settingJSON = require("./setting");
    }
  } catch (error) {
    console.error("Failed to initialize settings:", error);
  }
}

module.exports = initializeSettings();

//Declare the function as a global variable to update the setting.js file
global.updateSettingFile = (settingData) => {
  const settingJSON = JSON.stringify(settingData, null, 2);
  fs.writeFileSync("setting.js", `module.exports = ${settingJSON};`, "utf8");

  global.settingJSON = settingData; // Update global variable
  console.log("Settings file updated.");
};

async function startServer() {
  try {
    require("./middleware/mongodb");

    await initializeSettings();

    const indexRoute = require("./route/index");
    app.use(indexRoute);

    const http = require("http");
    const server = http.createServer(app);
    global.io = require("socket.io")(server);
    require("./socket");

    app.use("/storage", express.static(path.join(__dirname, "storage")));

    server.listen(port, () => {
      console.log(`magic happen on ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();

const Doctor = require("./models/doctor.model");
const Attendance = require("./models/attendance.model");

async function updateAttendance(doctorId, action) {
  try {
    const todayDate = moment().format("YYYY-MM-DD");

    let attendanceRecord = await Attendance.findOne({
      doctor: doctorId,
      month: moment().format("YYYY-MM"),
    }).populate("doctor");

    const doctor = await Doctor.findById(doctorId);

    let savedAttendance;

    if (!attendanceRecord) {
      attendanceRecord = new Attendance();
      attendanceRecord.doctor = doctor._id;
      attendanceRecord.month = moment().format("YYYY-MM");
    }

    const dateIndex = attendanceRecord.attendDates.indexOf(todayDate);
    const absentIndex = attendanceRecord.absentDates.indexOf(todayDate);

    if (action == 2) {
      if (absentIndex !== -1 || dateIndex !== -1) {
        console.log(`Attendance for today has already been marked for ${doctor.name}`);
        return;
      }

      if (dateIndex !== -1) {
        attendanceRecord.attendCount -= 1;
        attendanceRecord.attendDates.splice(dateIndex, 1);
      }

      attendanceRecord.absentCount += 1;
      attendanceRecord.absentDates.push(todayDate);
    }

    attendanceRecord.totalDays = attendanceRecord.attendCount + attendanceRecord.absentCount;

    doctor.isAttend = false;

    await doctor.save();

    savedAttendance = await attendanceRecord.save();
  } catch (error) {
    console.log("error", error);
  }
}

//expert who are not attend are count as absent for the day
cron.schedule("50 23 * * *", async () => {
  try {
    const allDoctors = await Doctor.find({ isDelete: false });

    for (const doctor of allDoctors) {
      await updateAttendance(doctor._id, 2);
    }

    const result = await Doctor.updateMany({ isAttend: false });

    if (result.matchedCount === 0) {
      console.warn("No doctors needed attendance update.");
    } else {
      console.log(`${result.modifiedCount} doctors updated successfully.`);
    }

    console.log("Cron job executed successfully.");
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
});
