import {responseClient} from '../util/util.js';

const express = require('express');
const router = express.Router();
const Article = require("../models/article")
//新增文章
router.post("/add_article", function (req, res) {
    const {
        title,
        author,
        keyword,
        content,
        desc,
        tags,
        category,
        state,
        type,
        origin,
    } = req.body;
    // console.log(req.body)
    let tempArticle = new Article({
        title,
        author,
        keyword: keyword ? keyword.split(',') : [],
        content,
        numbers: content.length,
        desc,
        tags: tags ? tags.split(',') : [],
        category: category ? category.split(',') : [],
        state,
        type,
        origin,
    });

    tempArticle.save().then(data => {
        responseClient(res, 200, 0, '保存成功', data);
    }).catch(err => {
        console.log(err);
        responseClient(res);
    });
})
//文章列表
router.get("/list", function (req, res) {
    let { currentPage, pageSize} = req.query;
    // keyword, tags, category,
    currentPage = parseInt(currentPage);
    pageSize = parseInt(pageSize);

    let sort = {'creat_time': -1};        //排序（按登录时间倒序）
    let skip_num = (currentPage - 1) * pageSize;   //跳过数
    let connection = {}
    // if (name) {
    //     connection["name"] = name
    // }
    // if (type) {
    //     connection["age"] = type
    // }
    Article.count(connection, function (err, total) {
        if (err) {
            console.log("Error:" + err);
        } else {
            // responseClient(res, 200, 0, '返回成功',total);
            Article.find(connection).skip(skip_num).limit(pageSize).sort(sort).exec(function (err, data) {
                responseClient(res, 200, 0, '返回成功', data, total);

            })
        }
    })


})


module.exports = router;
