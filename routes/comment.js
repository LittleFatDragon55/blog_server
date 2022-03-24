import {responseClient} from "../util/util"
import Comment from "../models/comment"
import User from "../models/user"
import Article from "../models/article"
import express from "express";

const router = express.Router();
//获取全部评论
router.get("/getCommentList", function (req, res) {
    let keyword = req.query.keyword || null
    let is_handle = parseInt(req.query.is_handle) || 0
    let pageNum = parseInt(req.query.pageNum) || 1
    let pageSize = parseInt(req.query.pageSize) || 10;
    let conditions = {}
    if (keyword) {
        const reg = new RegExp(keyword, 'i')//不区分大小写
        if (is_handle) {
            conditions = {
                content: {$regex: reg},
                is_handle
            }
        } else {
            conditions = {
                content: {$regex: reg}
            }
        }
    }
    if (is_handle) {
        conditions = {
            is_handle
        }
    }
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize
    let responseData = {
        count: 0,
        list: []
    }
    //获取数据数量
    Comment.countDocuments({}, (err, count) => {
        if (err) {
            console.error("Error" + err);
        } else {
            responseData.count = count
            //待返回字段
            let fields = {
                article_id: 1,
                content: 1,
                is_top: 1,
                likes: 1,
                user_id: 1,
                user: 1,
                other_comments: 1,
                state: 1,
                is_handle: 1,
                create_time: 1
            }
            let options = {
                skip:skip,
                limit:pageSize,
                sort:{create_time:-1}
            }
            Comment.find(conditions,fields,options,(err,result)=>{
                if(err){
                    console.log(err)
                }else{
                    responseData.list = result
                    responseClient(res,200,0,"操作成功",responseData)
                }
            })
        }
    })
})

//一级评论
router.post("/add_comment", function (req, res) {

    let {article_id, user_id, content} = req.body
    User.findById({_id: user_id}).then(result => {
       let userInfo = {
            user_id: result._id,
            username: result.username,
            type: result.type,
            avatar: result.avatar
        }
        let comment = new Comment({
            article_id: article_id,
            content: content,
            user_id: user_id,
            user: userInfo
        })
        comment.save().then(commentResult=>{
            Article.findOne({_id:article_id},(errors,data)=>{
               if(errors){
                    console.log(errors)
                }else{
                    data.comments.push(commentResult._id);
                    data.meta.comments = data.meta.comments+1
                    Article.updateOne({_id:article_id},{comments:data.comments,meta:data.meta,is_handle:0}).then(articleResult=>{
                        responseClient(res,200,0,"评论成功",commentResult)
                    }).catch(err=>{
                        console.log(err)
                    })
                }
            })
        })
    })
})

//评论回复
router.post("/reply_comment",function (req,res){
    let{article_id,comment_id,user_id,content,to_user}=req.body
    Comment.findById({_id:comment_id}).then(commentResult=>{
        User.findById({_id:user_id}).then(userResult=>{
            if(userResult){
                let userInfo={
                    user_id:userResult._id,
                    username:userResult.username,
                    type: userResult.type,
                    avatar: userResult.avatar
                }
                let item = {
                    user:userInfo,
                    content:content,
                    to_user:JSON.parse(to_user)
                }
                commentResult.other_comments.push(item)
                Comment.updateOne({_id:comment_id},{
                    other_comments:commentResult.other_comments,
                    id_handle:2
                }).then(result=>{
                    Article.findOne({_id:article_id},(err,data)=>{
                        if(err){
                            console.log(err)
                        }else{
                            data.meta.comments = data.meta.comments+1
                            Article.updateOne({_id:article_id},{meta:data.meta}).then(article_result=>{
                                responseClient(res,200,0,"回复成功",article_result)
                            }).catch(err=>{
                                console.log(err)
                            })
                        }
                    })
                }).catch(err1=>{
                    console.log(err1)
                    responseClient(res)
                })
            }else{
                responseClient(res,200,1,"用户不存在")
            }
        }).catch(err2=>{
            console.log(err2)
            responseClient(res)
        })
    }).catch(error=>{
        console.log(error)
        responseClient(res)
    })
})
module.exports = router;