const express = require('express')
const router = express.Router()
// 导入验证数据合法性的中间件
const expressJoi = require('@escook/express-joi')

// 导入 multer 和 path
const multer = require('multer')
const path = require('path')

// 创建 multer 的实例
/* const uploads = multer({ dest: path.join(__dirname, '../uploads') }) */
const uploads = multer({
	storage: multer.diskStorage({
	  destination: (req, file, cb) => {
		cb(null, 'uploads/avatar/') // 指定存储目录
	  },
	  filename: (req, file, cb) => {
		// 创建唯一文件名（防止重名覆盖）
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	  }
	})
  })

// 导入用户信息的处理函数模块
const userinfo_handler = require('../router_handler/userinfo')

const { update_avatar_schema } = require('../schema/user')

// 导入需要的验证规则对象
const {
	update_userinfo_schema,
	update_password_schema,
	get_author_schema,
} = require('../schema/user')

// console.log(update_userinfo_schema)

// 获取用户的基本信息
router.get('/userinfo', userinfo_handler.getUserInfo)

//获取作者基本信息
router.get(
	'/userinfo/:authorid',
	expressJoi(get_author_schema),
	userinfo_handler.getAuthorInfo,
)
// 更新用户的基本信息,这样服务端的信息就到expressJoi进行验证，只有验证成功后才能调用updateUserInfo处理函数
router.post(
	'/userinfo',
	expressJoi(update_userinfo_schema),
	userinfo_handler.updateUserInfo,
)

// 更新用户头像的路由
router.post(
	'/update/avatar',
	uploads.single('avatar'),
	userinfo_handler.updateAvatar,
)
module.exports = router