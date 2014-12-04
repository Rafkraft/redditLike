var keystone = require('keystone');
var User = keystone.list('User');
var index = require('.././index.js');


exports = module.exports = function(req, res) {
    console.log('INDEX RENDERED');
    var view = new keystone.View(req, res);
    view.render('index',index.sessionInfos(req,res));
}