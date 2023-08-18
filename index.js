require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const stripe = require('stripe')('sk_test_51NEmG3IxzytApYUlezdVCVvSiGKYTMPRcizhPcJbk70FNEUHtQQ4Zo6Oypdn7Jmpir3PLHlhMOx0zLRuvL0dzqhA00ZSSQyNYP')


const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://toyBabyDB:bgVpBFmLqRHfeWFa@cluster11.cpm08j1.mongodb.net/?retryWrites=true&w=majority";

// const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.eeu0ppt.mongodb.net/?retryWrites=true&w=majority`;
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
    client.connect();
    console.log(" Database Connected Successfully✅ ");

  } catch (error) {
    console.log(error.name, error.message);
  }
}
dbConnect()

//------------------------------------------------------------jwt token start-------------------------------------------

app.post('/jwt', (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
  console.log(user)
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

//------------------------------------------------------------jwt token end-------------------------------------------


///database connection
const toyCollection = client.db("Info").collection("Crowd-funding");















//get main api from here
app.get('/', (req, res) => {
  res.send('Lets Donate Money')
})
///start writing method from here .
//Please don't override the code .


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

const paymentHistory = client.db('toyBabyDB').collection('paymentHistory');
// const paymentHistory= client.db('Payment').collection('Crowd-funding');
app.post("/saveAddress", async (req, res) => {
  const data = req.body;
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










app.listen(port, () => {
  console.log(`Lets run the CROWD server site on port : ${port}`)
})