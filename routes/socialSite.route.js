const express=require("express");
const router=express.Router();
// const client=require("../mongoDB/MongoDB");
const client=require("../mongoDB/MongoDB");
const {verifyJWT,verifyAdmin}=require("../Authorization/Authorization");
const { ObjectId } = require("mongodb");


//post data to database

const socialBlogHistory = client.db('Crowd-funding').collection('Social-Post-Blog');


router.post('/addSocialPostBlog', async (req, res) => {
  const body = req.body;
  console.log(body);
  const result = await socialBlogHistory.insertOne(body);
  // res.send(result);
  if (result?.insertedId) {
    return res.status(200).send(result);
  } else {
    return res.status(404).send({
      message: "can not insert try again later",
      status: false,
    });
  }
})

//get all data from database
router.get('/allSocialPost', async (req, res) => {
  const cursor = socialBlogHistory.find().sort({ date: -1 });
  const result = await cursor.toArray();
  res.send(result);
})

//get single details data from all data
router.get('/allSocialPost/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await socialBlogHistory.findOne(query);
  res.send(result);
})


//my blogs added
router.get("/mySocialPost/:email", async (req, res) => {
  console.log(req.params.email);
  const result = await socialBlogHistory.find({ email: req.params.email }).toArray();
  res.send(result);
})

//update  single toy
router.get("/editPost/:id", async (req, res) => {
  const id = (req.params.id);
  const query = { _id: new ObjectId(id) }
  const result = await socialBlogHistory.findOne(query);
  res.send(result);
})


//delete the toy by selecting id
router.delete("/myPost/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await socialBlogHistory.deleteOne(query);
  res.send(result);
})


//put data in server
router.patch("/allPost/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  console.log(body);
  const filter = { _id: new ObjectId(id) };
  const option = { upsert: true }
  const updateDoc = {
    $set: {
      // date,email,blog,name
      title: body.title,
      name:body.name,
      date: body.date,
      email: body.email,
      blog: body.blog
    }
  };
  const result = await socialBlogHistory.updateOne(filter, updateDoc, option);
  res.send(result);
});


//search text
router.get('/searchText/:text', async (req, res) => {
  const text = req.params.text;
  const result = await socialBlogHistory
    .find({
      $or: [
        { title: { $regex: text, $options: "i" } },
      ],
    })
    .toArray();
  res.send(result);
});

module.exports=router;