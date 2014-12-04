var captchapng = require('captchapng');


exports = module.exports = function(req, res) {
	var view = new keystone.View(req, res);
	var captchaImg = function(){
	    var p = new captchapng(80,30,parseInt(Math.random()*9000+1000)); // width,height,numeric captcha
	    p.color(115, 95, 197, 100);  // First color: background (red, green, blue, alpha)
	    p.color(30, 104, 21, 255); // Second color: paint (red, green, blue, alpha)
	    var img = p.getBase64();
	    var imgbase64 = new Buffer(img,'base64');
	    return imgbase64;
	}
	var valicode = new Buffer(captchaImg()).toString('base64');

    infos = index.sessionInfos(req,res);
    infos.validecode=validecode;
	view.render('register',infos)
};