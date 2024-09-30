const express = require("express");
const route = express.Router();
const initializePayment = require("../controllers/paymentController"); // import the controller


route.post("/acceptpayment", initializePayment.acceptPayment);

route.get("/confirmPayment/:ref", initializePayment.checkPayment);

route.post("/savePayment", initializePayment.savePayment);

module.exports = route;