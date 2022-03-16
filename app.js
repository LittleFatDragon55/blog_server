const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session")
// let bodyParser = require('body-parser')
// import 等语法要用到 babel 支持
// require('babel-register');
require('babel-register')({
    presets: ['env']
})
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const articleRouter = require('./routes/article');
const categoryRouter = require('./routes/category');
const tagRouter = require('./routes/tag');

const app = express();
const cors = require('cors');

app.use(cors({
        origin: "*",
    })
);

const mongodb = require('./core/mongodb');

// data server
mongodb.connect();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// app.engine('pug', require('pug').__express);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.all("*",function(req,res,next){
//     //设置允许跨域的域名，*代表允许任意域名跨域
//     res.header("Access-Control-Allow-Origin","http://localhost:9528");
//     //允许的header类型
//     res.header("Access-Control-Allow-Headers","content-type");
//     //跨域允许的请求方式
//     res.header("Access-Control-Allow-Methods","DELETE,PUT,POST,GET,OPTIONS");
//     if (req.method.toLowerCase() == 'options')
//         res.send(200);  //让options尝试请求快速结束
//     else
//         next();
// });
// app.use((req, res, next) => {
//     //设置请求头
//     res.set({
//         // 'Access-Control-Allow-Credentials': true,
//         // 'Access-Control-Max-Age': 1728000,
//         'Access-Control-Allow-Origin': req.headers.origin || '*',
//         // 'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
//         // 'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
//         // 'Content-Type': 'application/json; charset=utf-8'
//     })
//     req.method === 'OPTIONS' ? res.status(204).end() : next()
// })

app.use(
    session({
        secret: "blogapp_cookie",
        name: "session_id",//浏览器中生成cookie的名称可以，默认是connect.sid
        resave: true,
        saveUninitialized: true,
        cookie: {
            maxAge: 60 * 1000 * 30, httpOnly: true
        }//过期时间
    })
)//将客户的登录信息保存
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/article', articleRouter);
app.use('/category', categoryRouter);
app.use('/tag', tagRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    // res.status(err.status || 500);
    // res.render('error');
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

module.exports = app;
