// 文章的处理函数模块
const path = require('path')
const db = require('../db/index')
// 发布文章的处理函数
exports.addArticle = (req, res) => {
	// console.log(req.file)

	if (!req.file || req.file.fieldname !== 'cover_img')
		return res.cc('文章封面是必选参数！')

	// TODO：证明数据都是合法的，可以进行后续业务逻辑的处理
	// 处理文章的信息对象
	const articleInfo = {
		// 标题、内容
		...req.body,
		// 文章封面的存放路径
		cover_img: path.join('/uploads', req.file.filename),
		// 文章的发布时间
		pub_date: new Date(),
		// 文章作者的Id
		author_id: req.auth.id,
	}

	const sql = `insert into ev_articles set ?`
	db.query(sql, articleInfo, (err, results) => {
		if (err) return res.cc(err)
		if (results.affectedRows !== 1) return res.cc('发布新文章失败！')
		res.cc('发布文章成功！', 0)
	}) 
}
//发布评论的处理函数
exports.addComment = (req, res) => {
	// TODO：证明数据都是合法的，可以进行后续业务逻辑的处理
	// 处理文章的信息对象
	console.log(req.body);
	const CommentInfo = {
		// 文章id，内容
		...req.body,
		// 评论的发布时间
		pub_date: new Date(),
		// 评论者的Id
		user_id: req.auth.id,
	}
	const sql = `insert into comments set ?`
	db.query(sql, CommentInfo, (err, results) => {
		if (err) return res.cc(err)
		if (results.affectedRows !== 1) return res.cc('发布新评论失败！')
		res.cc('发布评论成功！', 0)
	}) 
}

//文章列表显示处理函数
exports.getArticle = (req, res) => {
	// const sql = 'select * from ev_articles where is_delete=0 order by id asc'
	const sql = `select aleft.Id as 'Id',
    aleft.title as 'title',
	aleft.cover_img as 'cover_img',
    aleft.content as 'content',
    aleft.pub_date as 'pub_date',
	ev_user.nickname as 'nickname',
	ev_user.user_pic as 'avatar'
	from ev_articles as aleft join ev_user on aleft.author_id = ev_user.id
	where aleft.is_delete = 0
	order by aleft.id desc`
	db.query(sql, (err, results) => {
		if (err) return res.cc(err)
		res.send({
			status: 0,
			message: '获取文章列表成功！',
			data: results,
		})
	})
}

//根据Id查询文章的处理函数
exports.getArticleById = (req, res) => {
	const sql = `select aleft.Id as 'Id',
    aleft.title as 'title',
	aleft.cover_img as 'cover_img',
    aleft.content as 'content',
    aleft.pub_date as 'pub_date',
	ev_user.id as 'user_id',
	ev_user.nickname as 'nickname',
	ev_user.user_pic as 'avatar'
	from ev_articles as aleft join ev_user on aleft.author_id = ev_user.id where aleft.Id=? and aleft.is_delete = 0`
	db.query(sql, req.params.Id, (err, results) => {
		// 执行 SQL 语句失败
		if (err) return res.cc(err)
		// SQL 语句执行成功，但是没有查询到任何数据
		if (results.length !== 1) return res.cc('获取文章数据失败！')
		// 把数据响应给客户端
		res.send({
			success: true,
			status: 0,
			message: '获取文章数据成功！',
			data: results[0],
		})
	})
}

//根据用户id查询文章列表的处理函数
exports.getArticleUID = (req, res) => {
	const sql = `
	select aleft.Id as 'Id',
    aleft.title as 'title',
	aleft.cover_img as 'cover_img',
    aleft.content as 'content',
    aleft.pub_date as 'pub_date',
	ev_user.nickname as 'nickname',
	ev_user.user_pic as 'avatar'
	from ev_articles as aleft join ev_user on aleft.author_id = ev_user.id where ev_user.id=? and aleft.is_delete = 0 order by aleft.id desc` ;
	db.query(sql, req.auth.id, (err, results) => {
	  // 执行 SQL 语句失败
	  if (err) return res.cc(err)
	  // 把数据响应给客户端
	  res.send({
		success: true,
		status: 0,
		message: '获取文章数据成功！',
		data: results, // 返回所有文章
	  })
	})
  }

  //根据作者id查询文章列表的处理函数
exports.getArticleAID = (req, res) => {
	const sql = `
	select aleft.Id as 'Id',
    aleft.title as 'title',
	aleft.cover_img as 'cover_img',
    aleft.content as 'content',
    aleft.pub_date as 'pub_date',
	ev_user.nickname as 'nickname',
	ev_user.user_pic as 'avatar'
	from ev_articles as aleft join ev_user on aleft.author_id = ev_user.id where aleft.author_id = ?  and aleft.is_delete = 0 order by aleft.id desc` ;
	db.query(sql, req.params.authorid, (err, results) => {
	  // 执行 SQL 语句失败
	  if (err) return res.cc(err)
	  // 把数据响应给客户端
	  res.send({
		success: true,
		status: 0,
		message: '获取文章数据成功！',
		data: results, // 返回所有文章
	  })
	})
  }

//根据Id查询评论的处理函数
exports.getComment = (req, res) => {
	console.log("ok");
	const sql = `
	  SELECT 
		aleft.id as 'Id',
		aleft.content as 'content',
		aleft.article_id as 'article_id',
		aleft.pub_date as 'pub_date',
		aleft.user_id as 'user_id',
		ev_user.nickname as 'nickname',
		ev_user.user_pic as 'avatar'
	  from comments as aleft 
	  join ev_user on aleft.user_id = ev_user.id
	  where aleft.article_id = ?
	  order by aleft.id DESC
	`;
	db.query(sql, req.body.article_Id, (err, results) => {
	  // 执行 SQL 语句失败
	  if (err) return res.cc(err)
	  // 把数据响应给客户端
	  res.send({
		success: true,
		status: 0,
		message: '获取评论数据成功！',
		data: results, // 返回所有评论
	  })
	})
  }
  


// 删除文章的处理函数
exports.deleteById = (req, res) => {
	const sql = `update ev_articles set is_delete=1 where Id=?`
	db.query(sql, req.params.Id, (err, results) => {
		// 执行 SQL 语句失败
		if (err) return res.cc(err)
		// SQL 语句执行成功，但是影响行数不等于 1
		if (results.affectedRows !== 1) return res.cc('删除文章失败！')
		// 删除文章分类成功
		res.cc('删除文章成功！', 0)
	})
}


const fs = require('fs');
// 更新文章的处理函数
exports.editArticle = (req, res) => {
    // 1. 先查询文章是否存在标题冲突
    const sqlCheckTitle = `SELECT * FROM ev_articles WHERE Id != ? AND title = ?`;
    db.query(sqlCheckTitle, [req.body.Id, req.body.title], (err, results) => {
        if (err) return res.cc(err);
        /* if (results.length > 0) {
            return res.cc('文章标题不能重复！');
        } */

        // 2. 获取原封面图片路径
        const sqlGetOldCover = `SELECT cover_img FROM ev_articles WHERE Id = ?`;
        db.query(sqlGetOldCover, req.body.Id, (err, results) => {
            if (err) return res.cc(err);
            if (results.length !== 1) return res.cc('文章不存在！');
            
            const oldCoverPath = results[0].cover_img; // 原封面路径，例如: /uploads/filename.jpg
            let newCoverPath = oldCoverPath; // 默认保留原封面

            // 如果有新封面上传，更新封面路径并删除旧封面
            if (req.file && req.file.fieldname === 'cover_img') {

                // 生成新封面路径
                newCoverPath = path.join('/uploads', req.file.filename);

                // 删除旧封面文件
                if (oldCoverPath) {
                    const fullOldPath = path.join(
                        __dirname, 
                        '../uploads', 
                        path.basename(oldCoverPath) // 提取文件名
                    );

                    // 异步删除旧文件（不阻塞主流程）
                    fs.unlink(fullOldPath, (err) => {
                        if (err) console.error('删除旧封面失败:', err);
                    });
                }
            }

            // 4. 更新文章数据
            const articleInfo = {
                ...req.body,
                cover_img: newCoverPath, // 使用新封面路径或保留原路径
            };

            const sqlUpdate = `UPDATE ev_articles SET ? WHERE Id = ?`;
            db.query(sqlUpdate, [articleInfo, req.body.Id], (err, results) => {
                if (err) return res.cc(err);
                if (results.affectedRows !== 1) return res.cc('编辑文章失败！');
                res.cc('编辑文章成功！', 0);
            });
        });
    });
};