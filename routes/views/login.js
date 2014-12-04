var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');
var index = require('.././index.js');



exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    
    if (req.method === 'GET') {
        if (typeof res.locals.user=="undefined"){
            console.log('not connected');
            view.render('login',index.sessionInfos(req,res));
        }else{
            view.render('login',index.sessionInfos(req,res));
        }
    }else if (req.method === 'POST') {

        if(!req.body.email || !req.body.password){

            req.flash('error', 'please fill the forms correctly');
            view.render('login',index.sessionInfos(req,res));

        }else {
            var onSuccess = function(user) {
                if (req.query.from && req.query.from.match(/^(?!http|\/\/|javascript).+/)) {
                    console.log('super1')
                    res.redirect(req.query.from);
                } else if ('string' === typeof keystone.get('signin redirect')) {
                    console.log('super2')
                    res.redirect(keystone.get('signin redirect'));
                } else if ('function' === typeof keystone.get('signin redirect')) {
                    console.log('super3')
                    keystone.get('signin redirect')(user, req, res);
                } else {
                    console.log('super')
                    if(req.body.next){
                        res.redirect(req.body.next);
                    }else{
                        res.redirect("/");
                     }
                }
            };
            var onFail = function() {
                req.flash('error', 'Sorry, that email and password combo is not valid.');
                view.render('login',index.sessionInfos(req,res));

            };

            session.signin(req.body, req, res, onSuccess, onFail);
        }


    }   
    
}