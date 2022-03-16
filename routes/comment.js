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
    let pageNum = parseInt(req.query.pageNum)||1
    let pageSize = parseInt(req.query.pageSize) || 10;
    let conditions = {}
    if(keyword){
        const reg = new RegExp(keyword,'i')//不区分大小写
        if(is_handle){
            conditions={
                content:{$regex:reg},
                is_handle
            }
        }else{
            conditions={
                content:{$regex:reg}
            }
        }
    }
    if(is_handle){
        conditions={
            is_handle
        }
    }
    let skip = pageNum-1<0?0:(pageNum-1)*pageSize
    let responseData = {
        count:0,
        list:[]
    }
    //获取数据数量
    Comment.countDocuments({},(err,count)=>{
        if(err){
            console.error("Error"+err);
        } else {
           responseData.count = count
            //待返回字段
            let fields={
               article_id:1,
                content:1,
                is_top:1,
                likes:1,
                user_id:1,
                user:1,
                other_comments:1,
                state:1,
                is_handle:1,
                create_time:1
            }
        }
    })
})