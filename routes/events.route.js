const express=require("express");
const router=express.Router();
const client=require("../mongoDB/MongoDB");
const {verifyJWT,verifyAdmin}=require("../Authorization/Authorization");

const eventHistory = client.db("Crowd-funding").collection("event");

router.get('/event', async (req, res) => {
  const result = await eventHistory.find().toArray();
  res.send(result);
});


router.post("/eventAdd", async (req, res) => {
  const data = req.body;
  const result = await eventHistory.insertOne(data);
  res.send(result);
});

router.get("/individualEvent/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await eventHistory.find({ email: email }).toArray();
  res.send(result);
});

// new
router.patch("/event/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const filter = { _id: new ObjectId(id) };
  const option = { upsert: true };
  const updateAction = {
    $set: {
      status: data.status,
    }
  };
  const result = await eventHistory.updateOne(filter, updateAction, option);
  res.send(result);
});

// new
router.get("/event/:id", async (req, res) => {
  const id = req.params.id;
  const result = await eventHistory.findOne({ _id: new ObjectId(id) });
  res.send(result);
});



module.exports=router;