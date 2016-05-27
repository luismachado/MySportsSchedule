var config = {};

//----------------------------------------------------------
// GENERAL CONFIGS
//----------------------------------------------------------
config.emptyMatches = 
{
		today :    {matches : []},
		tomorrow : {matches : []},
		after :    {matches : []}
};     

//----------------------------------------------------------
// NBA CONFIGS
//----------------------------------------------------------
config.nba_url_start = 'http://stats.nba.com/stats/scoreboard?GameDate=';
config.nba_url_end   = '&DayOffset=0&LeagueID=00';

config.nbaMatches = 
{
	today :    {NBA : []},
	tomorrow : {NBA : []},
	after :    {NBA : []}
};

//----------------------------------------------------------
// FOOTBALL CONFIGS
//----------------------------------------------------------
config.football_url = 'http://www.soccerpunter.com/soccer-statistics/matches_today?year=YYYY&month=MM&day=DD';
config.leaguesToShow =
{
    "England" : {visible : true, competitions : [
                                                "England - Premier League",
                                                "England - League Cup",
                                                "England - FA Cup"
                                                ]},
    "Spain"   : {visible : true, competitions : [
                                                "Spain - Primera División",
                                                "Spain - Copa del Rey"
                                                ]},
    "Portugal": {visible : true, competitions : [
                                                "Portugal - Primeira Liga",
                                                "Portugal - Taça da Liga"
                                                ]},
    "Europe": {visible : true, competitions : [
                                                "Europe - UEFA Champions League",
                                                "Europe - UEFA Europa League"
                                                ]},
    "Turkey" : {visible : true, competitions : [
                                                "Turkey - Süper Lig",
                                                "Turkey - 1. Lig"
                                                ]},
    "Russia" : {visible : true, competitions : [
                                                "Russia - Premier League"
                                                ]},
    "Brazil" : {visible : true, competitions : [
                                                "Brazil - Serie A",
                                                "Brazil - Serie B"
                                                ]}
}

config.toSend =
{
    timestamp : {},
    visibilities : {
        "England" : {visible : true, competitions :
                                                {
                                                    "Premier League":true,
                                                    "League Cup":true,
                                                    "FA":true
                                                }},
        "Spain"   : {visible : true, competitions :
                                                {
                                                    "La Liga":true,
                                                    "Copa Del Rey":false
                                                }},
        "Portugal": {visible : true, competitions : 
                                                {
                                                    "Liga":true,
                                                    "Taça da Liga":true
                                                }},
        "Europe": {visible : true, competitions : 
                                                {
                                                    "Champions League":true,
                                                    "Europa League":true
                                                }},
        "Turkey" : {visible : true, competitions :
                                                {
                                                    "Süper Lig" : true,
                                                    "1. Lig" : true
                                                }},
        "Russia" : {visible : true, competitions :
                                                {
                                                    "Premier League" : true
                                                }},
        "Brazil" : {visible : true, competitions : 
                                                {
                                                    "Serie A" : true,
                                                    "Serie B" : true
                                                }}
    }                                                
};

config.competitionsToShow =
{
    "England - Premier League" : "Premier League",
    "England - League Cup"     : "League Cup",
    "England - FA Cup"         : "FA",
    "Spain - Primera División" : "La Liga", 
    "Spain - Copa del Rey"     : "Copa Del Rey",
    "Portugal - Primeira Liga" : "Liga",
    "Portugal - Taça da Liga"  : "Taça da Liga",
    "Europe - UEFA Champions League" : "Champions League",
    "Europe - UEFA Europa League" : "Europa League",
    "Turkey - Süper Lig" : "Süper Lig",
    "Turkey - 1. Lig" : "1. Lig",
    "Russia - Premier League" : "Premier League",
    "Brazil - Serie A" : "Serie A",
    "Brazil - Serie B" : "Serie B",
};

config.footballMatches = 
{
		today :    {matches : []},
		tomorrow : {matches : []},
		after :    {matches : []}
};               

module.exports = config;