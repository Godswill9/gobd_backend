const express = require("express");
const { updateUser } = require("../controllers/registration");
const route = express.Router();

route.post("/updateUser/:email", updateUser);

module.exports = route;