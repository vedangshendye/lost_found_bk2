const {reset_count}=require('../db/queries');
async function check(req,res,next) {
    try{
        if(!req.user){
        return res.status(401).json({message:"unauthorized access!"})
        }
        let lastpost=new Date(req.user.lastactat);
        let today=new Date();
        let newday=lastpost.getDate()!=today.getDate()||lastpost.getMonth()!=today.getMonth()||lastpost.getFullYear()!=today.getFullYear();
        if(newday){
            await reset_count(req.user.id);
            req.user.acts_today=0;
            return next();//responsibility of controller to increment count
        }
        if(req.user.acts_today>=10){
            return res.status(429).json({message:"daily query limit exceeded"})
        }
        console.log("check successful");
        return next();
    }
    catch(err){
        console.log("error in check:");
        console.log(err);
    }
    
    /*first check if it is a new day. if yes, reset db's count and set req.user.acts_today to zero as well.
    then check if the count exceeds 9. if it does, deny. else allow*/
}
module.exports={check}