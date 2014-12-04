var keystone = require('keystone'),
    User = keystone.list('User');
 
exports = module.exports = function(done) {
    new User.model({
        name: { first: 'Admin', last: 'User'},
        password: 'admin',
        email: 'super@super.fr',
        userName:'swagggou',
        isAdmin: true,
        canAccessKeystone:true
    }).save(done);
};