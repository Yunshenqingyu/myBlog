// 导入定义验证规则的模块
const joi = require('joi')

// 定义 标题、分类Id、内容、发布状态 的验证规则
const title = joi.string().required()
// const cate_id = joi.number().integer().min(1).required()
const content = joi.string().required().allow('')
const state = joi.string().valid('已发布', '草稿').required()
const cate_id = joi.string().required()
const article_id = joi.number().integer().min(1).required();
// 验证规则对象 - 发布文章
exports.add_article_schema = {
	body: {
		title,
		content,
	},
}

// 验证规则对象 - 发布评论
exports.add_comment_schema = {
	body: {
		article_id,
		content,
	},
}

// 定义 文章Id 的校验规则
const Id = joi.number().integer().min(1).required()
// 校验规则对象 - 根据 id 获取文章
exports.get_articleById_schema = {
	params: {
		Id,
	},
}

const article_Id = joi.number().integer().min(1).required()
// 校验规则对象 - 根据文章ID获取评论
exports.get_CommenteById_schema = {
  query: {
    article_Id,
  },
}

// 校验规则对象 - 删除文章
exports.delete_schema = {
	params: {
		Id,
	},
}

// 校验规则对象 — 更新文章
exports.update_article_schema = {
	body: {
		Id,
		title,
		content,
	},
}
