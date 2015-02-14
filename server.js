// modules =================================================
var express        = require('express');
var app            = express();
var methodOverride = require('method-override');
var winston 	   = require('winston');

// configuration ===========================================
	
// config files
//var db = require('./config/db');

//var port = process.env.PORT || 80; // set our port

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

//winston.add(winston.transports.File, { filename: 'my_sports_schedule.log' });

// routes ==================================================
require('./app/app')(app); // pass our application into our routes

// start app ===============================================
app.listen(8083);	
winston.info("Listining on port " + 8083);