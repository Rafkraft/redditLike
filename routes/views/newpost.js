var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');
var index = require('.././index.js');
var validator = require('validator');

var queries = require('.././queries.js');




exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

    console.log('queries.listCollections')
    console.log(queries.listSubreddits())
    console.log('queries.listCollections')

    if (req.method === 'GET') {

        
        console.log(users);
        console.log('users');

        console.log('new post get');      
        if (typeof res.locals.user=="undefined"){
            view.render('/',index.sessionInfos(req,res));
        }else{
            view.render('newpost',index.sessionInfos(req,res));
        }
    }else if (req.method === 'POST'){
        console.log('new post post')
        console.log(req.body.type)
        console.log(req.body.title)
        console.log(req.body.link)
        console.log(req.body.text)
        console.log(res.locals.user);
        // =================
        // VERIFICATIONS
        // =================

        // Username long enough
        if (typeof res.locals.user=="undefined"){
            req.flash('error', 'You are not connected');
            view.render('newpost',index.sessionInfos(req,res));
        // Passwords matching
        }



    }

    
}
