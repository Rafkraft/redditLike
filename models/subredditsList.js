mongoose=require('mongoose');
var _ = require('underscore');
mongoose.connect('mongodb://localhost/my-project');

var Schema = mongoose.Schema;

var subreddits= ['histoire','politique','sante','yoga'];

var subredditsListSchema = new Schema({
    name:String,
    postsNumber:Number,
    commentsNumber:Number,
    createdOn:Date   
});

var sub = mongoose.model("subredditsList", subredditsListSchema);


_.each(subreddits,function(value,index){
    mongoose.model("subredditsList").find({'name':value},function(err,posts){
        if(posts.length){
            console.log('post : ');
            console.log(posts);
        }else{
            console.log('not found for '+value+' adding now');
        }
        console.log(err);
    });
})
/*

var s = new sub({name:"santé",postsNumber:0,commentsNumber:0,createdOn:new Date()})

s.save(function(err){
    console.log(err);
})

*/