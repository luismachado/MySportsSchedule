var express = require('express');
var moment  = require('moment-timezone');
var winston = require('winston');
var fs      = require('fs');
var app     = express();
var CronJob = require('cron').CronJob;
var configs = require('../config/config');
var footballScraper = require('./football');
var nbaScrapper = require('./nba.js');
var todayDate;

var jsonMatches = { today :    {POR : [], SPA : [], ENG : [], EUR : [], NBA : []},
                    todayAll : [],
                    tomorrow : {POR : [], SPA : [], ENG : [], EUR : [], NBA : []},
                    tomorrowAll : [],
                    after :    {POR : [], SPA : [], ENG : [], EUR : [], NBA : [],
                    afterAll : []}};

var operationsRemaining = 0;

function sortPerTime(matchA, matchB) {
    return Date.parse('01/01/2011 ' + matchA.time + ':00') - Date.parse('01/01/2011 ' + matchB.time + ':00');
}

function aggregateDays() {
    var todayAll    = [];
    var tomorrowAll = [];
    var afterAll    = [];
    for (var key in jsonMatches.today) {
        todayAll = todayAll.concat(jsonMatches.today[key]);
    }
    for (var key in jsonMatches.tomorrow) {
        tomorrowAll = tomorrowAll.concat(jsonMatches.tomorrow[key]);
    }
    for (var key in jsonMatches.after) {
        afterAll = afterAll.concat(jsonMatches.after[key]);
    }  

    todayAll.sort(sortPerTime);
    tomorrowAll.sort(sortPerTime);
    afterAll.sort(sortPerTime);

    jsonMatches.todayAll    = todayAll;
    jsonMatches.tomorrowAll = tomorrowAll;
    jsonMatches.afterAll    = afterAll; 
}

function addDates() {

    jsonMatches.today.date = todayDate.format("MMM Do YYYY");
    jsonMatches.tomorrow.date = todayDate.clone().add(1, 'days').format("MMM Do YYYY");;
    jsonMatches.after.date = todayDate.clone().add(2, 'days').format("MMM Do YYYY");;
}


function saveNBASchedule (matches, callback) {
   
    for (var key in matches.today)
        jsonMatches.today[key] = matches.today[key];
    for (var key in matches.tomorrow)
        jsonMatches.tomorrow[key] = matches.tomorrow[key];
    for (var key in matches.after)
        jsonMatches.after[key] = matches.after[key];

    //winston.info("NBA Schedule Saved.");

    if(--operationsRemaining == 0) {
        aggregateDays();
        addDates();
        saveMatchesToFile(callback);
    }
}



function saveFootballSchedule (matches, callback) {

    for (var key in matches.today)
        jsonMatches.today[key] = matches.today[key];

    for (var key in matches.tomorrow)
        jsonMatches.tomorrow[key] = matches.tomorrow[key];

    for (var key in matches.after)
        jsonMatches.after[key] = matches.after[key];

    //winston.info("Football Schedule Saved.");

    if(--operationsRemaining == 0) {
        aggregateDays();
        addDates();
        saveMatchesToFile(callback);
    }
}    

function saveMatchesToFile(callback) {
    var matchesData = JSON.stringify(jsonMatches);

    fs.writeFile('./config/data.json', matchesData, function (err) {
        if (err) {
          winston.warn('There has been an error saving files to file.');
          winston.warn(err.message);
          return;
        }
        winston.info('Matches updated and saved to file');
        if(callback) callback.send("Match List Updated.")
    });
}

function loadMatchesFromFile() {

    var data = fs.readFileSync('./config/data.json'), paramsObj;
    try {
            paramsObj = JSON.parse(data);
            jsonMatches = paramsObj;
            winston.info('Matches loaded successfully from file');
    }
    catch (err) {
        winston.warn('There has been an error loading files from file.')
        winston.warn(err);
    }

}

function eraseMatches() {

    jsonMatches = JSON.parse(JSON.stringify(configs.emptyMatches));
    //winston.info("Matches Erased");
}

exports.updateMatches  = function updateMatches(res) {

    
    operationsRemaining = 2;
    eraseMatches();

    todayDate = moment().add(1,'days');
    footballScraper.obtainFootballMatchesDay(todayDate, 0, JSON.parse(JSON.stringify(configs.footballMatches)), saveFootballSchedule, res);
    nbaScrapper.obtainNBAMatchesDay(todayDate, -1, JSON.parse(JSON.stringify(configs.nbaMatches)), saveNBASchedule, res);  
}



module.exports = function(app) {

    var job = new CronJob({
        cronTime: '00 55 23 * * 1-7',
        onTick: function() {
            winston.info("Scheduled Match Refresh.");
            exports.updateMatches(null);
        },
        start: false,
        timeZone: "Europe/London"
    });
    job.start();

    // Get Matches
    app.get('/MySportsSchedule/RefreshGames', function(req, res){
        winston.info("Manual Match Refresh.");
        exports.updateMatches(res);
    });

    // Get JSON for Matches
    app.get('/MySportsSchedule/GetGames', function(req, res){
        winston.info("Get Games - Request from " + req.ip);
        res.json(jsonMatches);
    });

    // Load matches from File
    app.get('/MySportsSchedule/LoadMatchesFromFile', function(req, res){
        loadMatchesFromFile();
        res.send("Matches Loaded");
    });

    app.get('/MySportsSchedule', function(req, res) {
        res.sendfile('./public/index.html');
    });
};





