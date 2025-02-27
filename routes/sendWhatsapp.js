const express=require('express')
const route=express.Router()
const {sendWhatsappMessageToAdmin} = require("../controllers/logic")


route.post('/sendWhatsapp', (req, res)=>{
  sendWhatsappMessageToAdmin(req.body.message, req.body.sender, req.body.type)
});

  module.exports = route;