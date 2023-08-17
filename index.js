require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const stripe=require('stripe')('sk_test_51NEmG3IxzytApYUlezdVCVvSiGKYTMPRcizhPcJbk70FNEUHtQQ4Zo6Oypdn7Jmpir3PLHlhMOx0zLRuvL0dzqhA00ZSSQyNYP')


const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.eeu0ppt.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {

  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const dbConnect = async () => {
  try {
    // client.connect();
    console.log(" Database Connected Successfully✅ ");

  } catch (error) {
    console.log(error.name, error.message);
  }
}
dbConnect()

///database connection
const infoHistory = client.db("Crowd-funding").collection("Info");

//get main api from here
app.get('/', (req, res) => {
  res.send('Lets Donate Money')
})
///start writing method from here .
//Please don't override the code .


//------------------------------------------payment start from here----------------------------------------------------------
 
const { ObjectId } = require('mongodb');


app.post('/create-payment-intent',async(req,res)=>{
  const {price}=req.body;
  const amount=price*100;
  const paymentIntent=await stripe.paymentIntents.create({
      amount:amount,
      currency:'usd',
      payment_method_types:['card']
  })
  res.send({
      clientSecret:paymentIntent.client_secret
  })
})

// const paymentHistory= client.db('toyBabyDB').collection('paymentHistory');
const paymentHistory= client.db('Crowd-funding').collection('Payment');
app.post("/saveAddress",async(req,res)=>{
    const data=req.body;
    console.log(data);
    const result=await paymentHistory.insertOne(data);
    res.send(result);

})

app.get("/saveAddress/:id",async(req,res)=>{
    const id=req.params.id;
    const result=await paymentHistory.findOne({ _id: new ObjectId(id) });
    res.send(result);
})

app.patch('/payment/saveAddress/:id',async(req,res)=>{
    const id=req.params.id;
    const paymentSuccess=req.body;
    const filter={_id: new ObjectId(id)}
    const option={upsert:true}
    const updateStudent={
      $set:{
        transaction:paymentSuccess.transaction,
      }
    }
    const result=await paymentHistory.updateOne(filter,updateStudent,option);
    res.send(result);
  })

//------------------------------------------payment end here----------------------------------------------------------

//start campaign part from here------------------------------------------
const campaignHistory = client.db("Crowd-funding").collection("campaign");
app.get("/campaigns", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 6;
  const skip = (page - 1) * perPage;

  const campaigns = await campaignHistory.find().skip(skip).limit(perPage).toArray();
  res.send(campaigns);
});






app.listen(port, () => {
  console.log(`Lets run the CROWD server site on port : ${port}`)
})