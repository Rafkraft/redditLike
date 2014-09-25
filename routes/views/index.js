var keystone = require('keystone');
var User = keystone.list('User');
var index = require('.././index.js');


exports = module.exports = function(req, res) {
    console.log('INDEX RENDERED');

    var view = new keystone.View(req, res);

    var sessionVars = index.sessionInfos(req,res);
    console.log(sessionVars[0]);
    view.render('index',{
        connected:sessionVars[0],
        userEmail:sessionVars[1]
    });    
}