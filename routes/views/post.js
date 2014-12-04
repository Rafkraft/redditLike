var keystone = require('keystone');
var _ = require('underscore');
var index = require('.././index.js');
var async = require('async');
var mongoose = require('mongoose');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

    console.log('POST ASKED, PARAMS:')
    console.log(req.params.sub);
    console.log('_______')

    if (req.method === 'GET') {
        console.log('POST : GET');
        async.series([
            function(callback){
                mongoose.model('subredditsList').findOne({ "name":req.params.sub},function(err,subs){
                    callback(null, subs);
                })
            }
        ],
        function(err, results){
            if(results[0]== null){
                console.log('not found')
            }else{
                console.log('SUBREDDIT EXIST');
                
                var completeName = results[0].completeName;
                var description = results[0].description;

                mongoose.model('_'+req.params.sub).findOne({ "urlTitle":req.params.post},function(err,post){
                    if(err)
                        console.log(err);
                    if(post== null){
                        console.log('not found')
                    }else{
                        console.log('POST EXIST');

                        var infos = index.sessionInfos(req,res);
                        infos.completeName = completeName;
                        infos.subReddit = req.params.sub;
                        infos.postTitle = post.title;
                        infos.postUrlTitle = post.urlTitle;
                        console.log('______');
                        console.log(infos);
                        console.log('______');
                        view.render('post',infos);
                    }
                })
            }
        });
    
    }else if (req.method === 'POST') {
        console.log('POST : POST');
        async.series([
            function(callback){
                mongoose.model('subredditsList').findOne({ "name":req.params.sub},function(err,subs){
                    callback(null, subs);
                })
            }
        ],
        function(err, results){
            if(results[0]== null){
                console.log('not found')
            }else{
                console.log('subreddit exists');
                var completeName = results[0].completeName;
                var description = results[0].description;

                mongoose.model('_'+req.params.sub).findOne({ "urlTitle":req.params.post},function(err,post){
                    if(err)
                        console.log(err);
                    if(post){
                        function isAlphaNumeric(s){
                            var regexp = /^([a-zA-Z0-9 _\?\!\,.-ÇÉÈÊËÀÎÏÛ&çéèêëâàîïûôÔ']+)$/gm;
                            return regexp.test(s);
                        }

                        //User logged in
                        if (typeof res.locals.user=="undefined"){
                            req.flash('error', 'You must be logged in to comment');
                            var infos = index.sessionInfos(req,res);
                            infos.completeName = completeName;
                            infos.subReddit = req.params.sub;
                            infos.postTitle = post.title;
                            infos.postUrlTitle = post.urlTitle;
                            view.render('post',infos);
                        //Text alphanumeric
                        }else if(!isAlphaNumeric(req.body.text)){
                            req.flash('error', 'Your comment contains a forbidden character. Only alphanumerical and a few special characters like &,é,è,ë,à,î... are allowed.');
                            var infos = index.sessionInfos(req,res);
                            infos.completeName = completeName;
                            infos.subReddit = req.params.sub;
                            infos.postTitle = post.title;
                            infos.postUrlTitle = post.urlTitle;
                            infos.comment = req.body.text;
                            view.render('post',infos);
                        }else if(req.body.text.length<10 || req.body.text.length>500){
                            req.flash('error', 'Your comment must contain between 10 and 500 characters');
                            var infos = index.sessionInfos(req,res);
                            infos.completeName = completeName;
                            infos.subReddit = req.params.sub;
                            infos.postTitle = post.title;
                            infos.postUrlTitle = post.urlTitle;
                            infos.comment = req.body.text;
                            view.render('post',infos);
                        }else{
                            var comment={};
                            comment.createdOn=new Date();
                            comment.userName=res.locals.user.userName;
                            comment.userId=res.locals.user._id;
                            comment.content=req.body.text;
                            comment.inResponseTo=req.body.inResponseTo;
                            comment.upVotesNumber=0;
                            comment.downVotesNumber=0;
                            comment.upVotes=[];
                            comment.downVotes=[];
                            var id=0;
                            _.each(post.comments,function(value,index){
                                console.log(value.commentId);
                                console.log(typeof(value.commentId));
                                if(id<=value.commentId){
                                    id=value.commentId+1;
                                }
                            })
                            comment.commentId=id;

                            post.comments.push(comment);
                            post.commentsNumber=post.comments.length;
                            post.save()

                            //RENDER
                            req.flash('info','your comment has been submitted');
                            var infos = index.sessionInfos(req,res);
                            infos.completeName = completeName;
                            infos.subReddit = req.params.sub;
                            infos.postTitle = post.title;
                            infos.postUrlTitle = post.urlTitle;
                            view.render('post',infos);
                        }
                    }
                })
            }
        });
    }

};