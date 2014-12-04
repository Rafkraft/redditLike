var CronJob = require('cron').CronJob;
var mongoose=require('mongoose');
var async=require('async');
var _=require('underscore');
var subRedditSchema = require('../models/./subreddit.js')

var rankPosts = new CronJob('10 * * * * 0-6', function(){
        async.series([
            //Get list
            function(callback){
                mongoose.model('subredditsList').find(function(err,subs){
                    callback(null, subs);
                })
            }
        ],
        function(err, results){
            if(results[0]== null){
                console.log('CRON not found')
            }else{
                console.log("CRON: RANKING POSTS")
                //Get each post in each collections;
                _.each(results[0],function(value,index){
                    mongoose.model("_"+value.name).find(function(err,subs){                        
                        for (i = 0; i < subs.length; i++) {
        
                            // http://moz.com/blog/reddit-stumbleupon-delicious-and-hacker-news-algorithms-exposed
                            //delay: dates difference in hours
                            var delay=1000*60*60;
                            // a = milliseconds from 01/01/1970 to the post Date 
                            var a = new Date(subs[i].createdOn).getTime()/delay;
                            // b = milliseconds from 01/01/1970 to now 
                            var b = new Date(1970,1,1,0,0,0,0).getTime()/delay;
                            // t = difference between b and a
                            var t = a-b;

                            //x = vote difference
                            var x = subs[i].votesDifference;

                            var y;
                            if(x>0){
                                y=1;
                            }else if(x==0){
                                y=0;
                            }else if(x<0){
                                y=-1;
                            }

                            var z;
                            if(Math.abs(x)>=1){
                                z=Math.abs(x)+1;
                            }else if(Math.abs(x)<1){
                                z=1;
                            }
                            /* 
                            +9 votes = +60h, +99 votes = +120h, -9votes = -90h...
                            The bigger the factor is, the more the votes count
                            */
                            var factor = 60;
                            function rank(t,y,z){
                                var hours = t;
                                var log = Math.log(z)/Math.log(10);
                                var bonus = log*y*factor;
                                return t+bonus;
                            }

                            subs[i].rank =rank(t,y,z);
                            subs[i].save();
                        }

                    })
                });            
            }
        });
  }, null, true /* Start the job right now */
);
