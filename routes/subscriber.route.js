const express = require("express");
const router = express.Router();
require('dotenv').config();
const client = require("../mongoDB/MongoDB");
const nodemailer = require("nodemailer");
const mg = require('nodemailer-mailgun-transport')
const subscriberCollection = client.db('Crowd-funding').collection('subscribers');


const auth = {
    auth: {
        api_key: process.env.EMAIL_PRIVATE_KEY,
        domain: process.env.EMAIL_DOMAIN
    }
}

const transporter = nodemailer.createTransport(mg(auth));

const sendEmailToUser = subscribers => {
    transporter.sendMail({
        from: "mahdi.webx@gmail.com", // verified sender email
        to: "mahdi.webx@gmail.com", // recipient email
        subject: "Thank you for subscribe us", // Subject line
        text: "Hello world!", // plain text body
        html: `
        <h2>Thank you for subscribing</h2>
        <p> 
        We got your this email address: ${subscribers.email}. 
        We will send you a notification whenever we have a new event.
        </p>
        `, // html body
    }, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}
// for nothing 
router.post('/subscribers', async (req, res) => {
    const data = req.body
    console.log(data);
    const result = await subscriberCollection.insertOne(data)
    res.send(result)

    sendEmailToUser(data)
})

module.exports = router;



