import {responseClient} from '../util/util.js';

const express = require('express');
const router = express.Router();
const Category = require("../models/category")

//新增
router.post('/add_category', function (req, res, next) {

    let {name, desc} = req.body
    if (!name) {
        responseClient(res, 400, 2, "分类名不可为空")
        return;
    }
    if (!desc) {
        responseClient(res, 400, 2, '描述不可为空');
        return;
    }
    Category.findOne({name: name})
        .then(data => {
            if (data) {
                responseClient(res, 200, 1, '分类已存在！');
                return;
            }
            //保存到数据库
            let category = new Category({
                name,
               desc
            });
            category.save().then(data => {
                responseClient(res, 200, 0, '注册成功', data);
            });
        })
        .catch(err => {
            responseClient(res);
            return;

        });

});

//更新分类信息
router.post("/update_category", function (req, res) {
    let {id} = req.body
    Category.update({'id': id}, req.body, function (err, data) {
        if (err) {
            responseClient(res, 400, 2, "分类不存在")

        } else {
            responseClient(res, 200, 0, '修改成功');

        }
    })


})

//分类列表
router.get("/list_category", function (req, res) {
    let {keyword, pageSize, currentPage} = req.query
    currentPage = parseInt(currentPage)
    pageSize = parseInt(pageSize)
    let conditions = {};
    if (keyword) {
        const reg = new RegExp(keyword, 'i');
        conditions = {
            $or: [{ name: { $regex: reg } }, { desc: { $regex: reg } }],
        };
    }
    let sort = {'creat_time': -1};        //排序（按登录时间倒序）
    let skip_num = (currentPage - 1) * pageSize;   //跳过数

    Category.countDocuments(conditions, function (err, total) {

        if (err) {
            console.log("Error:" + err);
        } else {
            let fields = {
                name: 1,
                desc: 1,
                id: 1,
                create_time: 1,
            };
            // responseClient(res, 200, 0, '返回成功',total);
            Category.find(conditions,fields).skip(skip_num).limit(pageSize).sort(sort).exec(function (err, data) {
                responseClient(res, 200, 0, '返回成功', data, total);

            })
        }
    })


})
//删除分类
router.post("/delete_category", function (req, res) {
    let {ids} = req.body
    console.log(ids, req.body, 77777)
    Category.remove({'id': {$in: ids}}, function (err, data) {
        if (err) {
            console.log("Error:" + err);
        } else {
            console.log("Res:" + data);
            responseClient(res, 200, 0, '删除成功',);

        }
    })
})


module.exports = router;
