const {claimdb,founddb, get_owner_email,get_finder_email}=require('./db/queries');
require('dotenv').config();
const nodemailer=require('nodemailer')
async function claim(req,res){
    console.log("claim function entered");
    try{
        const user_id=req.user.id;//claimer's id
        const item_id=Number(req.params.item);
        const {claimermessage}=req.body;
        if (!claimermessage) {
            return res.status(400).json({ message: "Claimer message required" });
        }
        if (!item_id || isNaN(item_id)) {
            return res.status(400).json({ message: "Invalid item id" });
        }

        let reply=await claimdb(user_id,item_id);
        if(!reply){
            return res.status(300).json({message:"claimdb returned null"})
        }
        if(reply.rowCount==0){
            return res.status(300).json({message:"no such item in db"})
        }
        console.log("marked as claim successfully");

        let finderemail=await get_finder_email(item_id);
        await sendEmail(claimermessage,finderemail,"Item you found belongs to me!")
        req.user.acts_today+=1;
        return res.status(200).json({message:"marked as claimed successfully",item:reply.rows[0]})
    } 
    catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured:"+err.message})
    }
}

//a mail needs to be sent to the owner which must contain finder info
async function found(req,res){
    console.log("found function entered")
    try{
        const user_id=req.user.id;
        const item_id=Number(req.params.item);
        const {findermessage}=req.body;//message that finder wants to convey to owner in the mail that will be auto generated

        if (!findermessage) {
            return res.status(400).json({ message: "Finder message required" });
        }
        if (!item_id || isNaN(item_id)) {
            return res.status(400).json({ message: "Invalid item id" });
        }

        let reply=await founddb(user_id,item_id);//notes user_id found the item
        console.log("REPLY:",reply);
        if(reply.rowCount==0){
            return res.status(404).json({message:"no such item in db"})
        }
        console.log("no error till here. Marked as found successfully");
        const owner_email=await get_owner_email(item_id);
        /* in later versions, make a db call to get finding using their id and include those details in email*/
        await sendEmail(findermessage,owner_email,"Your item has been found!")

        req.user.acts_today+=1;
        return res.status(200).json({message:"marked as found successfully",item:reply.rows[0]})
    } catch(err){
        console.log(err);
        return res.status(400).json({message:"error occured "+err.message})
    }
}
async function sendEmail(message,reciever,title){
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth: {
          user: process.env.MAIL_USER,       // sender email
          pass: process.env.MAIL_PASS,           // app password
        }
    })
    const mailoptions={
        from:process.env.MAIL_USER,
        to:reciever,
        subject:title,
        text:message
    }
    const info=await transporter.sendMail(mailoptions);
    console.log("mail sent successuflly\n");
    console.log(info);
    return;
}
module.exports={claim,found,sendEmail}