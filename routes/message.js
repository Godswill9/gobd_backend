const express=require('express')
const route=express.Router()
const {sendMessage, fetchMessages,editMessageSeenByAdmin, editMessageSeenByUser, fetchAllMessages, sendMessageAdmin}=require("../controllers/logic")

route.post('/fetchMessages',fetchMessages)

route.post('/sendMessage', sendMessage)

route.post('/sendMessageAdmin', sendMessageAdmin)

route.get('/fetchAllMessages', fetchAllMessages)

route.put('/messageSeenAdmin', editMessageSeenByAdmin)

route.put('/messageSeenByUser', editMessageSeenByUser)

module.exports=route