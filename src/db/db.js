const mongoose = require('mongoose');

async function connectToDB(){
    await mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("server is successfully connected to our database");
    })
    .catch(err=>{
        console.error(err);
        process.exit(1);
    }
    )
}

mongoose.connection.once("open",()=>{  //Jab bhi mongoose ka connection pehli baar open hota hai, ye fire hota hai

    console.log("Connected to DB", mongoose.connection.name);
});

module.exports=connectToDB