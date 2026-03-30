const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken")

async function authMiddleware(req, res, next){
    const token = req.cookies.jwt_token || req.headers.authorisation?.split("")[1];
    if(!token){
        return res.status(401).json({
            message:"anuthorise access, token is missing"
        })
    }


    try{
        const decoded= jwt.verify(token , process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)
        req.user=user;
        return next();
    } catch(error){
        return res.status(401).json({
            message:"unauthorised aceess as its invalid token "
        })
    }
}

module.exports={authMiddleware}

// ## Poora Flow Ek Baar Mein
// ```
// Request aayi
//      ↓
// Token dhundha (cookie ya header)
//      ↓
// Nahi mila → 401 "token missing" ❌
//      ↓
// jwt.verify() se check kiya
//      ↓
// Invalid/Expired → 401 "invalid token" ❌
//      ↓
// DB se user nikala → req.user mein daala
//      ↓
// next() → Controller ko jaane diya ✅