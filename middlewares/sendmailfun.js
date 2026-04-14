const nodemailer=require('nodemailer');
require('dotenv').config()
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

module.exports={sendEmail};