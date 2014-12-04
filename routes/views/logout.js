var keystone = require('keystone');
var session = require('../../node_modules/keystone/lib/session');

exports = module.exports = function(req, res) {
    var view = new keystone.View(req, res);
    
    session.signout(req, res, function() {
        res.redirect('/');
    });
    
}