// 文章的路由模块

const express = require('express')
const router = express.Router()
const fs = require("fs");
// 导入需要的处理函数模块
const article_handler = require('../router_handler/article')

// 导入 multer 和 path
const multer = require('multer')
const path = require('path')

// 创建 multer 的实例
/* const uploads = multer({ dest: path.join(__dirname, '../uploads') }) */
const uploads = multer({
	storage: multer.diskStorage({
	  destination: (req, file, cb) => {
		cb(null, 'uploads/') // 指定存储目录
	  },
	  filename: (req, file, cb) => {
		// 创建唯一文件名（防止重名覆盖）
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	  }
	})
  })
// 导入验证数据的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要的验证规则对象
const {
	add_article_schema,
	add_comment_schema,
	get_articleById_schema,
	get_CommenteById_schema,
	delete_schema,
	update_article_schema,
} = require('../schema/article')

// 发布文章的路由
router.post('/add',
	uploads.single('cover_img'),
	expressJoi(add_article_schema),
	article_handler.addArticle 
)

// 获取文章的列表数据
router.get('/list', article_handler.getArticle)

// 根据用户id获取文章的列表数据
router.get('/listUID', article_handler.getArticleUID)

// 根据作者id获取文章的列表数据
router.get('/listAID/:authorid', article_handler.getArticleAID)

//根据Id查询文章
router.get(
	'/:Id',
	expressJoi(get_articleById_schema),
	article_handler.getArticleById
)


//发布评论
router.post('/addComment',
	expressJoi(add_comment_schema),
	article_handler.addComment 
)

// 根据文章id获取评论的列表数据
router.post('/listComment', 
	expressJoi(get_CommenteById_schema),
	article_handler.getComment
  )

//根据ID删除文章的路由
router.get('/delete/:Id', expressJoi(delete_schema), article_handler.deleteById)
//更新文章的路由
router.post(
	'/edit',
	uploads.single('cover_img'),
	expressJoi(update_article_schema),
	article_handler.editArticle
) 
module.exports = router
