const express=require('express')
const route=express.Router()
const {findUser, findUsers}=require("../controllers/logic")

route.post('/user', findUser)

route.get('/users', findUsers)

module.exports=route