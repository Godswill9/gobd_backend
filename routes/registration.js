const express = require("express");
const { signup, login, verifyCode, editChatUserSeen } = require("../config/registration");
const { sendMessageMail, sendMessageMailToAdmin } = require("../controllers/logic");
const route = express.Router();

route.post("/signup", signup);

route.post("/login", login);

route.post("/sendReplyMail", sendMessageMail)

route.post("/sendReplyMailAdmin", sendMessageMailToAdmin)

route.post("/verifyCode", verifyCode);

route.put("/editChatUserSeen", editChatUserSeen);


module.exports = route;