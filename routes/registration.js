const express = require("express");
const { signup, login, verifyCode } = require("../config/registration");
const route = express.Router();

route.post("/signup", signup);

route.post("/login", login);

route.post("/verifyEmail", verifyCode);

module.exports = route;