require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const router=express.Router();
const client=require("../mongoDB/MongoDB");
const userCollection = client.db("Crowd-funding").collection("User");


router.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
    // console.log(user)
    res.send({ token });
  });
  
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
    });
  };

  const verifyAdmin = async (req, res, next) => {
    const email = req.decoded.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    if (user?.role !== 'admin') {
      return res.status(403).send({ error: true, message: 'forbidden message' });
    }
    next();
  };
  
  router.get('/users/admin/:email', verifyJWT, async (req, res) => {
    const email = req.params.email;
  
    if (req.decoded.email !== email) {
      res.send({ admin: false });
    }
  
    const query = { email: email };
    const user = await userCollection.findOne(query);
    const result = { admin: user?.role === 'admin' };
    res.send(result);
  });

  
  module.exports={verifyJWT,verifyAdmin,router};