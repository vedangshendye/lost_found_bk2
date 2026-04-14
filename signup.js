const jwt=require('jsonwebtoken')
const {signuptempdb,gettempuserdb,signupdb,getuserdb}=require('./db/user_queries');
const {sendEmail}=require('./middlewares/sendmailfun');
async function getotp(req,res){
    try{
        let {username,mis,password,emailid}=req.body;
        let otp=Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        let user=await signuptempdb(mis,username,password,emailid,otp);
        await sendEmail(`Your otp for sign in is: ${otp}. It will expire in 10 mins`,emailid,"OTP for sign in");
        if(!user){
            throw new Error("signuptempdb returned null. Usercreation failed")
        }
        return res.status(201).json({message:"otp sent to your email. Use that to sign in",user});
    }
    catch(err){
        console.log(err);
        console.log("error in signup function",err.message);
        return res.status(403).json({message:"signup failed"});
    }
}

async function signup(req,res){
    try{
        let {username,otp}=req.body;
        let response=await gettempuserdb(username,otp);
        console.log("response received by signup frm gettempuserdb:",response)
        if(!response){
            return res.status(400).json({ message: "Invalid OTP" });
        }
        let {mis,password,emailid}=response;
        let user=await signupdb(mis,username,password,emailid);
        if(!user){
            throw new Error("realsignup failed");
        }
        let token=jwt.sign({username:user.username,id:user.id,acts_today:user.acts_today,lastactat:user.lastactat},process.env.SECRET,{expiresIn:"20m"});
        return res.status(200).json({message:"realsignup successful",user,token})
    }
    catch(err){
        console.log("error in realsignup");
        console.log(err);
        return res.status(402).json({message:err.message});
    }
}

async function login(req,res){
    try{
        if(!req.body||!req.body.username||!req.body.password){
            return res.status(400).json({message:"username and password both needed for login"})
        }
        let {username,password}=req.body;
        
        let user=await getuserdb(username,password);
        if(!user){
            throw new Error("incorrect password or username")
        }
        let token=jwt.sign({username:user.username,id:user.id,acts_today:user.acts_today,lastactat:user.lastactat},process.env.SECRET,{expiresIn:"20m"})
        return res.status(200).json({message:"login successful",user,token})
    }
    catch(err){
        console.log(err);
        console.log("error in login function",err);
        return res.status(400).json({message:err.message});
    }
}
module.exports={getotp,signup,login}