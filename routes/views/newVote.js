var keystone = require('keystone');
var subRedditSchema = require('../../models/./subreddit.js')
var userSchema = require('../../models/./users.js')
var index = require('.././index.js');
var async = require('async');
var mongoose = require('mongoose');
var _ = require('underscore');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    console.log('NEWVOTE');
    console.log(req.params.sub);
    console.log(req.body);

    
    if (req.method === 'POST') {
        // User logged in
        if (typeof res.locals.user=="undefined"){
            console.log('not logged in');
        }else{
            if (req.body.postType=="postVote") {
                console.log('postVote');
                switch (req.body.vote){
                    case "up":
                        console.log('up');
                        votePost(
                            req.params.sub,
                            "up",
                            req.body.postId,
                            res.locals.user._id
                        )
                        break;
                    case "down":
                        console.log('down');
                        votePost(
                            req.params.sub,
                            "down",
                            req.body.postId,
                            res.locals.user._id
                        )
                        break
                }
            }else if(req.body.postType=="commentVote"){
                console.log('comment Vote');
                switch (req.body.vote){
                    case "up":
                        voteComment(
                            req.params.sub,
                            req.body.urlTitle,
                            req.body.commentId,
                            res.locals.user._id,
                            "up"
                        )
                        break;
                }
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
                // If subreddit not found
                if(results[0]== null){
                    console.log('not found')
                    req.flash('error', "there was an error during the process");
                    view.render('post',index.sessionInfos(req,res));

                // Subreddit found
                }else{
                    console.log('error soon')
                    console.log(subName);
                    console.log(urlTitle);
                    mongoose.model('_'+subName).findOne({ "urlTitle":urlTitle},function(err,result){
                        if (err)
                            console.log(err)

                        // Check if userId already is in upVotes/downVotes lists
                        var rowId;
                        _.each(result.comments, function(value,index){
                            if(value.id==commentId){
                                rowId=index;
                            }
                        });

                        var upFound = _.where(result.comments[rowId].upVotes, userId);
                        var downFound = _.where(result.comments[rowId].downVotes, userId);
                        console.log(result.comments[rowId]);
                        console.log(userId);

                        switch(vote) {
                            case "up":
                                console.log('up')
                                if(!upFound[0]){
                                    console.log('UP: up not found')
                                    result.comments[rowId].upVotes.push(userId);
                                    result.comments[rowId].upVotesNumber =result.comments[rowId].upVotes.length
                                }
                                if(downFound[0]){
                                    console.log('UP: down found')
                                    result.comments[rowId].downVotes.splice( result.comments[rowId].downVotes.indexOf(userId), 1 );
                                }
                                break;
                        }

                        result.save(function(err,result){
                            if(err)
                                console.log(err);
                            //console.log(result);
                        });
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
                    console.log('not found')
                    req.flash('error', "there was an error during the process");
                    view.render('subReddit',index.sessionInfos(req,res));

                // SUbreddit found
                }else{
                    console.log('found');
                    if(results[0].active==false){
                        req.flash('error', 'the subreddit is unactivated');
                        view.render('subReddit',index.sessionInfos(req,res));                       
                    }else {

                        mongoose.model('_'+subName).findOne({ "_id":postId},function(err,result){
                            if (err)
                                console.log(err)

                            // Check if userId already is in upVotes/downVotes lists
                            var upFound = _.where(result.upVotes, userId);
                            var downFound = _.where(result.downVotes, userId);

                            switch(vote) {
                                case "up":
                                    console.log('up')
                                    if(!upFound[0]){
                                        console.log('UP: up not found')
                                        result.upVotes.push(userId);
                                    }
                                    if(downFound[0]){
                                        console.log('UP: down found')
                                        result.downVotes.splice( result.downVotes.indexOf(userId), 1 );
                                    }
                                    break;
                                case "down":
                                    console.log('down')
                                    if(!downFound[0]){
                                        console.log('DOWN: down not  found')
                                        result.downVotes.push(userId);
                                    }
                                    if(upFound[0]){
                                        console.log('DOWN: up found')
                                        result.upVotes.splice( result.downVotes.indexOf(userId), 1 );                                        
                                    }
                                    break;
                            }
                            result.votesDifference=result.upVotes.length-result.downVotes.length;
                            result.save();
                        });
                    }
                }
            });
        }
    }
}