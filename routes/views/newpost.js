var keystone = require('keystone');
var subRedditSchema = require('../../models/./subreddit.js')
var userSchema = require('../../models/./users.js')
var index = require('.././index.js');
var async = require('async');
var mongoose = require('mongoose');
var validator = require('validator');
var unidecode = require('unidecode');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    console.log('NEWPOST');
    console.log(req.params.sub);

    if (req.method === 'GET') {
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
                console.log('found');                
                view.render('newpost',index.sessionInfos(req,res));
            }
        });
    
    }else if (req.method === 'POST') {

        console.log(req.body);

        // =================
        // VERIFICATIONS
        // =================

        function isUrl(s) {
            var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
            return regexp.test(s);
        }
        function isAlphaNumeric(s){
            var regexp = /^([a-zA-Z0-9 _\!\,.-ÇÉÈÊËÀÎÏÛ&çéèêëàîïû']+)$/
            return regexp.test(s);
        }

        req.body.title = req.body.title.replace(/\s{2,}/g, ' ');

        // User logged in
        if (typeof res.locals.user=="undefined"){
            console.log('not logged in');
            //console.log(req)
            req.flash('error', 'you must be logged in to post');
            view.render('newpost',index.sessionInfos(req,res));

        }else{
            switch (req.body.postType) {
                case "text":
                    if (!isAlphaNumeric(req.body.title)){
                        req.flash('error', 'Your title contains a forbidden character. Only alphanumerical and a few special characters like &,é,è,ë,à,î... are allowed.');
                        view.render('newpost',index.sessionInfos(req,res));
                        break;
                    //Title between 10 and 100 haracters
                    }else if (req.body.title.length<10 || req.body.title.length>100){
                        req.flash('error', 'the title must contain between 10 and 100 characters');
                        view.render('newpost',index.sessionInfos(req,res));
                        break;
                    // Text long enough // not too long
                    }else if (req.body.text.length<30 || req.body.text.length>10000){
                        req.flash('error', 'your text must contain between 30 and 1000 characters');
                        view.render('newpost',index.sessionInfos(req,res));
                        break;
                    }else{
                        post();
                        break;
                    }
                case "link":
                    if (!isAlphaNumeric(req.body.title)){
                        req.flash('error', 'Your title contains a forbidden character. Only alphanumerical and a few special characters like &,é,è,ë,à,î... are allowed.');
                        view.render('newpost',index.sessionInfos(req,res));
                        break;
                    //Title between 10 and 100 haracters
                    }else if (req.body.title.length<10 || req.body.title.length>100){
                        req.flash('error', 'the title must contain between 10 and 100 characters');
                        view.render('newpost',index.sessionInfos(req,res));
                        break;
                    // Link valid
                    }else if (!isUrl(req.body.link)){
                        req.flash('error', 'the url is not valid, maybe you forgor the http / https prefix');
                        view.render('newpost',index.sessionInfos(req,res));
                        break;
                    }else{
                        post();
                        break;
                    }
            }
        }
        function post (){
        // =================
        // FIELDS VALIDS
        // =================
        console.log(req.body.text)
            async.series([
                function(callback){
                    mongoose.model('subredditsList').findOne({ "name":req.params.sub},function(err,subs){
                        callback(null, subs);
                    })
                }
            ],
            function(err, results){
                // If subreddit not found
                if(results[0]== null){
                    console.log('not found')
                    req.flash('error', 'subReddit '+req.params.sub+" doesn't exist");
                    view.render('newpost',index.sessionInfos(req,res));

                // Subreddit found
                }else{
                    console.log('found');
                    if(results[0].active==false){
                        req.flash('error', 'the subreddit is unactivated');
                        view.render('newpost',index.sessionInfos(req,res));                       
                    }else {
                        if(req.body.type=="text"){
                            req.body.link="";
                        }else if(req.body.type=="link"){
                            req.body.text="";
                        }

                        var post = mongoose.model("_"+req.params.sub, subRedditSchema.subredditSchema);

                        //console.log(res.locals.user)
                        var link,text,type;
                        if(req.body.postType=="text"){
                            link="";
                            text=req.body.text;
                            type='text';
                        }else if(req.body.postType=="link"){
                            link=req.body.link;
                            text="";
                            type='link';
                        }
                        var urlTitle=unidecode(req.body.title.split(' ').join('-'));
                        urlTitle = urlTitle.replace(/\?/g,'int');
                        
                        var p = new post({
                            //  Post
                            title:req.body.title,
                            urlTitle:urlTitle,
                            type: type,
                            text: text,
                            link: link,
                            subReddit:req.params.sub,

                            //  Author / Creation
                            authorId:res.locals.user._id,
                            authorUsername:res.locals.user.userName,
                            createdOn:new Date(),

                            //  Comments / Votes / Rank
                            comments:[],
                            commentsNumber:0,
                            upVotes:[],
                            upVotesNumber:0,
                            downVotes:[],
                            downVotesNumber:0,
                            votesDifference:0,
                            rank:0
                        })
                        
                        p.save(function(err,post){
                            console.log('NEW POST');
                            console.log(post._id);
                            var newPostId = post._id;
                            var newPostSub = post.subReddit;
                            var User = keystone.list('User');
                            User.model.findOne({ "_id":res.locals.user._id},function(err,user){
                                var length = user.posts.length;
                                user.posts.push({
                                        id:user.posts.length,
                                        subReddit:newPostSub,
                                        postId:newPostId
                                    })
                                user.save();
                            })
                            mongoose.model('subredditsList').findOne({ "name":post.subReddit},function(err,sub){
                                console.log(sub);
                            })
                        })
                    }
                }
            });
        }
    }
}


