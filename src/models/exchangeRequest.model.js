const mongoose = require("mongoose");
const ExchangeRequestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'assign sender']

    },
    reciever: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'assign Reciever']

    },
    senderSkill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
        required: [true]

    },
    recieverSkill: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
        required: [true]
    },
    requestType:{
        type:String,
        enum:['skill-exchange','coin-exchange'],
        default:'skill-exchange'
    },
    coinAmount:{  //is request ke liye kitne coin lagenge
        type:Number,
        default:0
    },
    status: {
        type:String,
        enum:['pending', 'completed', 'declined','accepted'],
        default:"pending"

    },
    message: {
        type:String,
        default:""

    },
    roomId: {
        type:String, //is generated wheneever the request is Accepted
        default:null  //Jab tak accepted nahi, yeh null rahega
        //Frontend is roomId se video room mein join karega.




    },
    scheduledAt: {
        type:Date

    }
},{ timestamps: true })

const ExchangeRequestModel= mongoose.model("ExchangeRequest", ExchangeRequestSchema)
module.exports=ExchangeRequestModel;

