var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment-timezone');
var fs      = require('fs');
var app     = express();
var config = require('../config/config');

// Build a date object from the date and time provided
// Converts date from EST to GMT
function buildDateAndTimeGMT(date, timeEST) {

    var dateEST = moment.tz(date.format('YYYY/MM/DD') + " " + timeEST, "YYYY/MM/DD h:mmA", "America/New_York");
    return dateEST.clone().tz("Europe/London");
}

exports.obtainNBAMatchesDay = function obtainNBAMatchesDay (todayDate, dayDiff, nbaMatches, callback) {

	var date = todayDate.clone().add(dayDiff,'days');
    var url = config.nba_url_start + date.format('YYYY/MM/DD') + config.nba_url_end;

    request(url, function(error, response, html){
        if(!error){
            var jsonResponse = JSON.parse(html);
            var matches = jsonResponse.resultSets[0].rowSet;

            for(var matchIdx = 0; matchIdx < matches.length; matchIdx++) {
                var teams = matches[matchIdx][5].split('/')[1]; // ERROR HANDLING
                var matchTime = matches[matchIdx][4];
                if(matchTime.length > 0 && matchTime.substring(matchTime.length - 2, matchTime.length) == 'ET') {

                	var gameDateGMT = buildDateAndTimeGMT(date, matchTime.replace(" ET", ""));
                	var currentDateGMT = moment(date);

                	var nbaMatch =
                        {
                            time : gameDateGMT.format('HH:mm'),
                            homeTeam : teams.substring(0,3),
                            awayTeam : teams.substring(3,6)
                        };

                	if(gameDateGMT.isAfter(currentDateGMT,'day')) { // TOMORROW
                		if(dayDiff < 2) {
                			switch (dayDiff) {
                				case -1 :
                					nbaMatches.today.NBA.push(nbaMatch);
                					break;
                				case 0  :
                					nbaMatches.tomorrow.NBA.push(nbaMatch);
                					break;
                				case 1  :
                					nbaMatches.after.NBA.push(nbaMatch);
                					break;
                			}
                		}
                	} else { // TODAY
                		if(dayDiff > -1) {
                			switch (dayDiff) {
                				case 0 :
                					nbaMatches.today.NBA.push(nbaMatch);
                					break;
                				case 1  :
                					nbaMatches.tomorrow.NBA.push(nbaMatch);
                					break;
                				case 2  :
                					nbaMatches.after.NBA.push(nbaMatch);
                					break;
                			}
                		}
                	}
                }
            }
            if(dayDiff < 2)
            	obtainNBAMatchesDay(todayDate, dayDiff+1, nbaMatches, callback);
            else {
            	callback(nbaMatches);
            }
        }

    });
}