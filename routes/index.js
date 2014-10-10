var keystone = require('keystone'),
    middleware = require('./middleware'),
    importRoutes = keystone.importer(__dirname);
var async = require('async');
var mongoose = require('mongoose');

var flash = require('flash');
 

// Common Middleware
keystone.pre('routes', middleware.initErrorHandlers);
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);
 


// Handle 404 errors
keystone.set('404', function(req, res, next) {
    res.notfound();
});
 

// Handle other errors
keystone.set('500', function(err, req, res, next) {
    var title, message;
    if (err instanceof Error) {
        message = err.message;
        err = err.stack;
    }
    res.err(err, title, message);
});



// Load Routes
var routes = {
    views: importRoutes('./views'),
    feed: importRoutes('./feed')
};

exports.sessionInfos = function(req,res){
    var canReturn= false;

    if (typeof res.locals.user=="undefined"){
        connected= false;
        userEmail= null;
        userName=null;
    }
    else {
        connected= true;
        userEmail= res.locals.user.email;
        userName=res.locals.user.userName;
    }
    var toReturn = {
        error:req.flash('error')[0] ,
        info:req.flash('info')[0] ,
        connected:connected,
        userEmail:userEmail,
        userName:userName
    };

    if(req.params.sub){
        toReturn.subReddit = req.params.sub
    
        async.series([
            function(callback){
                mongoose.model('subredditsList').findOne({ "name":req.params.sub},function(err,subs){
                    callback(null, subs);
                })
            }
        ],
        function(err, results){
            if(results[0]== null){
                console.log('not found')
            }else{
                console.log('found');
                toReturn.completeName = results[0].completeName;
                toReturn.description = results[0].description;
                toReturn.subReddit = results[0].name;
                canReturn=true
            }
        });
    }else{
        canReturn=true;
    }
    while(!canReturn){
        return toReturn;
    }    
}


// Bind Routes
exports = module.exports = function(app) {
    //Feeds
    app.get('/feed/:sub',routes.feed.subreddit);
    app.get('/feed/:sub/:post',routes.feed.post);

    app.get('/', routes.views.index);
    app.get('/login', routes.views.login);
    app.post('/login', routes.views.login);
    app.get('/logout', routes.views.logout);
    app.get('/register', routes.views.register);
    app.post('/register', routes.views.register);
    app.get('/account', routes.views.account);
    app.post('/account', routes.views.account);
    app.get('/r/:sub',routes.views.subreddit);
    app.post('/r/:sub',routes.views.subreddit);
    app.get('/r/:sub/newpost',routes.views.newpost);
    app.post('/r/:sub/newpost',routes.views.newpost);
    app.post('/r/:sub/newVote',routes.views.newVote);

    app.get('/r/:sub/:post',routes.views.post);
    app.post('/r/:sub/:post',routes.views.post);


}



