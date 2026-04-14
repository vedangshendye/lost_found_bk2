const {Pool}=require('pg');
const bcrypt=require('bcrypt');
const pool=new Pool({
user: 'postgres',
host: 'localhost',
database: 'lostfound',
password: 'Incorrect@47',
port: 5432,
})
//mis,username,password,emailid

async function getallusers(){
    try{
        let items=await pool.query(`select * from users;`);
        return items.rows;
    }
    catch(err){
        console.log(err);
        return null;
    }
}

async function signupdb(mis,username,password,emailid) {
    let user=null;
    try{
        //let hashedpass=await bcrypt.hash(password,10);//not needed since password was hashed while storing in tempdb
        user=await pool.query("insert into users(mis,username,password,emailid) values($1,$2,$3,$4) returning *;",[mis,username,password,emailid]);
        console.log("user created");
        return user.rows[0];
    }
    catch(err){
        console.error(err);
        console.log("error in function signupdb");
        return null;
    }
}
//stores hashed pass in tempuser
async function signuptempdb(mis,username,password,emailid,otp){
    let user=null;
    try{
        let hashedpass=await bcrypt.hash(password,10);
        user=await pool.query("insert into tempuser(mis,username,password,emailid,otp) values($1,$2,$3,$4,$5) returning *;",[mis,username,hashedpass,emailid,Number(otp)]);
        console.log("tempuser created");
        return user.rows[0];
    }
    catch(err){
        console.error(err);
        console.log("error in function signuptempdb");
        return null;
    }
}
async function gettempuserdb(username,otp){
    try{
        let result =await pool.query("select * from tempuser where username=$1 and createdat>NOW()-interval '10 minutes';",[username]);
        if(result.rows.length === 0){
            throw new Error("OTP expired or invalid user");
        }
        if(result.rows[0].otp!=Number(otp)){
            throw new Error("invalid otp entered");
        }
        await pool.query("delete from tempuser where username=$1 ;",[username]);
        return result.rows[0];
    }
    catch(err){
        console.log("error in gettempuserdb");
        console.log(err);
    }
}

async function getuserdb(username,password){
    try{
        const {rows}=await pool.query("select * from users where username=$1 ;",[username]);
        if(rows.length===0){
            throw new Error("invalid username");
        }
        let res=await bcrypt.compare(password,rows[0].password);
        if(!res){
            throw new Error("incorrect password entered")
        }
        return rows[0]; 
    }
    catch(err){
        console.error(err.message);
        console.log("error in function getuserdb");
        return null;
    }
}
module.exports={
    signupdb,signuptempdb,getuserdb,gettempuserdb,getallusers
};
