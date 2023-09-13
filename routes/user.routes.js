const express=require("express");
const router=express.Router();
const client=require("../mongoDB/MongoDB");
const {verifyJWT,verifyAdmin}=require("../Authorization/Authorization");

const userCollection = client.db("Crowd-funding").collection("User");
router.post('/users', async (req, res) => {
  const user = req.body;
  // console.log(user);
  const query = { email: user.email };
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: 'already exists' });
  }
  const result = await userCollection.insertOne(user);
  res.send(result);
});
router.get('/users', async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
});

router.patch("/userAction/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const action = req.body;
  // console.log(action)
  const filter = { _id: new ObjectId(id) };
  const option = { upsert: true };
  const updateAction = {
    $set: {
      role: action.role,
    }
  };
  const result = await userCollection.updateOne(filter, updateAction, option);
  res.send(result);
});

router.get("/users/:name", async (req, res) => {
  const userName = req.params.name;
  try {
    const result = await userCollection.find({ name: { $regex: new RegExp(userName, 'i') } }).toArray();
    res.send(result);
  } catch {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data');
  }
});


module.exports=router;