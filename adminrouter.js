const express=require('express');
const {admin_login,admin_page,admin_auth,delete_item,delete_user}=require('./admin.js')
const adminRouter=express();

adminRouter.post('/login',admin_login)
adminRouter.get('/',admin_auth,admin_page)
adminRouter.post('/delete_user/:userid',admin_auth,delete_user);
adminRouter.post('/delete_item/:itemid',admin_auth,delete_item);

module.exports={adminRouter}