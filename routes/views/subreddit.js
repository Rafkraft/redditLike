var keystone = require('keystone');

var index = require('.././index.js');
var async = require('async');
var mongoose = require('mongoose');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

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
                console.log('SUBREDDIT NULL');
                req.flash('error', 'the subreddit "'+ req.params.sub +"\" doesn't exist");
                view.render('index',index.sessionInfos(req,res));  
            }else if(results[0].active==false){
                console.log('SUBREDDIT UNACTIVATED');
                req.flash('error', 'the subreddit "'+ req.params.sub +"\" is unactivated");
                view.render('index',index.sessionInfos(req,res)); 
            }else{
                // recovering infos from search
                var completeName = results[0].completeName;
                var description =  results[0].description;
                
                mongoose.model('_'+req.params.sub).find(function(err,posts){
                    if(err)
                        console.log(err);
                    if(posts.length>0){
                        // There is at least 1 post in the collection
                        //
                        console.log('AT LEAST 1 POST IN THE COLLECTION');
                        infos = index.sessionInfos(req,res);
                        infos.completeName = completeName;
                        infos.description = description;
                        infos.subReddit = req.params.sub;
                        view.render('subreddit',infos);
                    }else{
                        // There is not post in the collection
                        //
                        console.log('NO POST IN THE COLLECTION');
                        infos = index.sessionInfos(req,res);
                        infos.completeName = completeName;
                        infos.description = description;
                        infos.subReddit = req.params.sub;
                        view.render('subreddit',infos);
                    }
                })
            }
        });
    }
};