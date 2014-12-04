var CronJob = require('cron').CronJob;
var mongoose=require('mongoose');
var async=require('async');
var _=require('underscore');
var subRedditSchema = require('../models/./subreddit.js')

var rankPosts = new CronJob('10 * * * * 0-6', function(){
        async.series([
            //Get list
            function(callback){
                mongoose.model('subredditsList').find(function(err,subs){
                    callback(null, subs);
                })
            }
        ],
        function(err, results){
            if(results[0]== null){
                console.log('CRON not found')
            }else{
                console.log("CRON: SUBREDDITS INFOS")
                //Get each post in each collections;
                var allComments=[]
                _.each(results[0],function(value,index){
                    mongoose.model("_"+value.name).find({active:true},function(err,posts){                        
                        var length= posts.length;
                        var lastPost;
                        if(length>0){
                            lastPost=posts[0];
                        }else{
                            lastPost=null;
                        }
                        
                        var lastCommentTimestamp=0;
                        var lastComment;
                        _.each(posts,function(value,index){
                            var postTitle=value.title;
                            var postUrlTitle=value.urlTitle;
                            var subReddit=value.subReddit;
                            _.each(value.comments,function(value,index){
                                var comment={};
                                comment.createdOn=value.createdOn;
                                comment.userName=value.userName;
                                comment.userId=value.userId;
                                comment.content=value.content;
                                comment.upVotesNumber=value.upVotesNumber;
                                comment.downVotesNumber=value.downVotesNumber;
                                comment.postTitle=postTitle;
                                comment.postUrlTitle=postUrlTitle;
                                comment.subReddit=subReddit;
                                allComments.push(comment);
                                // Get last Comment of post
                                if(comment.createdOn.getTime()/1000>lastCommentTimestamp){
                                    lastCommentTimestamp=comment.createdOn.getTime()/1000;
                                    lastComment=comment;
                                }
                            })
                        })

                        //Posts number, Last Post and last comment
                        mongoose.model('subredditsList').findOne({name:value.name},function(err,sub){
                            sub.postsNumber=length;
                            //Push lastPost
                            sub.lastPost=lastPost;
                            //Push lastComment
                            if(typeof(lastComment)!="undefined"){
                                sub.lastComment = lastComment;
                            } else{
                                sub.lastComment=null
                            }
                            sub.save();
                        })
                    })
                });
                setTimeout(function(){
                    // Lasts comments in the Lists Collection
                    var sortedAllComments = _.sortBy(allComments, function(comment){
                        return -comment.createdOn.getTime()/1000;
                    });
                    sortedAllComments.slice(0,30);
                    mongoose.model("lists", subRedditSchema.ListsSchema);
                    mongoose.model('lists').findOne({ "name":"lastComments"},function(err,LC){
                        LC.posts=[];
                        _.each(sortedAllComments,function(value,index){
                            LC.posts.push(value);
                        });
                        LC.save();
                    });

                },2000)           
            }
        });
  }, null, true
);
