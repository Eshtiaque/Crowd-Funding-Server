const express=require("express");
const router=express.Router();
const client=require("../mongoDB/MongoDB");
const {verifyJWT,verifyAdmin}=require("../Authorization/Authorization");
const { ObjectId } = require("bson");

const allComment = client.db("Crowd-funding").collection("Comments");

router.post('/addComment', async (req, res) => {
  const body = req.body;
  console.log(body);
  const result = await allComment.insertOne(body);
  // res.send(result);
  if (result?.insertedId) {
    return res.status(200).send(result);
  } else {
    return res.status(404).send({
      message: "can not insert try again later",
      status: false,
    });
  }
});
router.get("/allComments", async (req, res) => {
  const result = await allComment.find().toArray();
  res.send(result);
});

//delete the toy by selecting id
router.delete("/deleteComments/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await allComment.deleteOne(query);
  res.send(result);
})




module.exports=router;