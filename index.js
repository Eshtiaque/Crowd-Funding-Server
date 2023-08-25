require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const stripe = require('stripe')('sk_test_51NEmG3IxzytApYUlezdVCVvSiGKYTMPRcizhPcJbk70FNEUHtQQ4Zo6Oypdn7Jmpir3PLHlhMOx0zLRuvL0dzqhA00ZSSQyNYP')


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
// const infoHistory = client.db("Crowd-funding").collection("Info");

//get main api from here
app.get('/', (req, res) => {
  res.send('Lets Donate Money')
})
///start writing method from here .
//Please don't override the code .
//----------------------------------------jwt start -------------------------------------------------------------------------

app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
  // console.log(user)
  res.send({ token });
})

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  // console.log(authorization)
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
    if (error) {
      return res.status(403).send({ error: true, message: 'unauthorized access' });
    }
    req.decoded = decoded;
    next();
  })
}


//----------------------------------------jwt end -------------------------------------------------------------------------





//----------------------------------------------Admin Verify implementation start ------------------------------------------

const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email: email }
  const user = await usersCollection.findOne(query);
  if (user?.role !== 'admin') {
    return res.status(403).send({ error: true, message: 'forbidden message' });
  }
  next();
}


//----------------------------------------------Admin Verify implementation end ------------------------------------------

//------------------------------------------payment start from here----------------------------------------------------------

const { ObjectId } = require('mongodb');


app.post('/create-payment-intent', async (req, res) => {
  const { price } = req.body;
  const amount = price * 100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  })
  res.send({
    clientSecret: paymentIntent.client_secret
  })
})

// const paymentHistory= client.db('toyBabyDB').collection('paymentHistory');
const paymentHistory = client.db('Crowd-funding').collection('Payment');
app.post("/saveAddress", async (req, res) => {
  const data = req.body;
  console.log(data);
  const result = await paymentHistory.insertOne(data);
  res.send(result);

})

app.get("/saveAddress/:id", async (req, res) => {
  const id = req.params.id;
  const result = await paymentHistory.findOne({ _id: new ObjectId(id) });
  res.send(result);
})

app.patch('/payment/saveAddress/:id', async (req, res) => {
  const id = req.params.id;
  const paymentSuccess = req.body;
  const filter = { _id: new ObjectId(id) }
  const option = { upsert: true }
  const updateStudent = {
    $set: {
      transaction: paymentSuccess.transaction,
    }
  }
  const result = await paymentHistory.updateOne(filter, updateStudent, option);
  res.send(result);
})

//------------------------------------------payment end here----------------------------------------------------------

//----------------------------------------start campaign part from here------------------------------------------
const campaignHistory = client.db("Crowd-funding").collection("campaign");
app.get("/campaigns", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 6;
  const skip = (page - 1) * perPage;

  const campaigns = await campaignHistory.find().skip(skip).limit(perPage).toArray();
  res.send(campaigns);
});
//--------------------------------------------campaign stop here-------------------------------------------
//--------------------------------------------event section start--------------------------------------------------

const eventHistory = client.db("Crowd-funding").collection("event");

app.get('/event', async (req, res) => {
  const result = await userHistory.find().toArray();
  res.send(result);
})
//--------------------------------------------event section end -------------------------------------------

//--------------------------------------------user section start-------------------------------------------
const userCollection = client.db("Crowd-funding").collection("User");

app.post('/users', async (req, res) => {
  const user = req.body;
  console.log(user);
  const query ={email : user.email}
  const existingUser =await userCollection.findOne(query);
  if(existingUser){
    return res.send({message:'already exists'})
  }
  const result = await userCollection.insertOne(user);
  res.send(result);
})
app.get('/users', async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
})
//--------------------------------------------------user section end-----------------------------------------------



//------------------------------------------------blog section-------- digester start-----------------------------------------------
const Blogs=client.db("Crowd-funding").collection("Blog");


app.post("/blogs",async(req,res)=>{
  const blog = req.body;
  const result = await Blogs.insertOne(blog);
  res.send(result);
})

app.get("/blogs",async(req,res)=>{
  const result=await Blogs.find().toArray();
  res.send(result);
})

app.get("/blogs/:id",async(req,res)=>{
  const id=req.params.id;
  const result = await Blogs.findOne({ _id: new ObjectId(id) });
  res.send(result);
})

app.patch("/blogsUpdate/:id",async(req,res)=>{
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) }
  const option = { upsert: true }
  const updateAction = {
    $set: {
      status: "approved",
    }
  }
  const result = await Blogs.updateOne(filter, updateAction, option);
  res.send(result);
})

//------------------------------------------------blog section-------- digester end-----------------------------------------------

app.listen(port, () => {
  console.log(`Lets run the CROWD server site on port : ${port}`)
})