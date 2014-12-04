var CronJob = require('cron').CronJob;
var mongoose=require('mongoose');
var async=require('async');
var _=require('underscore');
var subRedditSchema = require('../models/./subreddit.js')

var popularCollection = new CronJob('10 * * * * 0-6', function(){
    setTimeout(function(){
        console.log('CRON: ADDING POPULARS POSTS');
        mongoose.model('subredditsList').find({ "active":true},"name",function(err,subs){
            var populars=new Array();
            _.each(subs,function(value,index){
                var curdate= new Date();
                mongoose.model('_'+value.name).find({},function(err,post){
                    _.each(post,function(value,index){
                        var postDate = new Date(value.createdOn)
                        // 12 days in milliseconds, to determine the populars ones
                        var delay=1000*60*60*24*12;
                        if(curdate.getTime()/delay-postDate.getTime()/delay<10){
                            value.comments=null;
                            populars.push(value);
                        }
                    });

                });
            })
            setTimeout(function(){
                var sortedPopulars = _.sortBy(populars, function(populars){
                    return populars.rank
                });
                //Adding to postslists.populars
                mongoose.model("lists", subRedditSchema.ListsSchema);
                mongoose.model('lists').findOne({ "name":"populars"},function(err,populars){
                    populars.posts=[];
                    _.each(sortedPopulars.slice(0,40),function(value,index){
                        populars.posts.push(value)
                    })
                    populars.save();
                });
            },5000);
        })
    },1000)
}, null, true  /*Start the job right now */ );




