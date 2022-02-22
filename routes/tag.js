import {responseClient} from '../util/util.js';

const express = require('express');
const router = express.Router();
const Tag = require("../models/tag")

//新增
router.post('/add_tag', function (req, res, next) {

    let {name, desc,icon} = req.body
    if (!name) {
        responseClient(res, 400, 2, "分类名不可为空")
        return;
    }
    if (!desc) {
        responseClient(res, 400, 2, '描述不可为空');
        return;
    }
    Tag.findOne({name: name})
        .then(data => {
            if (data) {
                responseClient(res, 200, 1, '分类已存在！');
                return;
            }
            //保存到数据库
            let tag = new Tag({
                name,
                desc,
                icon
            });
            tag.save().then(data => {
                responseClient(res, 200, 0, '注册成功', data);
            });
        })
        .catch(err => {
            responseClient(res);
            return;

        });

});

//更新分类信息
router.post("/update_tag", function (req, res) {
    let {id} = req.body
    Tag.update({'id': id}, req.body, function (err, data) {
        if (err) {
            responseClient(res, 400, 2, "分类不存在")

        } else {
            responseClient(res, 200, 0, '修改成功');

        }
    })


})

//分类列表
router.get("/list_tag", function (req, res) {
    let {name, pageSize, currentPage} = req.query
    currentPage = parseInt(currentPage)
    pageSize = parseInt(pageSize)

    let sort = {'creat_time': -1};        //排序（按登录时间倒序）
    let skip_num = (currentPage - 1) * pageSize;   //跳过数
    let connection = {}
    if (name) {
        connection["name"] = name
    }
    Tag.count(connection, function (err, total) {
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
            Tag.find(connection,fields).skip(skip_num).limit(pageSize).sort(sort).exec(function (err, data) {
                responseClient(res, 200, 0, '返回成功', data, total);

            })
        }
    })


})
//删除分类
router.post("/delete_tag", function (req, res) {
    let {ids} = req.body
    console.log(ids, req.body, 77777)
    Tag.remove({'id': {$in: ids}}, function (err, data) {
        if (err) {
            console.log("Error:" + err);
        } else {
            console.log("Res:" + data);
            responseClient(res, 200, 0, '删除成功',);

        }
    })
})


module.exports = router;
