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
        img_url,
        tags,
        category,
        state,
        type,
        origin,
    } = req.body;
    let tempArticle = null;
    // console.log(req.body)
    if (img_url) {
        tempArticle = new Article({
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers: content.length,
            desc,
            img_url,
            tags: tags ? tags : [],
            category: category ? category : [],
            state,
            type,
            origin,
        });
    } else {
        tempArticle = new Article({
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers: content.length,
            desc,
            tags: tags ? tags : [],
            category: category ? category : [],
            state,
            type,
            origin,
        });
    }

    tempArticle.save().then(data => {
        responseClient(res, 200, 0, '保存成功', data);
    }).catch(err => {
        console.log(err);
        responseClient(res);
    });
})

//文章修改
router.post("/updateArticle", function (req, res) {
    const {
        title,
        author,
        keyword,
        content,
        desc,
        img_url,
        tags,
        category,
        state,
        type,
        origin,
        _id
    } = req.body
    Article.update({_id: _id}, {
        title,
        author,
        keyword: keyword ? keyword.split(',') : [],
        content,
        desc,
        img_url,
        tags: tags,
        category: category,
        state,
        type,
        origin
    }).then(result => {
        responseClient(res, 200, 0, "操作成功", result)
    }).catch(err => {
        console.log(err)
        responseClient(res)
    })
})

//文章删除
router.post("/delArticle", function (req, res) {
    const ids = req.body.ids
    Article.deleteMany({'id': {$in: ids}}).then(result => {
        if (result.n === 1) {
            responseClient(res, 200, 0, "删除成功")
        } else {
            responseClient(res, 200, 1, "文章不存在")
        }
    }).catch(err => {
        console.log(err)
        responseClient(res)
    })
})

//文章列表admin
router.get("/list", function (req, res) {
    let {pageNum, pageSize} = req.query;
    // keyword, tags, category,
    let keyword = req.query.keyword || null
    let state = req.query.state || null
    let likes = req.query.likes || null
    pageNum = parseInt(pageNum) || 1;
    pageSize = parseInt(pageSize) || 10;
    let connection = {}
    console.log(state, !state, "!state")
    if (state == null) {
        if (keyword) {
            const reg = new RegExp(keyword, 'i')//不区分大小写
            connection = {
                $or: [{title: {$regex: reg}}, {desc: {$regex: reg}}, {keyword: {$regex: reg}}]
            }
        }
    } else {
        // if (state == 1)
        state = parseInt(state)
        if (keyword) {
            const reg = new RegExp(keyword, 'i')//不区分大小写
            connection = {
                $and: [
                    {
                        $or: [{state: state}]
                    },
                    {
                        $or: [{title: {$regex: reg}}, {desc: {$regex: reg}}, {keyword: {$regex: reg}}]

                    }
                ]
            }
        }
    }
    // else {
    //     connection = {
    //         state
    //     }
    // }

    // let sort = {'creat_time': -1};        //排序（按登录时间倒序）
    // let skip_num = (pageNum - 1) * pageSize;   //跳过数
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize
    let responseData = {
        count: 0,
        list: []
    }

    Article.countDocuments({}, (err, count) => {
        if (err) {
            console.log("err" + err)
        } else {
            console.log("count", count)
            responseData.count = count
            let fields = {
                id: 1,
                title: 1,
                author: 1,
                keyword: 1,
                desc: 1,
                img_url: 1,
                tags: 1,
                category: 1,
                state: 1,
                type: 1,
                origin: 1,
                comments: 1,
                like_User_id: 1,
                meta: 1,
                create_time: 1
            }
            let options = {
                skip: skip,
                limit: pageSize,
                sort: {create_time: -1}
            }
            Article.find(connection, fields, options, (err, result) => {
                if (err) {
                    console.log("err" + err)
                } else {
                    if (likes) {
                        result.sort((a, b) => {
                            return b.meta.likes - a.meta.likes
                        })
                    }
                    responseData.list = result
                    responseData.count = result.length
                    responseClient(res, 200, 0, "返回成功", responseData)
                }
            }).populate([{path: 'tags'}, {path: "comments"}, {path: "category"}]).exec((err, doc) => {
                // console.log("doc:",doc)
            })
        }
    })


})

//网站列表展示
router.get("/article_list", function (req, res) {
    let keyword = req.query.keyword || null
    let state = req.query.state || ""
    let likes = req.query.likes || ""
    let tag_id = req.query.tag_id || ""
    let category_id = req.query.category_id || ""
    let article = req.query.article || ""
    let pageNum = parseInt(req.query.pageNum) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;

    //文章归档
    if (article) {
        pageSize = 1000
    }
    let conditions = {}
    if (!state) {
        if (keyword) {
            const reg = new RegExp(keyword, "i")
            conditions = {
                $or: [{
                    title: {
                        $regex: reg
                    }
                }, {
                    desc: {
                        $regex: reg
                    }
                }]
            }
        }
    } else if (state) {
        state = parseInt(state)
        const reg = new RegExp(keyword, 'i');
        if (keyword) {
            const reg = new RegExp(keyword, 'i');
            conditions = {
                $and: [
                    {$or: [{state: state}]},
                    {
                        $or: [
                            {title: {$regex: reg}},
                            {desc: {$regex: reg}},
                            {keyword: {$regex: reg}},
                        ],
                    },
                ],
            };
        } else {

            conditions = {state};
        }
    }
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    let responseData = {
        count: 0,
        list: [],
    };

    Article.countDocuments({}, (err, count) => {
        if (err) {

            console.log('Error:' + err);
        } else {

            responseData.count = count;
            // 待返回的字段
            let fields = {
                title: 1,
                desc: 1,
                img_url: 1,
                tags: 1,
                category: 1,
                meta: 1,
                create_time: 1,
            };
            if (article) {
                fields = {
                    title: 1,
                    create_time: 1,
                };
            }
            let options = {
                skip: skip,
                limit: pageSize,
                sort: {create_time: -1},
            };
            Article.find(conditions, fields, options, (error, result) => {
                if (err) {
                    console.error('Error:' + error);
                    // throw error;
                } else {
                    let newList = [];
                    if (likes) {
                        // 根据热度 likes 返回数据
                        result.sort((a, b) => {
                            return b.meta.likes - a.meta.likes;
                        });
                        responseData.list = result;
                    } else if (category_id) {
                        // console.log('category_id :', category_id);
                        // 根据 分类 id 返回数据
                        result.forEach(item => {
                            if (item.category.indexOf(category_id) > -1) {
                                newList.push(item);
                            }
                        });
                        let len = newList.length;
                        responseData.count = len;
                        responseData.list = newList;
                    } else if (tag_id != 0) {
                        // console.log('tag_id :', tag_id);
                        // 根据标签 id 返回数据
                        result.forEach(item => {
                            if (item.tags.indexOf(tag_id) > -1) {
                                newList.push(item);
                            }
                        });
                        let len = newList.length;
                        responseData.count = len;
                        responseData.list = newList;
                    } else if (article) {
                        const archiveList = []
                        let obj = {}
                        // 按年份归档 文章数组
                        result.forEach((e) => {
                            let year = e.create_time.getFullYear()
                            // let month = e.create_time.getMonth()
                            if (!obj[year]) {
                                obj[year] = []
                                obj[year].push(e)
                            } else {
                                obj[year].push(e)
                            }
                        })
                        for (const key in obj) {
                            if (obj.hasOwnProperty(key)) {
                                const element = obj[key];
                                let item = {}
                                item.year = key
                                item.list = element
                                archiveList.push(item)
                            }
                        }
                        archiveList.sort((a, b) => {
                            return b.year - a.year;
                        });
                        responseData.list = archiveList;
                    } else {
                        responseData.list = result;
                    }
                    responseClient(res, 200, 0, '操作成功！', responseData);
                }
            });
        }
    });
})

//文章详情
router.get("/article_detail", function (req, res) {
    let id = req.query.id;
    Article.findOne({_id: id},(Error,data)=>{
        if(Error){
            console.log(Error)
        }else{
            if(data){
                data.meta.views = data.meta.views + 1
                Article.updateOne({_id: id}, {meta: data.meta}).then(result => {
                    responseClient(res, 200, 0, '返回成功', data);
                }).catch(err=>{
                    console.log(err)
                })
            }
        }
    }).populate([{path: 'tags'}, {path: "comments"}, {path: "category"}]).exec((err, doc) => {
        // console.log("doc:",doc)
    })


})

//文章点赞
router.post("/getLikes", function (req, res) {
    let id = req.body.id
    Article.findOne({_id: id}).then(data => {
        let fields = {}
        data.meta.likes = data.meta.likes + 1
        fields.meta = data.meta;
        Article.update({_id: id}, fields)
            .then(result => {
                responseClient(res, 200, 0, '操作成功！', result);
            })
            .catch(err => {
                console.error('err :', err);
                throw err;
            });
        // responseClient(res, 200, 0, '返回成功', data);

    })
})

module.exports = router;
