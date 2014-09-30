var keystone = require('keystone')

var mongoose = require('mongoose');
var async_block = require('node-async');


exports.listSubreddits = function(callback){
    mongoose.model('subredditsList').find(function(err,subs){
        callback(null, subs);
    })
}

exports.doesSubredditExists = function(name){
    mongoose.model('subredditsList').find(function(err,subs){
        console.log(err);
        console.log(subs);
    })
}