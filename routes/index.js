var express = require('express')
var router = express.Router()
var settoken = require('../private/js/settoken.js')
var key_data = require('../private/js/key_data.js')

var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

router.use(cookieParser('Spindle'))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

var cookie_life = key_data.Cookie_Life
//var cookie_life = 10*3600000; // 10 hours to expire
/*
router.get('/', function(req, res) {
    var db = req.db
    //db.bind('Curator')
    if (req.cookies.Spindle) {
        db.collection('Curator').find({"Token":req.cookies.Spindle}).toArray(function(err, user) {
            if (err) {
                throw err
                return
            }
            if (user && user.length == 1) {
                res.render('spindle', {login:true, user:user[0]})
            }
            else res.render('logout', { token:'expired' })
        });
    }
    else {
        res.sendFile(process.cwd() + '/views/index.html')
    }
})
*/
router.post('/login', function(req, res) {
    var db = req.db
    //db.bind('Curator');
    db.collection('Curator').count({"LogName":req.body.logname}, function(err, cnt) {
        if (err) {
            console.log(err)
            throw err
            return
        }
        if (cnt == 1) {
            db.collection('Curator').find({"LogName":req.body.logname}).toArray(function(err, user) {
                if (err) {
                    throw err
                    return
                }
                if (user[0].Password != req.body.pwd) { // invalid password
                    res.cookie("Spindle",null, {maxAge:0,path:"/"})
                    res.render('logout', { token:"Not Match" })
                }
                else if (user[0].Active != 'Yes') {
                    res.cookie("Spindle",null, {maxAge:0,path:"/"})
                    res.render('logout', { token:"Not Active" })
                }
                else { // Good log name and password
                    // setup token and cookie
                    var savetoken = settoken(req, user[0])
                    var today = new Date()
                    var thisMS = today.getTime()
                    //user[0].LoginRecord.push(Date().toString() + ", " + thisMS.toString());
                    var newrecord = {
                        "Login": Date().toString(),
                        "Logout": thisMS.toString(),
                        "Action":[]
                    }
                    //user[0].LoginRecord.push(newrecord)
                    db.collection('Curator').update({"LogName":user[0].LogName}, {$set:{"Token":savetoken}}, function(err) {
                        if (err) {
                            throw err
                            return
                        }
                        db.collection('Curator').update({"LogName":user[0].LogName},{$push:{"LoginRecord":newrecord}}, function(err) {
                            if (err) {
                                throw err
                                return
                            }
                        })
                        res.cookie('Spindle', savetoken, { httpOnly:true, path:'/' })

                        /*action = false
                        for (var i=user[0].LoginRecord.length-1; i>=0; i--) {
                            if (user[0].LoginRecord[i].Action.length > 0 ) {
                                action = true
                                break
                            }
                        }*/
                        res.render('spindle', { login:true, user:user[0] })
                    })
                }
            })
        }
        else res.render('logout', {token:'Not Match'});
    })
})
/*
router.get('/logout/:reason?', function(req, res) {
log("read in: ", req.url)
    if (req.params.reason == 'expired') res.render('logout', {token:'expired'})
    else if (req.params.reason == 'error') res.render('logout', {token:"Unknown err"})
    else if (req.cookies.Spindle) {
        var db = req.db
        var login_user = req.cookies.Spindle.split('-')[0]
        db.collection('Curator').find({"Token":req.cookies.Spindle, "LogName":login_user}).toArray(function(err, user) {
            if (err) {
                throw err
                return
            }
            if (user) {
                var newrecord = user[0].LoginRecord.pop()
                var lastaction = newrecord.Action[newrecord.Action.length-1]
                newrecord.Logout = Date().toString()
                //newrecord.Action.push('Logout')
                db.collection('Curator').update({"LogName":user[0].LogName}, {$set:{"Token":""}}, function(err) {
                    if (err) {
                        throw err
                        return
                    }
                })
                db.collection("Curator").update({"LogName":user[0].LogName},{$pop:{"LoginRecord":1}}, function(err) {
                    if (err) {
                        throw err
                        return
                    }
                    db.collection('Curator').update({"LogName":user[0].LogName},{$push:{"LoginRecord":newrecord}}, function(err) {
                        if (err) {
                            throw err
                            return
                        }
                        res.clearCookie('Spindle',null, {maxAge:0, httpOnly:true, path:'/'}) // Delete cookie in browser
                        //res.clearCookie('genesymbol',null, {path:'/'})
                        //res.clearCookie('diseaseterm',null, {path:'/'})
                        res.render('logout', {token:'logout'})
                    })
                })
            }
            else {
                res.render('logout', {token:'Unknown err'})
            }
        })
    }
    else res.render('logout')
})
*/
router.get('/Lastcuration', function(req, res) {
    var db = req.db
    db.collection('Curator').find({"LogName":req.cookies.Spindle.split('-')[0]}).toArray(function(err, user) {
        if (err) {
            throw err
            return
        }
        var lastaction, str=''
        for (var i=user[0].LoginRecord.length-1; i>=0; i--) {
            if (user[0].LoginRecord[i].Action.length > 0 ) {
                lastaction = user[0].LoginRecord[i].Action.pop()
                break
            }
        }
        if (lastaction.indexOf('Create Gene_Disease pair') > -1 || lastaction.indexOf('Literature Search') > -1) {
            str = '/Curations/'
            if (lastaction.indexOf('Literature Search') > -1) {
                    str += 'Literaturesearch/'
                    var temp = lastaction.match(/\s\w+:\w+/)[0].split(' ')[1].split(':')
                    str += temp[0] + '/' + temp[1]
            }
        }
        else {
                    if (lastaction.indexOf('Case Group Study') > -1) str = '/Casegroupstudy'
                    else if (lastaction.indexOf('Case Control Study') > -1) str = '/Casecontrolstudy'
                    else if (lastaction.indexOf('Functional Data Analysis') > -1) str = '/Functionaldataanalysis'
                    str += '/Group/' + lastaction.match(/Group \d+/)[0].split(' ')[1]
                    if (lastaction.indexOf('group data') > -1) str += '/Group'
                    else if (lastaction.indexOf('method') > -1) str += '/Method'
                    else if (lastaction.indexOf('Segregation') > -1) str += '/Segregation/' + lastaction.match(/Segregation \d+/)[0].split(' ')[1]
        }
    //console.log(str);
        if (str != '') res.redirect(str)
        else res.render('spindle', { login:true, action:false, user:user[0] })
    })
})

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
