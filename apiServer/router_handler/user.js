//导入数据库操作模块
const db = require('../db/index');
//bcryptjs
const bcrypt = require('bcryptjs');
//导入生成token
const jwt = require('jsonwebtoken');
const config = require('../config');

// 注册
exports.regUser = (req, res) => {
    const userinfo = req.body;
    
    // 查询用户名是否被占用
    const sqlStr = 'select * from ev_user where username=?';
    db.query(sqlStr, userinfo.username, (err, results) => {
      if (err) {
        return res.cc(err.message);
      }
      if (results.length > 0) {
        return res.cc('用户名被占用，请更换其他用户名');
      }
      //邮箱验证
      if (!userinfo.email) {
        return res.cc('邮箱不能为空');
      }
      // 对密码进行加密处理
      userinfo.password = bcrypt.hashSync(userinfo.password, 10);
  
      // 插入新用户
      const sql = 'insert into ev_user set ?';
      db.query(sql, { 
        username: userinfo.username, 
        password: userinfo.password,
        email: userinfo.email, 
     }, (err, results) => {
        if (err) return res.cc(err);
        if (results.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试');
        // 注册成功
        return res.cc('注册成功', 0);
      });
    });
  };

//登录
exports.login = (req, res) => {
    const userinfo = req.body;
    const sql = 'select * from ev_user where email=?'; // 修改查询条件为 email
    db.query(sql, userinfo.email, (err, results) => {
        if (err) return res.cc(err);
        if (results.length !== 1) return res.cc('登录失败');
        // 判断密码是否正确
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password);
        if (!compareResult) return res.cc('登录失败');

        const user = { ...results[0], password: '', avatar: '' };
        // 对用户信息加密
        const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn });
        res.send({
            status: 0,
            message: '登录成功',
            token: 'Bearer ' + tokenStr,
            
        });
    });
};