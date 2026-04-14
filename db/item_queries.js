const {Pool}=require('pg');
const bcrypt=require('bcrypt');
const pool=new Pool({
user: 'postgres',
host: 'localhost',
database: 'lostfound',
password: 'Incorrect@47',
port: 5432,
})

async function additemdb(name,description,image_url,finder_id,owner_id,wherelost,whenlost,category,type){
    try{
        if(finder_id){await pool.query("update users set acts_today=acts_today+1,lastact=CURRENT_TIMESTAMP where id=$1",[finder_id])}
        if(owner_id){await pool.query("update  users set acts_today=acts_today+1,lastact=CURRENT_TIMESTAMP where id=$1",[owner_id])}
        const item=await pool.query(`insert into items(name,description,image_url,finder_id,owner_id,location,whenlost,category,type)
            values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *;`,[name,description,image_url,finder_id,owner_id,wherelost,whenlost,category,type]);
        console.log("item inserted in db successfully!");
        return item.rows[0];
    }
    catch(err){
        console.log(err);
        console.log("error in additemdb");
        return null;
    }
}

async function getallitemsdb(type, category) {
    try {
        let query = "SELECT * FROM items";
        let conditions = [];
        let values = [];

        if (type) {
            values.push(type);
            conditions.push(`type = $${values.length}`);
        }

        if (category) {
            values.push(category);
            conditions.push(`category = $${values.length}`);
        }
        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY created_at DESC";

        const result = await pool.query(query, values);
        return result.rows;

    } catch (err) {
        console.error("DB Error:", err);
        throw err;
    }
}
module.exports={
    getallitemsdb,additemdb
}