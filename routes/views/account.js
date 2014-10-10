var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');
var index = require('.././index.js');
var validator = require('validator');



exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

    console.log('register')
    
    if (req.method === 'GET') {
        if (typeof res.locals.user!=="undefined"){
            view.render('account',index.sessionInfos(req,res));
        }else{
            view.render('/',index.sessionInfos(req,res));
        }

    }else if (req.method === 'POST'){
        console.log('register post')
        var User = keystone.list('User');

        // =================
        // VERIFICATIONS
        // =================
        
        // If username
        if(req.body.username.length>1){

            if (typeof res.locals.user=="undefined"){
                view.render('/',index.sessionInfos(req,res));

            // Are the two fields equals
            }else if(req.body.username !== req.body.usernameConfirmation){
                req.flash('error', 'The two usernames do not match');
                view.render('account',index.sessionInfos(req,res));

            // length > 4
            }else if (req.body.username.length<4){
                req.flash('error', 'The username is too short, 4 characters minimum please');
                view.render('account',index.sessionInfos(req,res));

            }else{
                // Does username already exist
                User.model.findOne({userName:req.body.username},function(err,person){
                    if(err){
                        console.log(err);
                        req.flash('error', 'There was an error during the process, please try again');
                        view.render('account',index.sessionInfos(req,res));  
                    }
                    if(person){
                        req.flash('error', 'This username is already taken, please choose another');
                        view.render('account',index.sessionInfos(req,res));

                    // =================
                    // EVERYTHING OK, NOW ADDING
                    // =================
                    }else{
                        User.model.findOne({userName:res.locals.user.userName},function(err,person){
                            if(err){
                                console.log(err);
                                req.flash('error', 'There was an error during the process');
                                view.render('account',index.sessionInfos(req,res));  
                            }
                            if(person){
                                person.userName = req.body.username;
                                person.save();
                                req.flash('info', 'The username has been updated !');
                                view.render('account',index.sessionInfos(req,res));
                            }
                        });
                    }
                });
            }
        }
    }   
}