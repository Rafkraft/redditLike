mongoose=require('mongoose');
//mongoose.connect('mongodb://localhost/my-project');
var _ = require('underscore');


// ===============
// subReddits List
// ===============

var subreddits= [
    {
        name:'histoire',
        completeName:'Histoire',
        description:"balbazld hza guazpuo guazjpiougyid lapioguyibj ijpzaogiyiho gauizygoauz"
    },
    {
        name:'politique',
        completeName:'Politique',
        description:"balbazld hza guazpuo guazjpiougyid lapioguyibj ijpzaogiyiho gauizygoauz balbazld hza guazpuo guazjpiougyid lapioguyibj ijpzaogiyiho gauizygoauzbalbazld hza guazpuo guazjpiougyid lapioguyibj ijpzaogiyiho gauizygoauz"
    },
    {
        name:'sante',
        completeName:'Santé',
        description:""
    },
    {
        name:'yoga',
        completeName:'Yoga',
        description:"balbazld hza guazpuo guazjpiougyid lapioguyibj ijpzaogiyiho gauizygoauz balbazld hza guazpuo guazjpiougyid lapioguyibj ijpzaogiyiho gauizygoauz"
    }
];

// ===============
// Comments schema
// ===============

var Comment = mongoose.Schema;

var commentSchema = new Comment({
    createdOn:Date,
    userName:String,
    userId:String,
    content:String,
    upVotes:[],
    downVotes:[],
    upVotesNumber:Number,
    downVotesNumber:Number,
    commentId:Number,
    inResponseTo:Number
});

// ===============
// Subreddits Posts Schemas
// ===============

var Schema = mongoose.Schema;

// Declaring new schema
var subredditPostSchema = exports.subredditSchema = new Schema({
    //  Post
    title:String,
    urlTitle:String,
    type:String,
    text: String,
    link:String,
    subReddit:String,
    active:Boolean,

    //  Author / Creation
    authorId:Schema.ObjectId,
    authorUsername:String,
    createdOn:Date,

    // Comments / Votes / Rank
    comments:[commentSchema],
    commentsNumber:Number,
    upVotes:[],
    downVotes:[],
    votesDifference:Number,
    rank:Number,
});

// ===============
// subredditsList Collection Schema
// ===============

var ListSchema = mongoose.Schema;
var subredditsListSchema = new ListSchema({
    //  Basic infos
    name:String,
    completeName:String,
    description:String,
    createdOn:Date,
    active:Boolean,

    // Activity
    activity:Number,
    postsNumber:Number,
    lastPost:[],
    commentsNumber:Number,
    lastComment:[]
    
});
mongoose.model("subredditsList", subredditsListSchema);

// For each subreddit element, verify that it is in the subredditList collection, if not, add it. Then, create mongoose models
_.each(subreddits,function(value,index){
    mongoose.model("subredditsList").find({'name':value.name},function(err,sub){

        // If Subreddit is in subredditsList collection, instanciate new schema
        if(sub.length){
            console.log('found for subReddit '+value.name);

            // Declaring new model
            mongoose.model("_"+value.name, subredditPostSchema);


        // If not, add to 
        }else{
            console.log('not found for subReddit '+value.name+', adding now');
            var sub = mongoose.model("subredditsList", subredditsListSchema);
            var s = new sub({
                name:value.name,
                description:value.description,
                completeName:value.completeName,
                createdOn:new Date(),
                activity:0,
                active:true,
                postsNumber:1,
                lastPost:[],
                commentsNumber:0,
                lastComment:[]
            })
            s.save(function(err){
                console.log(err);

                // Declaring new model
                mongoose.model("_"+value.name, subredditPostSchema);

            })
        }
        if(err)
            console.log(err);
    });
})

//=================
//  POSTS LISTS (popular/recents....)
//=================


var PostSchema = mongoose.Schema;
var ListsSchema = exports.ListsSchema = new PostSchema({
    name:String,
    posts:[]
});
mongoose.model("Lists", ListsSchema);

var lists=["recents","populars","lastComments"];
_.each(lists,function(value,index){
    mongoose.model("Lists").findOne({'name':value},function(err,list){
        if(list==null){
            console.log('not found for List '+value)
            var PL = mongoose.model("Lists", ListsSchema);
            var pl = new PL({
                name:value,
                posts:[]
            })
            pl.save();
        }else{
            console.log('found for Lists '+value)
        }
    }); 
})

