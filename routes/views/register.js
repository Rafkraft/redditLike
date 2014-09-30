var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');
var index = require('.././index.js');
var validator = require('validator');



exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

    console.log('register')
    
    if (req.method === 'GET') {        
        if (typeof res.locals.user=="undefined"){
            view.render('register',index.sessionInfos(req,res));
        }else{
            view.render('/',index.sessionInfos(req,res));
        }
    }else if (req.method === 'POST'){
        console.log('register post')
        var User = keystone.list('User');

        // =================
        // VERIFICATIONS
        // =================

        // Username long enough
        if(req.body.username.length<4){
            req.flash('error', 'The username is too short, 4 characters minimum please');
            view.render('register',index.sessionInfos(req,res));

        // Passwords matching
        }else if(req.body.password !== req.body.passwordSecond){
            req.flash('error', 'The passwords do not match');
            view.render('register',index.sessionInfos(req,res));

        // Passwords long enough
        }else if(req.body.password.length<5){
            req.flash('error', 'Your password is too short, 5 characters minimum please');
            view.render('register',index.sessionInfos(req,res));

        // Email valid
        }else if(!validator.isEmail(req.body.email)){
            req.flash('error', 'Your email adress is not correct');
            view.render('register',index.sessionInfos(req,res));

        }else{
            var User = keystone.list('User');

            //Check if email is taken
            User.model.findOne({email:req.body.email},function(err,person){
                console.log(err);
                if(person){
                    req.flash('error', 'The email adress you chose seems to have already been taken, please choose another one');
                    view.render('register',index.sessionInfos(req,res));
                }else{

                    //Check if username is taken
                    User.model.findOne({userName:req.body.username},function(err,person){
                        console.log(err);
                        if(person){
                            req.flash('error', 'The username you chose seems to have already been taken, please choose another one');
                            view.render('register',index.sessionInfos(req,res));
                        }else{
                            
                            //=========================
                            //  VERIFICATION DONE, ADD USER
                            //=========================
                            var userPassword = req.body.password;
                            var userEmail = req.body.email;
                            var userUsername = req.body.username;

                            new User.model({
                                name: { first: 'super', last: 'swagg'},
                                email: userEmail,
                                password: userPassword,
                                userName: userUsername,
                                canAccessKeystone: false
                            }).save(function(error,data){                        
                                req.flash('info', 'Thank you for subscribing, you can now log in');
                                res.redirect('/login');
                            }); 
                        }
                    })
                }
            })
        }



    }

    
}