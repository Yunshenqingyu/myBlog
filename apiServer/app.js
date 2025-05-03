const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const joi =require('joi');
const app = express();
const port = 3000;//端口号

const fs = require('fs')

const uploadDir = 'uploads/'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
// 中间件
app.use(cors());

app.use('/uploads', express.static('uploads'))
//配置解析表单数据的中间件
app.use(express.urlencoded({ extended: false }))

// 通过 express.json() 这个中间件，解析表单中的 JSON 格式的数据
app.use(express.json())

//为了验证码能通过，则需要导入session组件
const session = require('express-session')
// 配置session中间件
app.use(
    session({
        secret: 'keyboard cat', //服务端生成申明可随意写
        resave: true, //强制保存session即使他没有什么变化
        saveUninitialized: true, //强制将来初始化的session存储
    })
)

app.use(express.static(path.join(__dirname, '..', '../myblog')));  // Root directory of your project
console.log(__dirname);
// Serve index.html as default when accessing the root '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '/myblog/index.html'));  // Or provide the path to index.html
});


// 定义send的响应数据的中间件
app.use(function (req, res, next) {
	// status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
	res.cc = function (err, status = 1, success = false) {
		res.send({
			success,
			// 状态
			status,
			// 状态描述，判断 err 是 错误对象 还是 字符串
			message: err instanceof Error ? err.message : err,
		})
	}
	next()
})

//解析token文件
const config = require('./config');
// 解析 token 的中间件
const { expressjwt: expressJWT } = require('express-jwt');

app.use(
    expressJWT({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({
        path: [/^\/api\//],
    })
);
// 导入并使用文章路由模块
const artCateRouter = require('./router/article')
// 为文章路由挂载统一的访问前缀 /my/article
app.use('/my/article', artCateRouter)

// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my', userinfoRouter)
//导入用户注册登录模块
const userRouter = require('./router/user');
app.use('/api',userRouter);

//定义错误级别中间件
app.use((err,req,res,next)=>{
    //验证失败
    if(err instanceof joi.ValidationError) return res.cc(err);
	// 捕获身份认证失败的错误
	/* console.log("123",err);
	console.log("1234",req.headers.Authorization); */
    if(err.name === 'UnauthorizedError') return res.cc('身份认证失败，请先登录');
    //未知错误
    return res.cc(err);
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
