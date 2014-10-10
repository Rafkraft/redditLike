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
                console.log('not found')
            }else{
                console.log('found');

                var completeName = results[0].completeName;
                var description =  results[0].description;
                
                mongoose.model('_'+req.params.sub).find(function(err,posts){
                    if(err)
                        console.log(err);
                    console.log(posts);
                    console.log('____________');
                    if(posts.length>0){
                        // There is at least 1 post in the collection
                        //
                        console.log('there are posts');
                        infos = index.sessionInfos(req,res);
                        infos.completeName = completeName;
                        infos.description = description;
                        infos.subReddit = req.params.sub;
                        view.render('subreddit',infos);
                    }else{
                        // There is not post in the collection
                        //
                        console.log('there is no post yet');
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