var keystone = require('keystone'),
    middleware = require('./middleware'),
    importRoutes = keystone.importer(__dirname);
 

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
    }
    else {
        connected= true;
        userEmail= res.locals.user.email;
    }
    var tab = [connected,userEmail];

    return tab;
}


// Bind Routes
exports = module.exports = function(app) {
    app.get('/', routes.views.index);
    app.get('/login', routes.views.login);
    app.post('/login', routes.views.login);
    app.get('/logout', routes.views.logout);
    app.get('/register', routes.views.register);
    app.post('/register', routes.views.register);
}