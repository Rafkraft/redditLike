var keystone = require('keystone');


keystone.init({
    'name': 'Super !',

    'favicon': 'public/favicon.ico',
    'less': 'public',
    'static': ['public'],

    'views': 'templates/views',
    'view engine': 'jade',

    'auto update': true,
    'mongo': 'mongodb://localhost/my-project',

    'session': true,
    'auth': true,
    'user model': 'User',
    'cookie secret': 'hdezhyyCGYFTSY57shbhshuç!qçqi!u9NHSèqvsvqè(fè0SHHSBQGSQ9Y897SGYygxqt(§gébui"gs(§èD('
});
 
require('./models');



keystone.set('routes', require('./routes'));
 
keystone.start();