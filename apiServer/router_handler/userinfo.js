// 导入数据库操作模块
const db = require('../db/index')
const path = require('path')
//导入处理密码的模块
const bcrypt = require('bcryptjs')


// 获取用户基本信息的处理函数
exports.getUserInfo = (req, res) => {
    // 优先从路由参数获取作者ID，若无则使用Token中的用户ID
    const userId = req.auth.id;
    
    const sql = `SELECT id, username, nickname, email, user_pic, bio FROM ev_user WHERE id=?`;
    
    db.query(sql, userId, (err, results) => {
        if (err) return res.cc(err);
        if (results.length !== 1) return res.cc('获取用户信息失败！');
        
        res.send({
            success: true,
            status: 0,
            message: '获取用户信息成功！',
            data: results[0],
        });
    });
};
// 获取文章作者基本信息的处理函数
exports.getAuthorInfo = (req, res) => {
    const sql = `SELECT id, username, nickname, email, user_pic, bio FROM ev_user WHERE id=?`;
    
    db.query(sql, req.params.authorid, (err, results) => {
        if (err) return res.cc(err);
        if (results.length !== 1) return res.cc('获取用户信息失败！');
        
        res.send({
            success: true,
            status: 0,
            message: '获取用户信息成功！',
            data: results[0],
        });
    });
};
// 更新用户基本信息的处理函数
exports.updateUserInfo = (req, res) => {
	console.log(req.body);
	const sql = `update ev_user set ? where id=?`;
	//判断用户id，限定修改权限
	
	if (req.auth.id !== req.body.id) return res.cc('用户id不一致')
    console.log("sdf",req.auth.id);
	db.query(sql, [req.body, req.body.id], (err, results) => {
        
		// console.log(req)
		// 执行 SQL 语句失败
		if (err) return res.cc(err)

		// 执行 SQL 语句成功，但影响行数不为 1
		if (results.affectedRows !== 1) return res.cc('修改用户基本信息失败！')

		// 修改用户信息成功
		return res.cc('修改用户基本信息成功！', 0)
	})
	// res.send('ok')
}
const fs = require('fs');
// 更新用户头像的处理函数
exports.updateAvatar = (req, res) => {
    // 1. 先查询旧头像路径
    const sqlGetOldAvatar = `SELECT user_pic FROM ev_user WHERE id = ?`;
    db.query(sqlGetOldAvatar, req.auth.id, (err, selectResults) => {
        if (err) return res.cc(err);
        if (selectResults.length !== 1) return res.cc('用户不存在！');

        const oldAvatarPath = selectResults[0].user_pic; // 原头像路径，例如: /uploads/avatar/old.jpg
        const newAvatarPath = path.join('/uploads/avatar', req.file.filename); // 新头像路径

        // 2. 更新数据库中的头像路径
        const sqlUpdate = `UPDATE ev_user SET user_pic = ? WHERE id = ?`;
        
        db.query(sqlUpdate, [newAvatarPath, req.auth.id], (err, updateResults) => {
            if (err) return res.cc(err);
            if (updateResults.affectedRows !== 1) return res.cc('更新头像失败！');

            // 3. 删除旧头像文件（仅在数据库更新成功后执行）
            if (oldAvatarPath) {
                // 构造完整的旧头像物理路径
                const fullOldPath = path.join(
                    __dirname, 
                    '../uploads/avatar', 
                    path.basename(oldAvatarPath)
                );

                // 异步删除文件（避免阻塞主流程）
                fs.unlink(fullOldPath, (err) => {
                    if (err) {
                        console.error('旧头像删除失败:', err);
                    } else {
                        console.log('旧头像已清理:', fullOldPath);
                    }
                });
            }

            // 4. 响应客户端
            res.cc('更新头像成功！', 0);
        });
    });
};
