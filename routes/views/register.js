var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');
var index = require('.././index.js');
var validator = require('validator');
var captchapng = require('captchapng');


exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);

    console.log('register')
    
    if (req.method === 'GET') {        
        if (typeof res.locals.user=="undefined"){
            
            var captchaImg = function(){
                var p = new captchapng(80,30,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
                p.color(115, 95, 197, 100);  // First color: background (red, green, blue, alpha)
                p.color(30, 104, 21, 255); // Second color: paint (red, green, blue, alpha)
                var img = p.getBase64();
                var imgbase64 = new Buffer(img,'base64');
                return imgbase64;
            }
            var valicode = new Buffer(captchaImg()).toString('base64');
              
            var infos = index.sessionInfos(req,res);
            //infos.validecode=validecode;
            console.log(valicode);
            console.log(infos);
            view.render('register',infos);     

        }else{
            view.render('index',index.sessionInfos(req,res));
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
                                adminSubreddits:[],
                                canAccessKeystone: false,
                                createdOn:new Date(),
                                description:"",
                                downVotes:0,
                                email: userEmail,   // custom
                                isAdmin: false,
                                name: { first: 'super', last: 'swagg'},
                                password: userPassword, // custom
                                posts:[],
                                upVotes:0,
                                userName: userUsername,   // custom
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