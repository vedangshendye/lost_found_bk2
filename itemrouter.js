const express=require('express');
const itemRouter=express();
const {upload}=require('./middlewares/multermiddleware.js')
const {itemvalidator}=require('./middlewares/validation.js');
const {authorize}=require('./middlewares/authmiddleware.js');
const {check}=require('./middlewares/check_acts.js');
const {uploaditem,getallitems}=require('./item.js');
const {found,claim}=require('./claimfound.js');

itemRouter.get('/',getallitems);
itemRouter.post('/',upload.single("image"),itemvalidator,authorize,check,uploaditem)
itemRouter.post('/foundit/:item',authorize,check,found);
itemRouter.post('/claimit/:item',authorize,check,claim);

module.exports={itemRouter}