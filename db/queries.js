const {Pool}=require('pg');
const bcrypt=require('bcrypt');
const pool=new Pool({
user: 'postgres',
host: 'localhost',
database: 'lostfound',
password: 'Incorrect@47',
port: 5432,
})

async function founddb(user_id,item_id){
    const client=await pool.connect();
    try{
        await client.query('BEGIN')
        await client.query("update users set acts_today=acts_today+1,lastact=CURRENT_TIMESTAMP where id=$1",[user_id])
        let result=await client.query(`update items set finder_id=$1,status='matched' where id=$2 returning * ;`,[user_id,item_id]);
        await client.query('COMMIT');
        return result;//result.rowCount tells how many rows updated
    } catch(err){
        console.log("error in founddb"+err);
        await client.query('ROLLBACK');
        return null;
    }finally{
        client.release();
    }
}
async function claimdb(userid,itemid){
    const client=await pool.connect();
    try{
        await client.query('BEGIN')
        await client.query("update users set acts_today=acts_today+1,lastact=CURRENT_TIMESTAMP where id=$1",[userid])
        let result=await client.query(`update items set owner_id=$1,status='claimed' where id=$2 returning * ;`,[userid,itemid]);
        console.log("no error in claimdb");
        await client.query('COMMIT');
        return result;//result.rowCount tells how many rows updated
    } catch(err){
        console.log(err);
        await client.query('ROLLBACK');
        return null;
    }finally{
        client.release();
    }
}

async function get_owner_email(item_id){
    try{
        let result=await pool.query("select * from items where id=$1",[item_id]);
        let ownerid=result.rows[0].owner_id;
        let ownerinfo=await pool.query("select * from users where id=$1",[ownerid]);
        console.log(ownerinfo);
        return ownerinfo.rows[0].emailid;
    }catch(err){
        console.log(err);
        return null;
    }
}
async function get_finder_email(item_id){
    try{
        let result=await pool.query("select * from items where id=$1",[item_id]);
        let finderid=result.rows[0].finder_id;
        let finderinfo=await pool.query("select * from users where id=$1",[finderid]);
        return finderinfo.rows[0].emailid;
    }
    catch(err){
        console.log("error in get_finder_email");
        console.log(err);
        return null;
    }
}
async function reset_count(user_id){
    try{
        let result=await pool.query("update users set acts_today=0 where id=$1 returning *;",[user_id]);
        return result;
    } catch(err){
        console.log("error in resetting count");
        console.log(err);
        return null;
    }
}
async function last_update(user_id){
    try{
        let result=await pool.query("update users set acts_today=0 where id=$1 returning *;",[user_id]);
        return result;
    } catch(err){
        console.log("error in resetting count");
        console.log(err);
        return null;
    }
}

async function delete_itemdb(item_id){
    try{
        let result=await pool.query("delete from items where id=$1",[item_id])
        return result.rowCount;
    }
    catch(err){
        console.log(err);
    }
}

async function delete_userdb(userid){
    try{
        let result=await pool.query("delete from users where id=$1",[userid])
        return result.rowCount;
    }
    catch(err){
        console.log(err);
    }
}
module.exports={founddb,claimdb,get_owner_email,get_finder_email,reset_count,
    last_update,delete_itemdb,delete_userdb,pool}