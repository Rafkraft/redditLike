var keystone = require('keystone');
var _ = require('underscore');
var index = require('.././index.js');
var async = require('async');
var mongoose = require('mongoose');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

    //console.log(req.params.sub);

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
                view.res.send('{error:"collection does not exist"}')
            }else{
                mongoose.model('_'+req.params.sub).find(function(err,posts){
                    if(err){
                        console.log(err);
                    }
                       
                    //console.log(posts);
                    if(posts.length>0){
                        // There is at least 1 post in the collection
                        //
                        view.res.send(posts)   
                    }else{
                        // There is not post in the collection
                        //
                        view.res.send('{error:"there is no post in this collection"}')
                    }
                })
            }
        });
    }
};