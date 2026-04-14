const express=require('express');
const itemRouter=express();
const {upload}=require('./middlewares/multermiddleware.js')
const {itemvalidator}=require('./middlewares/validation.js');
const {authorize}=require('./middlewares/authmiddleware.js');
const {check}=require('./middlewares/check_acts.js');
const {uploaditem,getallitems}=require('./item.js');
const {found,claim,claim2}=require('./claimfound.js');

itemRouter.get('/items',getallitems);
itemRouter.get('/search?q=wallet&location=mumbai')
itemRouter.get('/claims/:userId',)
itemRouter.post('/',upload.single("image"),itemvalidator,authorize,check,uploaditem)
itemRouter.post('/foundit/:item',authorize,check,found);
itemRouter.post('/claimit/:item',authorize,check,claim);
itemRouter.post('/claim',authorize,check,claim2);
itemRouter.put('/claims/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const result = await pool.query(
      "UPDATE claims SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id]
    );

    // ✅ If approved → update item status
    if (status === 'approved') {
      await pool.query(
        "UPDATE items SET status = 'claimed' WHERE id = (SELECT item_id FROM claims WHERE id = $1)",
        [req.params.id]
      );
    }

    res.json({
      success: true,
      message: `Claim ${status}`,
      claim: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

itemRouter.get('/claims/item/:itemId', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM claims WHERE item_id = $1",
      [req.params.itemId]
    );

    res.json({
      success: true,
      claims: result.rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports={itemRouter}