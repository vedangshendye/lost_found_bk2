const jwt=require('jsonwebtoken');
const {delete_itemdb,delete_userdb}=require('./db/queries');
const {getallusers}=require('./db/user_queries');
const {getallitems}=require('./db/item_queries');
require('dotenv').config();
async function admin_login(req,res){
    let {password}=req.body;
    if(password!==process.env.ADMIN_PASS){
        return res.status(400).json({message:"Incorrect password entered"})
    }
    let token=jwt.sign({fruit:process.env.FRUIT},process.env.SECRET);
    res.status(200).json({message:"login successful",token:token})
}

async function admin_page(req,res){
    console.log("admin_page entered");
    let users=await getallusers();
    let items=await getallitems();
    if(!users) {throw new Error("couldnt retrieve users from database")}
    if(!items) {throw new Error("Couldn't retrieve items from database")}
    res.json({message:"Welcome Admin!",users,items})
}

async function delete_item(req,res){
    let item_id=req.params.itemid;
    let result=await delete_itemdb(Number(item_id));
    if(result===null||result===0){
        return res.status(400).json({message:"error deleting"})
    }
    return res.status(200).json({message:"deletion successful"})
}
async function delete_user(req,res){
    let user_id=req.params.userid;
    let result=await delete_userdb(Number(user_id));
    if(result===null||result===0){
        return res.status(400).json({message:"error deleting"})
    }
    return res.status(200).json({message:"deletion successful"})
}
async function admin_auth(req,res,next){
    let token=req.headers.authorization;
    if(!token||!token.startsWith("Bearer ")){
        return res.status(400).json({message:"authorized access only!"});
    }
    let payload=jwt.verify(token.split(" ")[1],process.env.SECRET);
    if(!payload||!payload.fruit||payload.fruit!=process.env.FRUIT){
        return res.status(400).json({message:"missing or invalid token"});
    }
    next();
}
module.exports={admin_login,admin_page,admin_auth,delete_item,delete_user}

/*two routes needed. One for login which upon success will generate a token and send it. token must not contain the password rather something 
else. auth */