var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');
var index = require('.././index.js');
var validator = require('validator');



exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

    console.log('register')
    
    if (req.method === 'GET') {
        console.log('register get')

        User = keystone.list('User').model;
        console.log(User);
        
        var sessionVars = index.sessionInfos(req,res);
        view.render('register',{
            problem:false,
            connected:sessionVars[0],
            userEmail:sessionVars[1]
        });  

    }else if (req.method === 'POST'){
        console.log('register post')
        var User = keystone.list('User');
        //console.log(User);

        console.log(req.body.password)
        console.log(req.body.passwordSecond)
        console.log(req.body.email)

        // =================
        // VERIFICATIONS
        // =================
        // Passwords matching
        if(req.body.password !== req.body.passwordSecond){
            var sessionVars = index.sessionInfos(req,res);
            view.render('register',{
                problem:"The passwords do not match",
                connected:sessionVars[0],
                userEmail:sessionVars[1]
            });  
        // Passwords long enough
        }else if(req.body.password.length<5){
            var sessionVars = index.sessionInfos(req,res);
            view.render('register',{
                problem:"Your password is too short, 5 characters minimum please",
                connected:sessionVars[0],
                userEmail:sessionVars[1]
            });   
        // Email valid
        }else if(!validator.isEmail(req.body.email)){
            var sessionVars = index.sessionInfos(req,res);
            view.render('register',{
                problem:"Your email adress is not correct",
                connected:sessionVars[0],
                userEmail:sessionVars[1]
            });   
        }else{
            var User = keystone.list('User');
            User.model.findOne({email:req.body.email},function(err,person){
                console.log(err);
                // Username Not taken
                if(person){
                    console.log('taken');
                    var sessionVars = index.sessionInfos(req,res);
                    view.render('register',{
                        problem:"The email adress you used seems to have already been taken, please choose another one",
                        connected:sessionVars[0],
                        userEmail:sessionVars[1]
                    });   
                // =================
                // VERIFICATIONS OK, ADD USER
                // =================
                }else{
                    console.log('not taken');
                    var userPassword = req.body.password;
                    var userEmail = req.body.email;
                    var userUsername = req.body.username;
                    new User.model({
                        name: { first: 'super', last: 'swagg' },
                        email: userEmail,
                        password: userPassword,
                        username: userUsername,
                        canAccessKeystone: false
                    }).save();
                }
            })


        }



    }

    
}