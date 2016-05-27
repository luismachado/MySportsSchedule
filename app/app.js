var express = require('express');
var moment  = require('moment-timezone');
var winston = require('winston');
var fs      = require('fs');
var checksum = require('checksum');
var app     = express();
var CronJob = require('cron').CronJob;
var configs = require('../config/config');
var footballScraper = require('./football');
var nbaScrapper = require('./nba.js');
var todayDate;

var jsonMatches =
    {
        today : [],
        tomorrow : [],
        after : []
    };

var operationsRemaining = 0;

function sortPerTime(matchA, matchB) {
    return Date.parse('01/01/2011 ' + matchA.time + ':00') - Date.parse('01/01/2011 ' + matchB.time + ':00');
}

function sortMatchesPerHour() {
    jsonMatches.today.matches.sort(sortPerTime);
    jsonMatches.tomorrow.matches.sort(sortPerTime);
    jsonMatches.after.matches.sort(sortPerTime);
}

function addDates() {
    jsonMatches.today.date = todayDate.format("MMM Do YYYY");
    jsonMatches.tomorrow.date = todayDate.clone().add(1, 'days').format("MMM Do YYYY");;
    jsonMatches.after.date = todayDate.clone().add(2, 'days').format("MMM Do YYYY");;
}

function saveNBASchedule (matches, callback) {

    //CAN BE IMPROVED!
    for (var key in matches.today)
        jsonMatches.today[key] = matches.today[key];
    for (var key in matches.tomorrow)
        jsonMatches.tomorrow[key] = matches.tomorrow[key];
    for (var key in matches.after)
        jsonMatches.after[key] = matches.after[key];

    winston.info("NBA Schedule Saved.");

    if(--operationsRemaining == 0) {
        sortMatchesPerHour();
        addDates();
        addConfig(callback);
    }
}

function saveFootballSchedule (matches, callback) {

    jsonMatches.today = matches.today;
    jsonMatches.tomorrow = matches.tomorrow;
    jsonMatches.after = matches.after;

    winston.info("Football Schedule Saved.");

    if(--operationsRemaining == 0) {
        sortMatchesPerHour();
        addDates();
        addConfig(callback);
    }
} 

function addConfig(callback) {

    var checksumInfo = {"value":0, "timestamp":0};
    // DO CONFIG CHECKSUM
    checksum.file("./config/config.js", function (err, sum) {
        if(err) {
            winston.warn('There has been an error while performing config checksum.')
            return; // MORE ACTIONS??
        }

        try {
            var data = fs.readFileSync('./config/checksum.json'), paramsObj;
            paramsObj = JSON.parse(data);
            checksumInfo = paramsObj;

            if(!(sum === checksumInfo.value)) {
                // IF CHECKSUM CHANGED SAVE NEW ONE
                checksumInfo.value = sum;
                checksumInfo.timestamp = Date.now();
                winston.info('Configutarion file changed');
            } else {
                winston.info('Configutarion file unchanged');
            }
            // WRITE CHECKSUM
            saveChecksum(checksumInfo, callback);
        } catch (err) {
            winston.warn('There has been an error loading the checksum information. New checksum file will be created.')
            // winston.warn(err);
            // IF NO CHECKSUM FILE DETECTED CREATE NEW ONE
            checksumInfo.value = sum;
            checksumInfo.timestamp = Date.now();
            saveChecksum(checksumInfo, callback);
        }
    });
}   

function saveChecksum(checksumInfo, callback) {

    var newChecksum = JSON.stringify(checksumInfo);
    fs.writeFile('./config/checksum.json', newChecksum, function (err) {
        if (err) {
          winston.warn('There has been an error saving files to file.');
          winston.warn(err.message);
          return;
        }

        jsonMatches.config = configs.toSend;
        jsonMatches.config.timestamp = checksumInfo.timestamp;
        saveMatchesToFile(callback);
    });

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

function loadMatchesFromFile(isStartup) {

    try {
        var data = fs.readFileSync('./config/data.json'), paramsObj;
        paramsObj = JSON.parse(data);
        jsonMatches = paramsObj;
        winston.info('Matches loaded successfully from file');
    }
    catch (err) {
        if(isStartup == false) {
            winston.warn('There has been an error loading files from file.')
            winston.warn(err);
        }
    }

}

function eraseMatches() {

    jsonMatches = JSON.parse(JSON.stringify(configs.emptyMatches));
    winston.info("Matches Erased");
}

exports.updateMatches  = function updateMatches(res) {

    
    operationsRemaining = 1;
    eraseMatches();

    todayDate = moment().add(1,'days');
    footballScraper.obtainFootballMatchesDay(todayDate, 0, JSON.parse(JSON.stringify(configs.footballMatches)), saveFootballSchedule, res);
    //nbaScrapper.obtainNBAMatchesDay(todayDate, -1, JSON.parse(JSON.stringify(configs.nbaMatches)), saveNBASchedule, res);  
}



module.exports = function(app) {

    loadMatchesFromFile(true);
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
        loadMatchesFromFile(false);
        res.send("Matches Loaded");
    });

    app.get('/MySportsSchedule', function(req, res) {
        res.sendfile('./public/index.html');
    });
};








