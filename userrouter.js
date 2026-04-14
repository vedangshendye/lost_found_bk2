const express=require('express');
const userRouter=express();
const {getotpvalidator,signupvalidator,loginvalidator}=require('./middlewares/validation');
const {getotp,signup,login}=require('./signup.js')

userRouter.post('/getotp',getotpvalidator,getotp);
userRouter.post('/signup',signupvalidator,signup);
userRouter.post('/login',loginvalidator,login)
module.exports={userRouter}