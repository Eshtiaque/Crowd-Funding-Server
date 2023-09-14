const express=require("express");
const router=express.Router();
const client=require("../mongoDB/MongoDB");
const { ObjectId } = require("bson");
const {verifyJWT,verifyAdmin}=require("../Authorization/Authorization");

const campaignHistory = client.db("Crowd-funding").collection("campaign");
router.get("/campaigns", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 6;
  const skip = (page - 1) * perPage;

  const campaigns = await campaignHistory.find().skip(skip).limit(perPage).toArray();
  res.send(campaigns);
});

router.get('/aCampaign', async (req, res) => {

  const result = await campaignHistory.find().toArray()

  res.send(result);
});


router.get("/campaigns/:id", async (req, res) => {
  const id = req.params.id;
  const result = await campaignHistory.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

router.post("/campaignsAdd", async (req, res) => {
  const data = req.body;
  const result = await campaignHistory.insertOne(data);
  res.send(result);
})
// to get all campaigns
router.get("/campaignsAdd", async (req, res) => {
  const result = await campaignHistory.find().toArray()
  res.send(result)
})

// to delete from campaign notification
router.delete('/campaignsAdd/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) };
  const result = await campaignHistory.deleteOne(query)
  res.send(result)
})




router.get("/individualCampaign/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await campaignHistory.find({ email: email }).toArray();
  res.send(result);

})


// new
router.patch("/individualCampaign/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;

  const data = req.body;
  // console.log(action)
  const filter = { _id: new ObjectId(id) };
  const option = { upsert: true };
  const updateAction = {
    $set: {
      status: data.status,
    }
  };
  const result = await campaignHistory.updateOne(filter, updateAction, option);
  res.send(result);
});


module.exports=router;