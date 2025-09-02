const Doctor = require('../../models/doctor.model')
const History = require('../../models/doctorWalletHistory.model')


exports.getWalletHistory = async (req, res) => {
    try {
        const { doctorId, type } = req.query
        if (!doctorId || !type) {
            return res
                .status(200)
                .send({ status: false, message: "Oops ! Invalid details!!" });
        }
        const doctor = await Doctor.findById(doctorId)
        if (!doctor) {
            return res.status(200).send({ status: false, message: "doctor not found" });
        }

        const startDate = req.query.startDate || "ALL";
        const endDate = req.query.endDate || "ALL";

        let dateFilter = {};
        if (startDate != "ALL" && endDate != "ALL") {
            dateFilter = {
                date: {
                    $gte: req.query.startDate,
                    $lte: req.query.endDate,
                },
            };
        }

        const history = await History.find({ doctor: doctor._id, ...dateFilter, type }).populate('appointment','_id appointmentId date').lean();

        return res.status(200).send({
            status: true,
            message: "Success",
            data: history,
            wallet: doctor.wallet
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            error: error.message || "Internal Server Error!!",
        });
    }
}