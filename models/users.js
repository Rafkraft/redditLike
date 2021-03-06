var keystone = require('keystone'),
    Types = keystone.Field.Types;
var mongoose = require('mongoose');


var Schema = mongoose.Schema;

// ===============
// POST (recap in the user object) schema
// ===============

var Post = mongoose.Schema;

var postSchema = new Post({
    createdOn:Date,
    id:Number,
    subReddit:String,
    postId:Schema.ObjectId
});


var User = new keystone.List('User');

User.add({
    name: { type: Types.Name, required: true, index: true },
    email: { type: Types.Email, initial: true, required: true, index: true },
    userName: { type:String, initial:true, required:true },
    password: { type: Types.Password, initial: true },
    canAccessKeystone: { type: Boolean, initial: true },
    isAdmin: { type:Boolean, initial:true}
});
 
User.schema.add({
    userName: String,
    isAdmin: Boolean,
    adminSubreddits: Array,
    createdOn: Date,
    description: String,
    upVotes: Number,
    downVotes: Number,
    posts: [postSchema]
});


User.register();






