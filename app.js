var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

// Set mongodb
var mongo = require('mongoskin')
var db = mongo.db('mongodb://localhost:27017/Spindle?auto_reconnection=true&poolsize=3', {native_parse:true})

var routes = require('./routes/index')
var curators = require('./routes/curators')
var genes = require('./routes/genes')
var diseases = require('./routes/diseases')
var variants = require('./routes/variants')
var curations = require('./routes/curations')
var observations = require('./routes/observations')
var casegroupstudy = require('./routes/casegroupstudy')
var functionaldataanalysis = require('./routes/functionaldataanalysis')
var key_data = require('./private/js/key_data.js')
var settoken = require('./private/js/settoken.js')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser('Spindle'))
app.use(express.static(path.join(__dirname, 'public')))
//app.use(express.static(path.join(__dirname, ‘/add’)))

// Access the mongodb
app.use(function(req, res, next) {
    req.db = db
    next()
})
// Authentication: check Spindle cookie and expiration
app.all('/*', function(req, res, next) {
    if (req.cookies.Spindle) { // there is a Spindle cookie in browser
        var cookie_data = req.cookies.Spindle.split('-')
        db.collection('Curator').find({"Token":req.cookies.Spindle}).toArray(function(err, user) { // check if cookie and token identical
            if (err) {
                throw err
                return
            }
            if (user && user.length==1) { // identical cookie
                var today = new Date()
                var thisMS = today.getTime()
                var last_index = user[0].LoginRecord.length-1
//console.log(user[0].LoginRecord.length, last_index);
                var current_record = user[0].LoginRecord[last_index]
                var login_life = thisMS - parseInt(current_record.Logout)
                var session_life = thisMS - parseInt(cookie_data[1])
                if (login_life <= key_data.Login_Life && session_life <= key_data.Session_Life) { // the current login is not expired
//console.log("here");
                    // logout before cookie expired
                    if (req.url.indexOf('ogout') > -1) {
                        db.collection('Curator').find({"Token":req.cookies.Spindle}).toArray(function(err, user_logout) {
                            if (err) {
                                throw err
                                return
                            }
                            var newrecord = user_logout[0].LoginRecord.pop()
                            //var lastaction = newrecord.Action[newrecord.Action.length-1]
                            newrecord.Logout = Date().toString()
                            //newrecord.Action.push('Logout')
                            db.collection('Curator').update({"LogName":user_logout[0].LogName}, {$set:{"Token":""}}, function(err) {
                                if (err) {
                                    throw err
                                    return
                                }
                                db.collection("Curator").update({"LogName":user_logout[0].LogName},{$pop:{"LoginRecord":1}}, function(err) {
                                    if (err) {
                                        throw err
                                        return
                                    }
                                    db.collection('Curator').update({"LogName":user_logout[0].LogName},{$push:{"LoginRecord":newrecord}}, function(err) {
                                        if (err) {
                                            throw err
                                            return
                                        }
                                        res.clearCookie('Spindle',null, {maxAge:0, httpOnly:true, path:'/'}) // Delete cookie in browser
                                        res.clearCookie('genesymbol',null, {path:'/'})
                                        res.clearCookie('diseaseterm',null, {path:'/'})
                                        res.render('logout', {token:'logout'})
                                    })
                                })
                            })
                        })
                    }
                    //else if (req.url == '/') res.render('spindle', {login:true, user:user[0]})
                    else { // other actions
                        // reset token and cookie for each action
                        var savetoken = settoken(req, user[0])
                        db.collection('Curator').update({"LogName":user[0].LogName}, {$set:{"Token":savetoken}}, function(err) {
                            if (err) {
                                throw err
                                return
                            }
                            res.cookie('Spindle', savetoken, { httpOnly:true, path:'/' })
                            //req.admin_data = {""}
                            if (req.url == '/') res.render('spindle', {login:true, user:user[0]})
                            else next()
                        })
                    }
                }
                else { // login life pass away, faced to logout
                    res.clearCookie('Spindle',null, {maxAge:0, httpOnly:true, path:'/'})
                    res.render('logout', {token:'expired'})
                }
            }
            else {
                res.clearCookie('Spindle',null, {maxAge:0, httpOnly:true, path:'/'})
                res.render('logout', {token:'Unknown err'})
            }
        })
    }
    else if (req.url == '/') res.sendFile(process.cwd() + '/views/index.html')
    else if (req.url == '/login') next()
    //else if (req.url == '/login' || req.url == '/') next()
    else res.render('logout')
})

// set routes
app.use('/', routes)
app.use('/login', routes)
app.use('/logout', routes)
app.use('/changepassword', routes)
app.use('/Lastcuration', routes)
app.use('/genes', genes)
app.use('/curators', curators)
app.use('/diseases', diseases)
app.use('/variants', variants)
app.use('/curations', curations)
app.use('/observations', observations)
app.use('/casegroupstudy', casegroupstudy)
app.use('/functionaldataanalysis', functionaldataanalysis)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {}
    })
})

module.exports = app
