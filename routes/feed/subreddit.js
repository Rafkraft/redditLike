var keystone = require('keystone');
var _ = require('underscore');
var index = require('.././index.js');
var async = require('async');
var mongoose = require('mongoose');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    console.log('FEED/SUBREDDIT')
    console.log(req.query);
    switch (req.query.type) {
        case "sub":
            //Sort mode depending on parameter
            var sortMode;
            if(req.query.sort=="rank"){
                sortMode = {rank:-1}
            }else if(req.query.sort=="date"){
                sortMode = {createdOn:-1}
            }
            mongoose.model('_'+req.query.sub).find({},{comments:0},{sort:sortMode},function(err,posts){
                if(err){
                    console.log(err);
                }
                //console.log(posts);
                if(posts.length>0){
                    console.log('POSTS')
                    // There is at least 1 post in the collection
                    //
                    view.res.send(posts)   
                }else{
                    console.log('NO POST')
                    // There is not post in the collection
                    //
                    view.res.send('{error:"there is no post in this collection"}')
                }
            })
            break;
        case "post":
            console.log('POSTSTSTSTS')
            mongoose.model('_'+req.query.sub).find({ "urlTitle":req.query.urlTitle},function(err,post){
                if(err){
                    console.log(err);
                }
                //console.log(posts);
                if(post.length>0){
                    // There is at least 1 post in the collection
                    //
                    view.res.send(post)   
                }else{
                    // There is not post in the collection
                    //
                    view.res.send('{error:"there is no post in this collection"}')
                }
            })
            break;
        case "subList":
            async.series([
                function(callback){
                    mongoose.model('subredditsList').find({ "active":true},function(err,subs){
                        callback(err, subs);
                    })
                }
            ],
            function(err, results){
                view.res.send(results[0]);
            });
            break;
        case "posts":
            //Sort mode depending on parameter
            var sortMode;
            if(req.query.sort=="recents"){
                sortMode = 'recents';
            }else if(req.query.sort=="populars"){
                sortMode = 'populars';
            }
            mongoose.model("Lists").findOne({'name':sortMode},function(err,list){
                view.res.send(list.posts);
            })
            break;
    }
};