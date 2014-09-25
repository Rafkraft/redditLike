var keystone = require('keystone');
 
exports = module.exports = function(req, res) {
    console.log("_____________ REQ");
    console.log(req);
    console.log("_____________ RES");
    console.log(res);
    
    var view = new keystone.View(req, res);

    if(req.user!="undefined")
        view.render('infos',{userEmail:"lol"});
    else
        view.render('index');

}