var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var moment  = require('moment-timezone');
var app     = express();
var config  = require('../config/config');


function relevantCompetition (competition) {
    var leagueName = competition.find('td a.seasonLink').attr('title');
    if(config.leaguesToShow.hasOwnProperty(leagueName)) {

        var leagueInfo = config.leaguesToShow[leagueName];
        var competitionName = competition.find('td a.seasonLink').text();
        
        if(leagueInfo.competitions.indexOf(competitionName) != -1) {
            return competitionInfo = {leagueTitle : leagueInfo.title,
                                   competition : config.competitionsToShow[competitionName],
                                   code : competition.find('td a.seasonDetails').attr('data-sectionid')};                                              
        }
    }

    return 0;
}

function saveMatch(match, leagueTitle, dayDiff, footballMatches) {

	switch (dayDiff) {
		case 0 :
			footballMatches.today[leagueTitle].push(match);
			break;
		case 1  :
			footballMatches.tomorrow[leagueTitle].push(match);
			break;
		case 2  :
			footballMatches.after[leagueTitle].push(match);
			break;
	}

    return footballMatches;
}

exports.obtainFootballMatchesDay = function obtainFootballMatchesDay(todayDate, dayDiff, footballMatches, callback) {

    var date = todayDate.clone().add(dayDiff,'days');
    var url = config.football_url.replace('YYYY', date.format('YYYY')).replace('MM', date.format('MM'))
                        .replace('DD', date.format('DD'));

    request(url, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);
            var matchTable = $('table.competitionRanking').first();

            var competitionsList = $(matchTable).find('tbody tr.seasonRow').toArray();
            for(var compListIdx = 0; compListIdx < competitionsList.length; compListIdx++) {
                var comptRow = $(competitionsList[compListIdx]);

                var result = relevantCompetition(comptRow);
                if(result != 0) {
                    var matchList = $(matchTable).find('tbody tr.betMatchRow[data-sectionid='+result.code+']').toArray();

                    for(var matchListIdx = 0; matchListIdx < matchList.length; matchListIdx++) {
                        var matchData = $(matchList[matchListIdx]);
                        var gameTime = matchData.find('td.score div').attr('title').replace(' GMT','');
                        if(gameTime.match('[0-9][0-9]:[0-9][0-9]')) {
                            var match =
                                {
                                    time : gameTime,
                                    competition : result.competition,
                                    homeTeam : matchData.find('td.teamHome a').text(),
                                    awayTeam : matchData.find('td.teamAway a').text()
                                };

                            footballMatches = saveMatch(match, result.leagueTitle, dayDiff, footballMatches);
                        }
                    }
                }
            }
            if(dayDiff < 2)
            	obtainFootballMatchesDay(todayDate, ++dayDiff, footballMatches, callback);
            else {
            	callback(footballMatches);
            }
        }
    });
}





