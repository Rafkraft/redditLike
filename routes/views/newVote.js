var keystone = require('keystone');
var subRedditSchema = require('../../models/./subreddit.js')
var userSchema = require('../../models/./users.js')
var index = require('.././index.js');
var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    
    if (req.method === 'POST') {
        // User logged in
        if (typeof res.locals.user=="undefined"){
            view.res.send('you are not connected');
        // right postType
        }else if(req.body.postType!=="postVote"&&req.body.postType!=="commentVote"){
            view.res.send('There was an error during the process');
        // right voteType
        }else if(req.body.vote!=="up"&&req.body.vote!=="down"){
            view.res.send('There was an error during the process');
        }else{
            switch(req.body.postType){
                case "postVote":
                    switch (req.body.vote){
                        case "up":
                            votePost(
                                req.params.sub,
                                "up",
                                req.body.postId,
                                res.locals.user._id
                            );
                            break;
                        case "down":
                            votePost(
                                req.params.sub,
                                "down",
                                req.body.postId,
                                res.locals.user._id
                            );
                            break;
                    }
                    break;
                case "commentVote":
                    switch (req.body.vote){
                        case "up":
                            voteComment(
                                req.params.sub,
                                req.body.urlTitle,
                                req.body.commentId,
                                res.locals.user._id,
                                "up"
                            );
                            break;
                        case "down":
                            voteComment(
                                req.params.sub,
                                req.body.urlTitle,
                                req.body.commentId,
                                res.locals.user._id,
                                "down"
                            );
                            break;
                    }
                    break;
            }
        }
        function voteComment (subName,urlTitle,commentId,userId,vote){
            async.series([
                function(callback){
                    mongoose.model('subredditsList').findOne({ "name":subName},function(err,subs){
                        callback(null, subs);
                    })
                }
            ],
            function(err, results){
                if(err){
                    console.log(err);
                    view.res.send('There was an error during the process');
                }else if(results[0]== null){
                    view.res.send('There was an error during the process');
                }else{
                    mongoose.model('_'+subName).findOne({ "urlTitle":urlTitle},function(err,result){
                        if (err){
                            console.log(err);
                            view.res.send('There was an error during the process');
                        }else if(result==null){
                            view.res.send('There was an error during the process');
                        }else{
                            // Check if userId already is in upVotes/downVotes lists
                            var rowId;
                            _.each(result.comments, function(value,index){
                                if(value.commentId==commentId){
                                    rowId=index;
                                }
                            });

                            var upFound = _.where(result.comments[rowId].upVotes, userId);
                            var downFound = _.where(result.comments[rowId].downVotes, userId);

                            switch(vote) {
                                case "up":
                                    if(!upFound[0]){
                                        result.comments[rowId].upVotes.push(userId);   
                                    }
                                    if(downFound[0]){
                                        result.comments[rowId].downVotes.splice( result.comments[rowId].downVotes.indexOf(userId), 1 );
                                    }
                                    break;
                                case "down":
                                    if(!downFound[0]){
                                        result.comments[rowId].downVotes.push(userId);
                                    }
                                    if(upFound[0]){
                                        result.comments[rowId].upVotes.splice( result.comments[rowId].upVotes.indexOf(userId), 1 );
                                    }
                                    break;
                            }
                            result.comments[rowId].upVotesNumber =result.comments[rowId].upVotes.length;
                            result.comments[rowId].downVotesNumber =result.comments[rowId].downVotes.length;
                            view.res.send('{"up":"'+result.comments[rowId].upVotesNumber+'","down":"'+result.comments[rowId].downVotesNumber+'"}');
                            result.save(function(err,result){
                                if(err)
                                    console.log(err);
                            });
                        }
                    });
                    
                }
            });
        }
        function votePost (subName,vote,postId,userId){
        // =================
        // FIELDS VALIDS
        // =================
            async.series([
                function(callback){
                    mongoose.model('subredditsList').findOne({ "name":subName},function(err,subs){
                        callback(null, subs);
                    })
                }
            ],
            function(err, results){
                // If subreddit not found
                if(results[0]== null){
                    view.res.send('There was an error during the process');
                }else if(results[0].active==false){
                    view.res.send('There was an error during the process');
                }else {
                    mongoose.model('_'+subName).findOne({ "_id":postId},function(err,result){
                        if (err){
                            console.log(err);
                            view.res.send('There was an error during the process');
                        }else if(result==null){
                            view.res.send('There was an error during the process');
                        }else{ 
                            //Check if userId already is in upVotes/downVotes, push/splice userId
                            var upFound = _.where(result.upVotes, userId);
                            var downFound = _.where(result.downVotes, userId);

                            switch(vote) {
                                case "up":
                                    if(!upFound[0]){
                                        result.upVotes.push(userId);
                                    }
                                    if(downFound[0]){
                                        result.downVotes.splice( result.downVotes.indexOf(userId), 1 );
                                    }
                                    break;
                                case "down":
                                    if(!downFound[0]){
                                        result.downVotes.push(userId);
                                    }
                                    if(upFound[0]){
                                        result.upVotes.splice( result.upVotes.indexOf(userId), 1 );                                        
                                    }
                                    break;
                            }
                            result.votesDifference=result.upVotes.length-result.downVotes.length;
                            view.res.send('{"votesDifference":"'+result.votesDifference+'"}')
                            result.save(function(err,result){
                                if(err)
                                    console.log(err);
                            });
                        }
                    });
                }
            });
        }
    }
};