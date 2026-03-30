const mongoose = require('mongoose')
const bcrypt= require("bcryptjs")
const userSchema= new mongoose.Schema({
    email:{
        type:String,
        required:[true, "Email is required to create an account"],
        unique:true,
        trim:true,
        lowercase:true,
        match:[
      /^\S+@\S+\.\S+$/, // The email regex pattern
      'Please enter a valid email address.' // Custom error message if the pattern fails
    ]
    },
    name:{
        type:String,
        required:[true,"name is required to create an account"]
    },
    password:{
        type:String,
        required:[true, "password is required to create an account"],
        minlength:[6, "password must be grater than 5 characters"],
        select:false
    },
        bio: {
        type: String,
        maxlength: [300, "Bio cannot exceed 300 characters"],
        default: ""  
    },
    skillsOffered:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Skill",  //skill model se reference lena,
        maxlength:[5, " user can only offer 5 skills"]
    }],
    skillsWanted:[{
        type:String,
        trim:true
    }],
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    rating: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 }
}, 
skillCoins:{
    type:Number,
    default:10
},
reliabilityScore:{
    type:Number,
    default:100
},
totalSessions:{
    type:Number,
    default:0,

},
noShowCount:{
    type:Number,
    default:0
}
}, {
        timestamps:true
    })




    userSchema.pre('save', async function(next){
        if(!this.isModified("password")){
            return
        }
        else{
            const hash = await bcrypt.hash(this.password,10)
            this.password=hash;
            return;
        }
    })

    userSchema.methods.comparePassword=async function(password){
        return await bcrypt.compare(password, this.password)
    }


    const userModel = mongoose.model('User', userSchema);

    module.exports=userModel;