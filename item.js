// deals with uploading lost or found items on the app.
const cloudinary = require("./middlewares/cloudinary");
const streamifier = require("streamifier");
const jwt=require('jsonwebtoken');
const {additemdb,getallitemsdb,getItemsCount}=require('./db/item_queries.js')
const {pool}=require("./db/queries.js");

async function uploaditem(req,res){
    if(!req.file){
        return res.status(400).json({
            message:"no file attatched"
        });
    }
    if(!req.file.mimetype.startsWith('image/')){
        return res.status(400).json({
            message:"only image files allowed!"
        })
    }
    //obtaining item info from form
    let {name,description,whenlost,location,status,category,type}=req.body;
    let id=req.user.id;
    
    
    try{
        function uploadFromBuffer(){
        return new Promise((resolve,reject)=>{
            let stream=cloudinary.uploader.upload_stream({
                folder:"items",
                resource_type:"image"
            },
            (error,result)=>{
                if(result) resolve(result);
                else reject(error)
            });
            streamifier.createReadStream(req.file.buffer).pipe(stream)
        });
        
    }
    const result=await uploadFromBuffer();
    console.log(result.secure_url,result.public_id)

    //perform db request
    //(name,description,image_url,finder_id,owner_id,wherelost,whenlost)
    let resu;
    if(type=='lost'){
        console.log("the type was lost\n");
        resu=await additemdb(name,description,result.secure_url,null,id,location,whenlost,category,type);
    }
    else{
        console.log("The type was not lost. It was:",type,"\n");
        resu=await additemdb(name,description,result.secure_url,id,null,location,whenlost,category,type);
    }
    req.user.acts_today+=1;
    return res.status(200).json({
        message:"uploading item successful",
        url: result.secure_url,
        public_id: result.public_id,
        dbresult:resu
    });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: "Image upload failed" });
    }
}

async function getallitems(req, res) {
try {
    console.log("getallitems function entered\n");
    const { type, category, q } = req.query;

    const page = parseInt(req.query.page) || 1;

    // ✅ LIMIT PROTECTION (IMPORTANT)
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const offset = (page - 1) * limit;

    const items = await getallitemsdb(type, category, limit, offset, q);

    // ✅ NEW: total count
    const total = await getItemsCount(type, category, q);

    res.json({
      success: true,
      page,
      total,
      totalPages: Math.ceil(total / limit),
      items
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
const getUserClaims = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      "SELECT * FROM claims WHERE user_id = $1",
      [userId]
    );

    return res.status(200).json({
      success: true,
      claims: result.rows
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

const searchItems = async (req, res) => {
  try {
    const { q, location } = req.query;

    let query = "SELECT * FROM items WHERE 1=1";
    let values = [];
    let index = 1;

    if (q) {
      query += ` AND (name ILIKE $${index} OR description ILIKE $${index})`;
      values.push(`%${q}%`);
      index++;
    }

    if (location) {
      query += ` AND location ILIKE $${index}`;
      values.push(`%${location}%`);
      index++;
    }

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      items: result.rows
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};
module.exports={uploaditem,getallitems,getUserClaims,searchItems}