const express=require("express");
const cors = require('cors');
const app=express();
app.use(cors());
require('dotenv').config();
app.use(express.json());
const client=require("./mongoDB/MongoDB");
const userRouter=require("./routes/user.routes");
const paymentRouter=require("./routes/payment.routes");
const allCommentRouter=require("./routes/user.routes");
const blogsRouter=require("./routes/blogs.route");
const campaignRouter=require("./routes/campaign.route");
const eventRouter=require("./routes/events.route");
async function run() {
    try {
        app.use(userRouter);
        app.use(paymentRouter);
        app.use(allCommentRouter);
        app.use(blogsRouter);
        app.use(campaignRouter);
        app.use(eventRouter);
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
  }
  run().catch(console.dir);
app.get("/",(req,res)=>{
    res.send("<h1>server site is running</h1>")
})
app.use((req,res)=>{
    res.status(404).json({
        message:"route not found",
    })

})
app.use((err,req,res,next)=>{
    res.status(500).json({
        message:"server internal issue",
    })
})
module.exports=app;