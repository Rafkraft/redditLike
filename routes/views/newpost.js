var keystone = require('keystone');
var subRedditSchema = require('../../models/./subreddit.js')
var userSchema = require('../../models/./users.js')
var index = require('.././index.js');
var async = require('async');
var _ = require('underscore');
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
            if(err){
                req.flash('error', "There were an error during the process");
                view.render('index',index.sessionInfos(req,res));
            }else if(results[0]== null){
                req.flash('error', "The subreddit you're looking for has not been found");
                view.render('index',index.sessionInfos(req,res));
            }else if (typeof res.locals.user=="undefined"){
                req.flash('error', "You must be logged in to access the 'Newppost' page");
                view.render('index',index.sessionInfos(req,res));
            }else{            
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
            req.flash('error', 'you must be logged in to post');
            view.render('index',index.sessionInfos(req,res));
        }else if(!req.body.type||!req.body.postType||!req.body.subReddit||!req.body.title){
            req.flash('error', 'there was an error during the process');
            view.render('newpost',index.sessionInfos(req,res));
        }else if(!req.body.title&&!req.body.link){
            req.flash('error', 'there was an error during the process');
            view.render('newpost',index.sessionInfos(req,res));
        }else if(req.body.postType!=="text"&&req.body.postType!=="link"){
            req.flash('error', 'there was an error during the process');
            view.render('newpost',index.sessionInfos(req,res));
        }else{
            switch (req.body.postType) {
                case "text":
                    //Title alphanumeric
                    if (!isAlphaNumeric(req.body.title)){
                        req.flash('error', 'Your title contains a forbidden character. Only alphanumerical and a few special characters like &,é,è,ë,à,î... are allowed.');
                        var infos=index.sessionInfos(req,res);
                        infos.savedTitle=req.body.title;
                        infos.savedText=req.body.text.replace(/[\n\r]/g, ' ');
                        view.render('newpost',infos);

                    //Title between 10 and 100 haracters
                    }else if (req.body.title.length<10 || req.body.title.length>100){
                        req.flash('error', 'the title must contain between 10 and 100 characters');
                        var infos=index.sessionInfos(req,res);
                        infos.savedTitle=req.body.title;
                        infos.savedText=req.body.text.replace(/[\n\r]/g, ' ');
                        view.render('newpost',infos);

                    // Text long enough // not too long
                    }else if (req.body.text.length<30 || req.body.text.length>10000){
                        req.flash('error', 'your text must contain between 30 and 1000 characters');
                        var infos=index.sessionInfos(req,res);
                        infos.savedTitle=req.body.title;
                        infos.savedText=req.body.text.replace(/[\n\r]/g, ' ');
                        view.render('newpost',infos);
                    }else{
                        post();
                    }
                    break;
                case "link":
                    //Title alphanumeric
                    if (!isAlphaNumeric(req.body.title)){
                        req.flash('error', 'Your title contains a forbidden character. Only alphanumerical and a few special characters like &,é,è,ë,à,î... are allowed.');
                        var infos=index.sessionInfos(req,res);
                        infos.savedTitle=req.body.title;
                        infos.savedLink=req.body.link;
                        view.render('newpost',infos);

                    //Title between 10 and 100 characters
                    }else if (req.body.title.length<10 || req.body.title.length>100){
                        req.flash('error', 'the title must contain between 10 and 100 characters');
                        var infos=index.sessionInfos(req,res);
                        infos.savedTitle=req.body.title;
                        infos.savedLink=req.body.link;
                        view.render('newpost',infos);
                        
                    // Link valid
                    }else if (!isUrl(req.body.link)){
                        req.flash('error', 'the url is not valid, maybe you forgor the http / https prefix');
                        var infos=index.sessionInfos(req,res);
                        infos.savedTitle=req.body.title;
                        infos.savedLink=req.body.link;
                        view.render('newpost',infos);
                        
                    }else{
                        post();
                    }
                    break;
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
                if(err){
                    console.log(err);
                    req.flash('error', "There was an error during the process");
                    view.render('newpost',index.sessionInfos(req,res));
                }else if(results[0]== null){
                    req.flash('error', 'the subreddit "'+ req.params.sub +"\" doesn't exist");
                    view.render('newpost',index.sessionInfos(req,res));
                }else if(results[0].active==false){
                    req.flash('error', 'the subreddit is unactivated');
                    view.render('newpost',index.sessionInfos(req,res)); 
                }else{
                    console.log('VERIF OK')

                    // recovering infos from search        
                    var completeName = results[0].completeName;
                    var description =  results[0].description;

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
                    
                    var Post = mongoose.model("_"+req.params.sub, subRedditSchema.subredditSchema);
                    var p = {
                        //  Post
                        title:req.body.title,
                        urlTitle:urlTitle,
                        type: type,
                        text: text,
                        link: link,
                        subReddit:req.params.sub,
                        active:true,

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
                    }
                    var post = new Post(p)
                    
                    post.save(function(err,post){
                        var newPostId = post._id;
                        var newPostSub = post.subReddit;
                        var User = keystone.list('User');
                        User.model.findOne({ "_id":res.locals.user._id},function(err,user){
                            var id=0;
                            _.each(user.posts,function(value,index){
                                if(id<=value.id){
                                    id=value.id+1;
                                }
                            })
                            user.posts.push({
                                    id:id,
                                    subReddit:newPostSub,
                                    postId:newPostId,
                                    createdOn:new Date()
                                })
                            user.save();
                        })
                    })

                    /*
                    //Adding to postslists.recent
                    mongoose.model("postslists", subRedditSchema.postsListsSchema);
                    mongoose.model('postslists').findOne({ "name":"recents"},function(err,recent){
                        recent.posts.push(p)
                        recent.save();
                    });

                    */
                    req.flash('info', 'Your post has been submitted');
                    res.redirect('/r/'+req.params.sub);
                }
            });
        }
    }
}


