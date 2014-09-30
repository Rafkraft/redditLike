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
                console.log('found')
                mongoose.model('_'+req.params.sub).find(function(err,posts){
                    console.log(err);
                    console.log(posts)
                    infos = index.sessionInfos(req,res);
                    infos.posts = posts;
                    console.log(infos);
                    view.render('subreddit',infos);
                })
            }
        });
    
    }else if (req.method === 'POST') {



    }

};