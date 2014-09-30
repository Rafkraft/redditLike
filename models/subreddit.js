mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/my-project');
var _ = require('underscore');

var subreddits= [
    'histoire',
    'politique',
    'sante',
    'yoga'
];

// ===============
// Subreddits Schemas
// ===============

var Schema = mongoose.Schema;

var subredditPostSchema = new Schema({
    type:String,
    title:String,
    link:String,
    content:String,
    commentsNumber:Number,
    comments:[],
    author:String,
    authorId:String,
    upVotes:[],
    downVotes:[],
    rank:Number,
    createdOn:Date   
});


// ===============
// subredditsList Collection
// ===============

var Schema = mongoose.Schema;
var subredditsListSchema = new Schema({
    name:String,
    postsNumber:Number,
    commentsNumber:Number,
    createdOn:Date   
});
mongoose.model("subredditsList", subredditsListSchema);


_.each(subreddits,function(value,index){
    mongoose.model("subredditsList").find({'name':value},function(err,sub){
        // If Subreddit is in subredditsList collection, instanciate new schema
        if(sub.length){
            console.log('found for '+value);
            // Does the _subreddit colelction exists ?
            mongoose.model("_"+value, subredditPostSchema);
        // If not, add to 
        }else{
            console.log('not found for '+value+' adding now');
            var sub = mongoose.model("subredditsList", subredditsListSchema);
            var s = new sub({
                name:value,
                postsNumber:0,
                commentsNumber:0,
                createdOn:new Date()
            })
            s.save(function(err){
                console.log(err);
            })
            mongoose.model("_"+value, subredditPostSchema);
        }
        //console.log(err);
    });
})
