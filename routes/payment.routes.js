const stripe = require('stripe')('sk_test_51NEmG3IxzytApYUlezdVCVvSiGKYTMPRcizhPcJbk70FNEUHtQQ4Zo6Oypdn7Jmpir3PLHlhMOx0zLRuvL0dzqhA00ZSSQyNYP');
const express=require("express");
const router=express.Router();
const client=require("../mongoDB/MongoDB");
// const { ObjectId } = require('mongodb');


router.post('/create-payment-intent', async (req, res) => {
  const { price } = req.body;
  const amount = price * 100;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

// const paymentHistory= client.db('toyBabyDB').collection('paymentHistory');
const paymentHistory = client.db('Crowd-funding').collection('Payment');
router.post("/saveAddress", async (req, res) => {
  const data = req.body;
  // console.log(data);
  const result = await paymentHistory.insertOne(data);
  res.send(result);

});

router.get("/paymentHistory", async (req, res) => {
  const result = await paymentHistory.find().toArray();
  res.send(result);
});

router.get("/paymentHistory/:name", async (req, res) => {
  const userName = req.params.name; // Corrected to use req.params.name
  try {
    const result = await paymentHistory.find({ name: { $regex: new RegExp(userName, 'i') } }).toArray();
    res.send(result);
  } catch {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data');
  }
});


router.get("/saveAddress/:id", async (req, res) => {
  const id = req.params.id;
  const result = await paymentHistory.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

router.patch('/payment/saveAddress/:id', async (req, res) => {
  const id = req.params.id;
  const paymentSuccess = req.body;
  const filter = { _id: new ObjectId(id) };
  const option = { upsert: true };
  const updateStudent = {
    $set: {
      transaction: paymentSuccess.transaction,
    }
  };
  const result = await paymentHistory.updateOne(filter, updateStudent, option);
  res.send(result);
});


router.get("/payment/:email", async (req, res) => {
  const email = req.params.email;
  // console.log(email)
  const result = await paymentHistory.find({ email: email }).toArray();
  res.send(result);
});

module.exports=router;