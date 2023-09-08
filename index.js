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
  const user = await userCollection.findOne(query);
  if (user?.role !== 'admin') {
    return res.status(403).send({ error: true, message: 'forbidden message' });
  }
  next();
}

app.get('/users/admin/:email', verifyJWT, verifyAdmin, async (req, res) => {
  const email = req.params.email;

  if (req.decoded.email !== email) {
    res.send({ admin: false })
  }

  const query = { email: email }
  const user = await userCollection.findOne(query);
  const result = { admin: user?.role === 'admin' }
  res.send(result);
})


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
  // console.log(data);
  const result = await paymentHistory.insertOne(data);
  res.send(result);

})

app.get("/paymentHistory", async (req, res) => {
  const result = await paymentHistory.find().toArray();
  res.send(result);
})

app.get("/paymentHistory/:name", async (req, res) => {
  const userName = req.params.name; // Corrected to use req.params.name
  try {
    const result = await paymentHistory.find({ name: { $regex: new RegExp(userName, 'i') } }).toArray();
    res.send(result);
  } catch {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data');
  }
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


app.get("/payment/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await paymentHistory.find({ email: email }).toArray();
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

app.get('/aCampaign', async (req, res) => {
  const result = await campaignHistory.find().toArray()
  res.send(result);
})


app.get("/campaigns/:id", async (req, res) => {
  const id = req.params.id;
  const result = await campaignHistory.findOne({ _id: new ObjectId(id) });
  res.send(result);
})

app.post("/campaignsAdd", async (req, res) => {
  const data = req.body;
  const result = await campaignHistory.insertOne(data);
  res.send(result);
})
// to get all campaigns
app.get("/campaignsAdd", async (req, res) => {
  const result = await campaignHistory.find().toArray()
  res.send(result)
})

// to delete from campaign notification
app.delete('/campaignsAdd/:id', async (req, res) => {
  const id = req.params.id
  const query = { _id: new ObjectId(id) };
  const result = await campaignHistory.deleteOne(query)
  res.send(result)
})


app.get("/individualCampaign/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await campaignHistory.find({ email: email }).toArray();
  res.send(result);
})
app.patch("/individualCampaign/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;

  const data = req.body;
  // console.log(action)
  const filter = { _id: new ObjectId(id) }
  const option = { upsert: true }
  const updateAction = {
    $set: {
      status: data.status,
    }
  }
  const result = await campaignHistory.updateOne(filter, updateAction, option);
  res.send(result);
})


//--------------------------------------------campaign stop here-------------------------------------------
//--------------------------------------------event section start--------------------------------------------------

const eventHistory = client.db("Crowd-funding").collection("event");

app.get('/event', async (req, res) => {
  const result = await eventHistory.find().toArray();
  res.send(result);
})


app.post("/eventAdd", async (req, res) => {
  const data = req.body;
  const result = await eventHistory.insertOne(data);
  res.send(result);
})

app.get("/individualEvent/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await eventHistory.find({ email: email }).toArray();
  res.send(result);
})








//--------------------------------------------event section end -------------------------------------------

//--------------------------------------------user section start-------------------------------------------
const userCollection = client.db("Crowd-funding").collection("User");

app.post('/users', async (req, res) => {
  const user = req.body;
  // console.log(user);
  const query = { email: user.email }
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: 'already exists' })
  }
  const result = await userCollection.insertOne(user);
  res.send(result);
})
app.get('/users', async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
})

app.patch("/userAction/:id", verifyJWT, verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const action = req.body;
  // console.log(action)
  const filter = { _id: new ObjectId(id) }
  const option = { upsert: true }
  const updateAction = {
    $set: {
      role: action.role,
    }
  }
  const result = await userCollection.updateOne(filter, updateAction, option);
  res.send(result);
})

app.get("/users/:name", async (req, res) => {
  const userName = req.params.name;
  try {
    const result = await userCollection.find({ name: { $regex: new RegExp(userName, 'i') } }).toArray();
    res.send(result);
  } catch {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data');
  }
});

//--------------------------------------------------user section end-----------------------------------------------



//------------------------------------------------blog section-------- digester start-----------------------------------------------
const Blogs = client.db("Crowd-funding").collection("Blog");





app.post("/blogAdd", async (req, res) => {
  const data = req.body;
  const result = await Blogs.insertOne(data);
  res.send(result);
})
app.get("/individualBLogs/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await Blogs.find({ email: email }).toArray();
  res.send(result);
})


app.post("/blogs", async (req, res) => {
  const blog = req.body;
  const result = await Blogs.insertOne(blog);
  res.send(result);
})

app.get("/blogs", async (req, res) => {
  const result = await Blogs.find().toArray();
  res.send(result);
})

app.get("/blogs/:id", async (req, res) => {
  const id = req.params.id;
  const result = await Blogs.findOne({ _id: new ObjectId(id) });
  res.send(result);
})

app.patch("/blogsUpdate/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const filter = { _id: new ObjectId(id) }
  const option = { upsert: true }
  const updateAction = {
    $set: {
      status: data.status,
    }
  }
  const result = await Blogs.updateOne(filter, updateAction, option);
  res.send(result);
})


app.get("/blogsSearch/:name", async (req, res) => {
  const userName = req.params.name; // Corrected to use req.params.name
  try {
    const result = await Blogs.find({ name: { $regex: new RegExp(userName, 'i') } }).toArray();
    res.send(result);
  } catch {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data');
  }

});


//------------------------------------------------blog section-------- digester end-----------------------------------------------
//----------------------------------comment start-------------------------------------------
const allComment = client.db("Crowd-funding").collection("Comments");

app.post('/addComment', async (req, res) => {
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
})
app.get("/allComments", async (req, res) => {
  const result = await allComment.find().toArray();
  res.send(result);
})
//----------------------------------comment end-------------------------------------------

app.listen(port, () => {
  console.log(`Lets run the CROWD server site on port : ${port}`)
})