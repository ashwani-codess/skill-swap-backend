const mongoose = require("mongoose")

const coinClaimSchema = new mongoose.Schema({
    exchangeId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ExchangeRequest"

    },
    claimedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"

    },
    claimedAt:{
        type:Date,
        default:Date.now()

    }
},{
    timestamps:true
})


coinClaimSchema.index({exchangeId:1, claimedBy:1})

const skillCoinsModel = mongoose.model("coinModel", coinClaimSchema)
module.exports=skillCoinsModel