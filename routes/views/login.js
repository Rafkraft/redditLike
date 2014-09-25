var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');
var index = require('.././index.js');



exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    
    if (req.method === 'GET') {

        var sessionVars = index.sessionInfos(req,res);
        view.render('login',{
        connected:sessionVars[0],
        userEmail:sessionVars[1]
    });  
    }else if (req.method === 'POST') {

        if(!req.body.email || !req.body.password){
            var sessionVars = index.sessionInfos(req,res);
            view.render('login',{
                problem:"please fill the forms correctly",
                connected:sessionVars[0],
                userEmail:sessionVars[1]
            });  
        }else {
            var onSuccess = function(user) {
                if (req.query.from && req.query.from.match(/^(?!http|\/\/|javascript).+/)) {
                    res.redirect(req.query.from);
                } else if ('string' === typeof keystone.get('signin redirect')) {
                    res.redirect(keystone.get('signin redirect'));
                } else if ('function' === typeof keystone.get('signin redirect')) {
                    keystone.get('signin redirect')(user, req, res);
                } else {
                    res.redirect('/');
                }
            };
            var onFail = function() {
                console.log('onFail');
                var sessionVars = index.sessionInfos(req,res);
                view.render('login',{
                    problem:'Sorry, that email and password combo are not valid.',                
                    connected:sessionVars[0],
                    userEmail:sessionVars[1]
                });  
            };

            session.signin(req.body, req, res, onSuccess, onFail);
        }


    }   
    
}