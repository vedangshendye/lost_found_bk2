const express=require('express');
const cors=require('cors');
let app=express();
let {userRouter}=require('./userrouter.js')
let {itemRouter}=require('./itemrouter.js');
const { adminRouter } = require('./adminrouter.js');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
  origin: /^http:\/\/localhost:\d+$/,  // allow any localhost port
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use('/users',userRouter);
app.use('/items',itemRouter);
app.use('/admin',adminRouter);

app.listen(8000,(err)=>{
    if(err){
        console.log(err.message)
        console.log(err);
    }
    console.log("server running at port:",8000);
    console.log("manual changes");
});