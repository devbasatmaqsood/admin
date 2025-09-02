const Attendance = require("../../models/attendance.model");
const Doctor = require('../../models/doctor.model')
const Appointment = require('../../models/appointment.model')
const moment = require("moment");

exports.getAttendanceForDoctor = async (req, res) => {
    try {
        const doctorId = req.query.doctorId;
        const month = req.query.month;

        if (!doctorId || !month) {
            return res
                .status(200)
                .json({ status: false, message: "Invalid details provided" });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res
                .status(200)
                .json({ status: false, message: "doctor Not Found" });
        }

        const attendanceForDoctor = await Attendance.find({
            doctor: doctor._id,
            month: month,
        });
        return res.status(200).send({
            status: true,
            message: "data fetch successfully",
            data: attendanceForDoctor[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
};


exports.postAttendance = async (req, res) => {
    try {
        const { doctorId, action } = req.query;
        const todayDate = moment().format("YYYY-MM-DD");

        if (!doctorId || !action) {
            return res
                .status(200)
                .json({ status: false, message: "Invalid details provided" });
        }

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res
                .status(200)
                .json({ status: false, message: "doctor Not Found" });
        }

        let attendanceRecord = await Attendance.findOne({
            doctor: doctor._id,
            month: moment().format("YYYY-MM"),
        }).populate("doctor");

        let savedAttendance;

        if (!attendanceRecord) {
            attendanceRecord = new Attendance();
            attendanceRecord.doctor = doctor._id;
            attendanceRecord.month = moment().format("YYYY-MM");
        }

        const dateIndex = attendanceRecord.attendDates.indexOf(todayDate);
        const absentIndex = attendanceRecord.absentDates.indexOf(todayDate);

        if (action == 1) {
            if (dateIndex !== -1) {
                return res.status(200).json({
                    status: false,
                    message: `Attendance for today has already been marked`,
                });
            }

            if (absentIndex !== -1) {
                attendanceRecord.absentCount -= 1;
                attendanceRecord.absentDates.splice(absentIndex, 1);
            }

            attendanceRecord.attendCount += 1;
            attendanceRecord.attendDates.push(todayDate);
            attendanceRecord.checkInTime = moment().format("hh:mm A")
            doctor.isAttend = true;
            doctor.showDialog = true;
            await doctor.save();
        } else if (action == 2) {
            if (absentIndex !== -1 || dateIndex !== -1) {
                return res.status(200).json({
                    status: false,
                    message: `Attendance for today has already been marked`,
                });
            }

            if (dateIndex !== -1) {
                attendanceRecord.attendCount -= 1;
                attendanceRecord.attendDates.splice(dateIndex, 1);
            }

            attendanceRecord.absentCount += 1;
            attendanceRecord.absentDates.push(todayDate);

            //Cancel all appointments for today if doctor is absent
            try {
                console.log(moment().format("hh:mm A"));
                console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
                console.log("todayDate: ", todayDate);

                await Appointment.updateMany(
                    {
                        doctor: doctor._id,
                        date: todayDate,
                        status: 1, //Only cancel pending appointments
                    },
                    {
                        $set: {
                            status: 4,
                            cancelTime: moment().format("hh:mm A"),
                            reason: {
                                reason: "Doctor is not available",
                                person: 3,
                            },
                        },
                    }
                );
            } catch (cancelError) {
                console.error("Error canceling appointments:", cancelError);
            }

            doctor.isAttend = false;
            doctor.showDialog = true;
            await doctor.save();
        }

        attendanceRecord.totalDays =
            attendanceRecord.attendCount + attendanceRecord.absentCount;

        savedAttendance = await attendanceRecord.save();

        let data = {
            attendCount: attendanceRecord.attendCount,
            absentCount: attendanceRecord.absentCount,
            totalDays: attendanceRecord.totalDays,
            attendDates: attendanceRecord.attendDates,
            absentDates: attendanceRecord.absentDates,
            checkInTime: attendanceRecord.checkInTime
        }

        res.status(200).json({
            status: true,
            message: `${action === "attend" ? "Attendance" : "Absent"
                } marked successfully`,
            data
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
};