// if authorization token is absent, responds accordingly, else allows
require('dotenv').config();
const jwt=require('jsonwebtoken');

function authorize(req,res,next){
    console.log("authorize entered with item no")
    let token=req.headers.authorization;
    if(!token||!token.startsWith("Bearer ")){
        res.status(401).json({message: "Sign up or login first"})
        console.log("Sign up or login first");
        return;
    }
    try{
        let realtoken=token.split(' ')[1];
        let payload=jwt.verify(realtoken,process.env.SECRET);
        req.user=payload;
        return next();
    }
    catch(err){
        console.error(err);
        return res.status(401).json({message:"invalid or expired token"});
    }
}

module.exports={authorize}