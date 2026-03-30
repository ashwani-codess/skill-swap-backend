const mongoose = require("mongoose")

const noShowReportSchema= new mongoose.Schema({
    exchange:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ExchangeRequest",
        required:true
    },
    reportedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    reportedUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

noShowReportSchema.index({ exchange: 1, reportedBy: 1 }, { unique: true })


const ReportModel= mongoose.model("reportModel",noShowReportSchema)
module.exports=ReportModel