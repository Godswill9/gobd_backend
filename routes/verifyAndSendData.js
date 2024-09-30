const express = require("express");
const {
  authenticateUserAndSendData,
} = require("../config/verifyUserAndSendData");
const route = express.Router();

route.get("/verifyAUser", authenticateUserAndSendData);

module.exports = route;