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

var cookie_life = 0.5*3600000; // 0.5 hours to expire

router.get('/', function(req, res) {
    var db = req.db;
    db.bind('Curator');
    if (req.cookies.Spindle) {
        db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, user) {
            if (err) console.log(err);
            res.render('spindle', {login:true, data:user[0]});
        });
    }
    else res.render('index');
});

router.post('/login', function(req, res) {
    var db = req.db;
    db.bind('Curator');
    db.Curator.count({"LogName":req.body.logname}, function(err, cnt) {
        if (err) console.log(err);
        if (cnt == 1) {
            db.Curator.find({"LogName":req.body.logname}).toArray(function(err, user) {
                if (err) console.log(err);
                if (user[0].Password != req.body.pwd) { // invalid password
                            res.render('logout', { token:"Not Match" });
                }
                else { // Good log name and password
                    // setup token and cookie
                    var savetoken = settoken(req, user[0]);
                    var today = new Date();
                    var thisMS = today.getTime();
                    user[0].LoginRecord.push(Date().toString() + ", " + thisMS.toString());
                    db.Curator.update({"LogName":user[0].LogName}, {$set:{"Token":savetoken, "LoginRecord":user[0].LoginRecord}}, function(err) {
                        if (err) console.log(err);
                        res.cookie('Spindle', savetoken, { maxAge:cookie_life, httpOnly:true, path:'/' });
                        res.render('spindle', { login:true, data:user[0] });
                    });
                }
            });
        }
        else res.render('logout');
    });
});

router.get('/logout', function(req, res) {
    var db = req.db;
    db.bind('Curator');
/*
    var cookie = 'No Cookie';
    for ( var c in req.cookies ) {
            if (c == 'Spindle' && req.cookies[c] != '') { // found a Spindle cookie in browser
                cookie = req.cookies[c];
                break;
            }
    }
    if (cookie != 'No Cookie') {
*/
        db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, user) {
            if (err) console.log(err);
/*
            if (user.length == 1 && user[0].Token == req.cookies['Spindle']) { // good
                user[0].LoginRecord.push(user[0].LoginRecord.pop().split(', ')[0] + ", " + Date().toString());
                db.Curator.update({"Token":cookie}, {$set: {"Token":"", "LoginRecord":user[0].LoginRecord}}, function(err) {
                    res.clearCookie('Spindle','', {maxAge:0,path:'/'}); // Delete cookie in browser
                    res.render('logout', {token:'logout'});
                });
            }
            else if (user.length > 1) {
                console.log('Important Err: Identical token "'+req.cookies.Spindle+'" is used in '+user.length+' users.');
                res.render('logout');
            }
            else { // cookie/token not match each other
                res.clearCookie('Spindle','', {maxAge:0,path:'/'}); // Delete cookie in browser
                res.render('logout');
            }
        });
    }
*/
        var newrecord = user[0].LoginRecord.pop().split(', ')[0] + ', ' + Date().toString() + ', ' + 'Actions changing data in DB';
        user[0].LoginRecord.push(newrecord);
        db.Curator.update({"Token":req.cookies.Spindle}, {$set: {"Token":"", "LoginRecord":user[0].LoginRecord}}, function(err) {
            res.clearCookie('Spindle','', {maxAge:0,path:'/'}); // Delete cookie in browser
            res.render('logout', {token:'logout'});
        });
    });
});

router.post('/changepassword', function(req, res) {
    var db = req.db;
    db.bind('Curator');
    db.Curator.find({"Token":req.cookies.Spindle}).toArray(function(err, user) {
        if (err) console.log(err);
        if (user[0].Password == req.body.pwd) {
                    db.Curator.update({"Token":req.cookies['Spindle']}, {$set: {"Password": req.body.newpwd}}, function(err) {
                        if (err) console.log("Search Data Error: ", err);
                        res.send('Your password is changed.');
                    });
        }
        else res.send('<span style="color:red"><span style="font-size:125%">Invalid current password.</span><br /><br />Click Password link to try again.</span>');
    });
});

module.exports = router;
