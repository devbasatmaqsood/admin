const mongoose = require('mongoose');
const { BANNER_TYPE } = require('../types/constant')
const bannerSchema = new mongoose.Schema(
    {
        isActive: { type: Boolean, default: true },
        image: { type: String, default: "" },
        type: { type: Number,enum: BANNER_TYPE},   // 0-service 1-url
        service:{type:mongoose.Schema.Types.ObjectId,ref:"Service"},
        url:String
    },
    {
        timestamps: true,
        versionKey: false,
      }
)

module.exports = mongoose.model('Banner', bannerSchema);