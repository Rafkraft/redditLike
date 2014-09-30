var keystone = require('keystone'),
    middleware = require('./middleware'),
    importRoutes = keystone.importer(__dirname);

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
    views: importRoutes('./views')
};

exports.sessionInfos = function(req,res){
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
    return toReturn;
}


// Bind Routes
exports = module.exports = function(app) {
    app.get('/', routes.views.index);
    app.get('/login', routes.views.login);
    app.post('/login', routes.views.login);
    app.get('/logout', routes.views.logout);
    app.get('/register', routes.views.register);
    app.post('/register', routes.views.register);
    app.get('/account', routes.views.account);
    app.post('/account', routes.views.account);
    app.get('/r/:sub',routes.views.subreddit);
}

