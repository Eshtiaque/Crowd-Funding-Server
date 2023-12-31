const express=require("express");
const router=express.Router();
const client=require("../mongoDB/MongoDB");
const {verifyJWT,verifyAdmin}=require("../Authorization/Authorization");
const { ObjectId } = require("bson");


const Blogs = client.db("Crowd-funding").collection("Project");

router.post("/blogAdd", async (req, res) => {
  const data = req.body;
  const result = await Blogs.insertOne(data);
  res.send(result);
});
router.get("/individualBLogs/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await Blogs.find({ email: email }).toArray();
  res.send(result);
});


router.post("/blogs", async (req, res) => {
  const blog = req.body;
  const result = await Blogs.insertOne(blog);
  res.send(result);
});

router.get("/blogs", async (req, res) => {
  const result = await Blogs.find().toArray();
  res.send(result);
});

router.get("/blogs/:id", async (req, res) => {
  // const id = req.params.id;
  // const result = await Blogs.findOne({ _id: new ObjectId(id) });
  // res.send(result);

  const id = req.params.id;

if (!ObjectId.isValid(id)) {
  return res.status(400).send('Invalid id format');
}

const result = await Blogs.findOne({ _id: new ObjectId(id) });
res.send(result);

});

router.patch("/blogsUpdate/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const filter = { _id: new ObjectId(id) };
  const option = { upsert: true };
  const updateAction = {
    $set: {
      status: data.status,
    }
  };
  const result = await Blogs.updateOne(filter, updateAction, option);
  res.send(result);
});
router.get("/blogsSearch/:name", async (req, res) => {
  const userName = req.params.name; // Corrected to use req.params.name
  try {
    const result = await Blogs.find({ name: { $regex: new RegExp(userName, 'i') } }).toArray();
    res.send(result);
  } catch {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data');
  }

});

router.delete("/individualBlog/delete/:id",async(req,res)=>{
  const id=req.params.id;
  const query={_id: new ObjectId(id)};
  const result= await Blogs.deleteOne(query);
  res.status(200).send(result);
})



module.exports=router;