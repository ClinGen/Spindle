var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Set mongodb
var mongo = require('mongoskin');
var db = mongo.db('mongodb://localhost:27017/Spindle?auto_reconnection=true&poolsize=3', {native_parse:true});

var routes = require('./routes/index');
var curators = require('./routes/curators');
var genes = require('./routes/genes');
var diseases = require('./routes/diseases');
var curations = require('./routes/curations');

var app = express();
var token = require('./private/js/token.js');
var settoken = require('./private/js/settoken.js');
var cookie_life = require('./private/js/cookie_life.js');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('Spindle'));
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, ‘/add’)));

// Access the mongodb
app.use(function(req, res, next) {
    req.db = db;
    next();
});


/*
// check cookie
app.all('*', function(req, res, next) {
    //console.log("Read in app, req.url:", req.url);
    if (req.url != '/favicon.ico') {

        console.log("Read in app.all, req.cookies.Spindle:  ", req.cookies.Spindle);

        if (!req.cookies.Spindle && (req.url != '/' || req.url != '/login')) res.render('logout');
        else {
            var db = req.db;
            db.bind('Curator');

            db.Curator.find({"Token":req.cookies['Spindle']}).toArray(function(err, user) {
                if (err) console.log(err);
                var today = new Date();
                var thisMS = today.getTime();
                var cookieLife = cookie_life();
                var lastLogin = user[0].LoginRecord.pop().split(', ');
                if (thisMS-parseInt(lastLogin[1]) > cookieLife.CookieLife) {
                    //res.render('logout', { token:'expired' });
                    //cookieCheck = 'expired';
                }
                //else if (req.url != '/logout' && req.url != '/' && req.url != '/login') {
                //    settoken(req, res, null);
                //}
                //cookieCheck = 'valid';

                //console.log("In check expiration, cookieCheck setup as:  ", cookieCheck);

            });
        }

        console.log("Read in app.all, url:  ", req.url);
        console.log("Read in app.all, cookie:  ", req.cookies.Spindle);


        next();
    }
});
*/

// set routes
app.use('/', routes);
app.use('/login', routes);
app.use('/logout', routes);
app.use('/changepassword', routes);
app.use('/genes', genes);
app.use('/curators', curators);
app.use('/diseases', diseases);
app.use('/curations', curations);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
