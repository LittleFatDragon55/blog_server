import {responseClient, md5} from '../util/util.js';

const express = require('express');
const router = express.Router();
const User = require("../models/user")
const MD5_SUFFIX = "123"
// const  {responseClient, md5 } = require("../util/util")
/* GET users listing. */
// router.get('/:name', function (req, res, next) {
//
//     let val = req.params
//     // console.log(val)
//     console.log(req.params)
//
//     res.json({name: val})
// });

router.get('/', function (req, res, next) {

    let val = req.query
    // console.log(val)
    console.log(req.query)
    res.json({name: val})
});
//注册用户
router.post('/register', function (req, res, next) {

    let {name, type, phone, email, introduce, password} = req.body
    if (!name) {
        responseClient(res, 400, 2, "用户名不可为空")
        return;
    }
    if (!password) {
        responseClient(res, 400, 2, '密码不可为空');
        return;
    }
    User.findOne({name: name})
        .then(data => {
            if (data) {
                responseClient(res, 200, 1, '用户已存在！');
                return;
            }
            //保存到数据库
            let user = new User({
                email,
                name,
                password: md5(password + MD5_SUFFIX),
                phone,
                type,
                introduce,
            });
            user.save().then(data => {
                responseClient(res, 200, 0, '注册成功', data);
            });
        })
        .catch(err => {
            responseClient(res);
            return;

        });

});

//登陆
router.post("/login", function (req, res) {
    let {name, password} = req.body

    if (!name) {
        responseClient(res, 400, 2, '用户名不可为空');
        return;
    }
    if (!password) {
        responseClient(res, 400, 2, '密码不可为空');
        return;
    }
    User.findOne({name, password: md5(password + MD5_SUFFIX)}).then(userInfo => {
        // console.log(22222,userInfo)
        if (userInfo) {
            //登陆成功后设置session
            req.session.userInfo = userInfo;
            responseClient(res, 200, 0, "登陆成功")
        } else {
            responseClient(res, 400, 0, "登陆失败")

        }
    }).catch(err => {
        responseClient(res)
    })
})

//用户验证
exports.userInfo = (req, res) => {
    if (req.session.userInfo) {
        responseClient(res, 200, 0, '', req.session.userInfo);
    } else {
        responseClient(res, 200, 1, '请重新登录', req.session.userInfo);
    }
}

//更新用户信息
router.post("/update", function (req, res) {
    let {id, name, type, phone, email, introduce, password} = req.body
    User.update({'id': id}, req.body, function (err, data) {
        if (err) {
            responseClient(res, 400, 2, "用户名不存在")

        } else {
            responseClient(res, 200, 0, '修改成功');

        }
    })


})

//用户列表
router.get("/list", function (req, res) {
    let {name, type, pageSize, currentPage} = req.query
    console.log(name, type, pageSize, currentPage)
    currentPage = parseInt(currentPage)
    pageSize = parseInt(pageSize)

    let sort = {'creat_time': -1};        //排序（按登录时间倒序）
    let skip_num = (currentPage - 1) * pageSize;   //跳过数
    let connection = {}
    if (name) {
        connection["name"] = name
    }
    if (type) {
        connection["age"] = type
    }
    User.count(connection, function (err, total) {
        if (err) {
            console.log("Error:" + err);
        } else {
            let fields = {
                name: 1,
                type: 1,
                phone: 1,
                email: 1,
                introduce: 1,
                id: 1,
                create_time: 1,
            };
            // responseClient(res, 200, 0, '返回成功',total);
            User.find(connection,fields).skip(skip_num).limit(pageSize).sort(sort).exec(function (err, data) {
                responseClient(res, 200, 0, '返回成功', data, total);

            })
        }
    })


})

// router.get("/findMany", function (req, res) {
//     let {name, age, pageSize, currentPage,} = req.query
//     console.log(req.query)
//     currentPage = parseInt(currentPage)
//     pageSize = parseInt(pageSize)
//
//     let sort = {'creat_time': -1};        //排序（按登录时间倒序）
//     let skip_num = (currentPage - 1) * pageSize;   //跳过数
//     let connection = {}
//     if (name) {
//         connection["name"] = name
//     }
//     if (age) {
//         connection["age"] = age
//     }
//     User.find(connection).skip(skip_num).limit(pageSize).sort(sort).exec(function (err, data) {
//         if (err) {
//             console.log(err)
//             res.send("查询错误")
//
//         } else {
//             res.json(data)
//
//
//         }
//     })
//
// })

router.post("/delete", function (req, res) {
    let {ids} = req.body
    console.log(ids, req.body, 77777)
    User.remove({'id': {$in: ids}}, function (err, data) {
        if (err) {
            console.log("Error:" + err);
        } else {
            console.log("Res:" + data);
            responseClient(res, 200, 0, '删除成功',);

        }
    })
})


module.exports = router;
