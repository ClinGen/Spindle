var express = require('express');
var router = express.Router();
var token = require('../private/js/token.js');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

router.use(cookieParser('Spindle'));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//router.Router.get('/', function(req, res) {
router.get('/', function(req, res) {
    res.render('index');
});

/*
router.get('/login', function(req, res) {
    var db = req.db;
    db.bind('Curator');
    db.Curator.find({"LogName": req.query.logname, "Password": req.query.pwd}).toArray(function(err, items) {
        if (err) console.log("Search Data Error: ", err);
        //console.log(items.length);
        if (items.length == 1 && items[0].Token !== "" && items[0].Token != req.cookies.Spindle) { // Invalid login
                //delete cookie in browser and token in db
                res.clearCookie('Spindle','', {maxAge:0,path:'/'});
                db.Curator.update({"LogName":items[0].LogName}, {$set:{"Token":""}}, function(err) {
                    if (err) console.log(err);
                    else res.render('logout', { token:false }); // redo login
                });
        }
        else {
            if (items.length === 1) {
                var today = new Date();
                var thisMS = today.getTime();
                var expired =true;
                if (items[0].Token !== "") { // check expiration
                    var lastLogin = items[0].LoginRecord[items[0].LoginRecord.length - 1].split(', ')[1];
                    var interval = thisMS - parseInt(lastLogin);
                    if (interval < 72000000) expired = false;
                }

                if (expired && items[0].Token === "") {
                    // get token and save it as a cookie in browser
                    items[0].Token = items[0].LogName + '@' + token(items[0].ContactInfo);
                    var cookie_life = 5*3600000; // 5 hours to expire
                    res.cookie('Spindle', items[0].Token, { maxAge:cookie_life, httpOnly:true, path:'/' });

                    //  set login record
                    var newRecord = [];
                    items[0].LoginRecord.push(Date().toString() + ", " + thisMS.toString());
                    // save token and login record in db
                    db.Curator.update({"LogName":items[0].LogName}, {$set: {"Token":items[0].Token,"LoginRecord":items[0].LoginRecord}}, function(err) {
                        if (err) console.log('Token add error: ', err);
                    });
                }
            }

            // setup webpage
            res.render('index', { login:true, data: items[0] });
        }
    });
});
*/
router.post('/login', function(req, res) {
    var check = token(req, res);
    if (check === 'Invalid Input Data') {
        res.render('logout', {token:false});
    }
    else if (check === 'Expired') {
        res.render('logout', {token:'expired'});
    }
    else if (check.instanceof(Object)) {

        // setup webpage
        res.render('index', { login:true, data: check });
    }

/*
    var db = req.db;
    db.bind('Curator');
    db.Curator.find({"LogName": req.body.logname, "Password": req.body.pwd}).toArray(function(err, items) {


        if (err) console.log("Search Data Error: ", err);
        //console.log(items.length);
        if (items.length == 1 && items[0].Token !== "" && items[0].Token != req.cookies.Spindle) { // Invalid login
                //delete cookie in browser and token in db
                res.clearCookie('Spindle','', {maxAge:0,path:'/'});
                db.Curator.update({"LogName":items[0].LogName}, {$set:{"Token":""}}, function(err) {
                    if (err) console.log(err);
                    else res.render('logout', { token:false }); // redo login
                });
        }
        else {
            if (items.length === 1) { // log name and password match each other

                var today = new Date();
                var thisMS = today.getTime();

                var expired = true;

                if (items[0].Token !== "") { // check expiration
                    var lastLogin = items[0].LoginRecord[items[0].LoginRecord.length - 1].split(', ')[1];
                    var interval = thisMS - parseInt(lastLogin);
                    if (interval < 72000000) expired = false;
                }

                var expired = token('check', items);
                if (expired || items[0].Token === "") { // renew token and login record when expired or brend new
                    // get token and save it as a cookie in browser
                    items[0].Token = token(items[0], req, res);
                    var cookie_life = 2*3600000; // 2 hours to expire
                    res.cookie('Spindle', items[0].Token, { maxAge:cookie_life, httpOnly:true, path:'/' });

                    //  set login record
                    var newRecord = [];
                    items[0].LoginRecord.push(Date().toString() + ", " + thisMS.toString());
                    // save token and login record in db
                    db.Curator.update({"LogName":items[0].LogName}, {$set: {"Token":items[0].Token,"LoginRecord":items[0].LoginRecord}}, function(err) {
                        if (err) console.log('Token add error: ', err);
                    });
                }
            }
    });
*/
});

router.get('/logout', function(req, res) {
    var db = req.db;
    db.bind('Curator');

    //var record = [];
    db.Curator.find({"Token": req.cookies.Spindle}).toArray(function(err, items) {
        items[0].LoginRecord.push(items[0].LoginRecord.pop().split(', ')[0] + ", " + Date().toString());
        db.Curator.update({"Token":req.cookies.Spindle}, {$set: {"Token":"", "LoginRecord":items[0].LoginRecord}}, function(err) {
            res.clearCookie('Spindle','', {maxAge:0,path:'/'}); // Delete cookie in browser
            res.render('logout', {token:true});
        });
    });
});

router.post('/changepassword', function(req, res) {
    var db = req.db;
    db.bind('Curator');

    console.log(req.cookies.Spindle);
    db.Curator.update({"Token":req.cookies.Spindle}, {$set: {"Password": req.body.newpwd}}, function(err, items) {
        if (err) { // login failed
            console.log("Search Data Error: ", err);
        }
    });
    console.log("Password is changed.");

    db.Curator.find({"Token": req.cookies.Spindle}).toArray(function(err, items) {
        if (err) { // login failed
            console.log("Search Data Error: ", err);
        }
        res.render('index', { login:true, pwd:true, data: items[0] });
    });
});

module.exports = router;
