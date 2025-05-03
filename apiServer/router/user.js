const express = require('express');
const router = express.Router();

//导入处理函数
const user_handler = require('../router_handler/user');

//导入验证数据中间件
const expressjoi = require('@escook/express-joi');
const {reg_register_schema} = require('../schema/user');
const {reg_login_schema} = require('../schema/user');

//注册
router.post('/reguser',expressjoi(reg_register_schema),user_handler.regUser);

//登录
router.post('/login',expressjoi(reg_login_schema),user_handler.login);

module.exports=router;