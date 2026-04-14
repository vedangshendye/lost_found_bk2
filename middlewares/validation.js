const {body,matchedData,validationResult}=require('express-validator');

const signupvalid=[
    //{username,mis,password,emailid}
    body('username').isLength({min:1,max:20}).withMessage("username must be betwwen 1 to 20 characters long"),
    body('emailid').isEmail().withMessage("enter a valid email id!"),
    body('mis').isLength({min:9,max:9}).withMessage("mis should be 9 number long"),
    body('password').isLength({min:6}).withMessage("password must be atleast 6 character long")
];

const getotpvalidator=[
    ...signupvalid,
    (req,res,next)=>{
        console.log(req.body);
        console.log("signupvalidator entered");
        let errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({message:"invalid values filled in form",errors});
        }
        return next();
    }
];

const realsignupvalid=[
    body('username').isLength({min:1,max:20}).withMessage("username must be betwwen 1 to 20 characters long"),
    body('otp').isLength({min:6,max:6}).withMessage("The otp should be 6 digits!")
];

const signupvalidator=[
    ...realsignupvalid,
    (req,res,next)=>{
        console.log("realsignupvalidator entered");
        let errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({message:"invalid values filled in form",errors});
        }
        return next();
    }
]

const loginvalid=[
    body("username").isLength({min:1,max:20}).withMessage("username must be betwwen 1 to 20 characters long")
];
const loginvalidator=[
    ...loginvalid,
    (req,res,next)=>{
        console.log("loginvalidator entered");
        let errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({message:"invalid values filled in form",errors});
        }
        return next();
    }
]

//{name,description,whenlost,wherelost,status}
// const itemvalid=[
//     body('name').isLength({min:1,max:30}).withMessage("item name length too long!"),
//     body('whenlost').notEmpty().withMessage("whenlost is required!")
//     .isISO8601().withMessage("whenlost must be in ISO8601 format!")
// ];
const itemvalid = [
    body('name')
        .notEmpty().withMessage("item name is required!")
        .bail()
        .isLength({ min: 1, max: 30 }).withMessage("item name must be <= 30 chars!"),

    body('whenlost')
        .notEmpty().withMessage("whenlost is required!")
        .bail()
        .isISO8601().withMessage("whenlost must be in ISO8601 format!")
];

const itemvalidator=[
    ...itemvalid,
    (req,res,next)=>{
        console.log("loginvalidator entered");
        let errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({message:"invalid values filled in form",errors});
        }
        return next();
    }
]

module.exports={getotpvalidator,signupvalidator,loginvalidator,itemvalidator}