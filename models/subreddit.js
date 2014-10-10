mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/my-project');
var _ = require('underscore');

var subreddits= [
    {
        name:'histoire',
        completeName:'Histoire',
        description:""
    },
    {
        name:'politique',
        completeName:'Politique',
        description:""
    },
    {
        name:'sante',
        completeName:'Santé',
        description:""
    },
    {
        name:'yoga',
        completeName:'Yoga',
        description:""
    }
];

// ===============
// comments
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
    id:Number
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


_.each(subreddits,function(value,index){
    mongoose.model("subredditsList").find({'name':value.name},function(err,sub){

        // If Subreddit is in subredditsList collection, instanciate new schema
        if(sub.length){
            console.log('found for '+value.name);

            // Declaring new model
            mongoose.model("_"+value.name, subredditPostSchema);


        // If not, add to 
        }else{
            console.log('not found for '+value.name+' adding now');
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


/*
var post = mongoose.model("_histoire", subredditPostSchema);

var p = new post({
    //  Post
    title:"SARKO IS BACK",
    type:"link",
    text: "super swagg bla bl bla bl abl ablablbla ",
    link:"",
    subReddit:"histoire",

    //  Author / Creation
    authorId:"542d2f06e01a70bf05b09de6",
    authorUsername:"swaggg",
    createdOn:new Date(),

    //  Comments / Votes / Rank
    comments:[],
    commentsNumber:0,
    upVotes:[],
    downVotes:[],
    rank:0,
})

p.save(function(err,post){
    console.log(post);
})
*/

