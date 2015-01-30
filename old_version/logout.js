var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');

app.use(cookieParser());

router.get('/', function(req, res) {
    //res.render('index', {});
    console.log('logout', { token:true });
});

module.exports = router;
