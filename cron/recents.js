var CronJob = require('cron').CronJob;
var mongoose=require('mongoose');
var async=require('async');
var _=require('underscore');
var subRedditSchema = require('../models/./subreddit.js')

var recentCollection = new CronJob('10 * * * * 0-6', function(){
    setTimeout(function(){
        console.log('CRON: ADDING RECENTS POSTS');
        mongoose.model('subredditsList').find({ "active":true},"name",function(err,subs){
            var recents=new Array();
            _.each(subs,function(value,index){
                var curdate= new Date();
                mongoose.model('_'+value.name).find({},function(err,post){
                    _.each(post,function(value,index){
                        var postDate = new Date(value.createdOn)
                        // 4 days in milliseconds, to determine the recents ones
                        var delay=1000*60*60*24*4;
                        if(curdate.getTime()/delay-postDate.getTime()/delay<10){
                            value.comments=null;
                            value.timestamp=postDate.getTime()/1000;
                            recents.push(value);
                        }
                    });

                });
            })
            setTimeout(function(){
                var sortedRecent = _.sortBy(recents.slice(0, 40), function(recents){
                    return -recents.timestamp
                });
                //Adding to postslists.recent
                mongoose.model("lists", subRedditSchema.ListsSchema);
                mongoose.model('lists').findOne({ "name":"recents"},function(err,recent){
                    recent.posts=[];
                    _.each(sortedRecent,function(value,index){
                        recent.posts.push(value);
                    });
                    recent.save();
                });
            },5000);
        })
    },1000)
}, null, true  /*Start the job right now */ );




