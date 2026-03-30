const mongoose= require("mongoose");


const skillSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Add title of your skill']

    },
    description:{
        type:String,
        required:[true,'add a bit description about your skill']

    },
    category:{
        type:String,
        enum:['tech', 'music', 'design','language']
    },
    level:{
        type:String,
        enum:['rookie','intermediate','expert']
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    verificationScore:{
        type:Number,
        default:0
    },
    tempAnswers:{
        type:String
    }

},{ timestamps: true })



// User ──< Skill        (ek user ke multiple skills)
// Skill ──< ExchangeRequest  (ek skill pe multiple requests aa sakti hain)
//skillsOffered User model mein Skill ka reference hai — matlab pehle Skill document create hoga, phir uska _id User ke skillsOffered array mein push hoga.


const skillModel= mongoose.model('Skill', skillSchema);
module.exports=skillModel