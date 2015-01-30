var express = require('express');
var router = express.Router();
//var token = require('../private/js/token.js');
var settoken = require('../private/js/settoken.js');
//var getClientIP = require('../private/js/getClientIP.js');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

router.use(cookieParser('Spindle'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


router.get('/', function(req, res) {
    res.render('index');
});

router.post('/login', function(req, res) {
    var db = req.db;
    db.bind('Curator');
    db.Curator.count({"LogName":req.body.logname}, function(err, cnt) {
        if (err) console.log(err);
        if (cnt == 1) { // find a unique log name
            db.Curator.find({"LogName":req.body.logname}).toArray(function(err, user) {
                if (err) console.log(err);
                if (user[0].Password != req.body.pwd) { // invalid password
                    res.render('logout', { token:"Not Match" });
                }
                else { // Good log name and password
                    // setup token and cookie
                    settoken(req, res, user[0]);

                    //setup login record
                    var today = new Date();
                    var thisMS = today.getTime();
                    user[0].LoginRecord.push(Date().toString() + ", " + thisMS.toString());
                    db.Curator.update({"LogName":user[0].LogName}, {$set:{"LoginRecord":user[0].LoginRecord}}, function(err) {
                        if (err) console.log(err);
                        res.render('spindle', { login:true, data:user[0] });
                    });
                }
            });
        }
        else res.render('logout');
    });
});

/*
router.route('/')
.get(function(req, res) { res.render('index'); })
.post(function(req,res) {
    var db = req.db;
    db.bind('Curator');
    db.Curator.count({"LogName":req.body.logname}, function(err, cnt) {
        if (err) console.log(err);
        if (cnt == 1) { // find a unique log name
            db.Curator.find({"LogName":req.body.logname}).toArray(function(err, user) {
                if (err) console.log(err);
                if (user[0].Password != req.body.pwd) { // invalid password
                    res.render('logout', { token:"Not Match" });
                }
                else { // Good log name and password
                    // setup token and cookie
                    console.log(user[0].LogName);
                    settoken(req, res, user[0]);

                    //setup login record
                    var today = new Date();
                    var thisMS = today.getTime();
                    user[0].LoginRecord.push(Date().toString() + ", " + thisMS.toString());
                    db.Curator.update({"LogName":user[0].LogName}, {$set:{"LoginRecord":user[0].LoginRecord}}, function(err) {
                        if (err) console.log(err);
                        res.render('spindle', { login:true, data:user[0] });
                    });
                }
            });
        }
        else res.render('logout');
    });
});
*/
router.get('/logout', function(req, res) {

    console.log('In logout read cookie:', req.cookies.Spindle);

    var db = req.db;
    db.bind('Curator');
    db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, user) {
            if (err) console.log(err);
            if (user.length == 1) { // good
                user[0].LoginRecord.push(user[0].LoginRecord.pop().split(', ')[0] + ", " + Date().toString());
                db.Curator.update({"Token":req.cookies.Spindle}, {$set: {"Token":"", "LoginRecord":user[0].LoginRecord}}, function(err) {
                    res.clearCookie('Spindle','', {maxAge:0,path:'/'}); // Delete cookie in browser
                    res.render('logout', {token:'logout'});
                });
            }
            else { // cookie/token not match each other
                res.clearCookie('Spindle','', {maxAge:0,path:'/'}); // Delete cookie in browser
                res.render('logout');
            }
    });
});

router.post('/changepassword', function(req, res) {
    var db = req.db;
    db.bind('Curator');
    db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, user) {
        if (err) console.log(err);
        if (user) {
            if (user[0].Password == req.body.pwd) {
                    db.Curator.update({"Token":req.cookies['Spindle']}, {$set: {"Password": req.body.newpwd}}, function(err) {
                        if (err) console.log("Search Data Error: ", err);
                        res.send('Your password is changed.');
                    });
            }
        }
        else res.render('logout');
    });
});

module.exports = router;
