var keystone = require('keystone');
var _ = require('underscore');
var index = require('.././index.js');
var async = require('async');
var mongoose = require('mongoose');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

    console.log(req.params.sub);
    console.log(req.params.post);

    if (req.method === 'GET') {
        mongoose.model('_'+req.params.sub).find({ "urlTitle":req.params.post},function(err,post){
            if(err){
                console.log(err);
            }
               
            //console.log(posts);
            if(post.length>0){
                // There is at least 1 post in the collection
                //
                view.res.send(post)   
            }else{
                // There is not post in the collection
                //
                view.res.send('{error:"there is no post in this collection"}')
            }
        })
    }
};