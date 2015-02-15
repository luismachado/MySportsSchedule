var config = {};

//----------------------------------------------------------
// GENERAL CONFIGS
//----------------------------------------------------------
config.emptyMatches = 
{
		today :    {POR : [], SPA : [], ENG : [], EUR : [], NBA : []},
        todayAll : [],
		tomorrow : {POR : [], SPA : [], ENG : [], EUR : [], NBA : []},
        tomorrowAll : [],
		after :    {POR : [], SPA : [], ENG : [], EUR : [], NBA : [],
        afterAll : []}
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
    "England" : {title : "ENG", competitions : [
                                                "England - Premier League",
                                                "England - League Cup",
                                                "England - FA Cup"
                                                ]},
    "Spain"   : {title : "SPA", competitions : [
                                                "Spain - Primera División",
                                                "Spain - Copa del Rey"
                                                ]},
    "Portugal": {title : "POR", competitions : [
                                                "Portugal - Primeira Liga",
                                                "Portugal - Taça da Liga"
                                                ]}
};

config.competitionsToShow =
{
    "England - Premier League" : "Premier League",
    "England - League Cup"     : "League Cup",
    "England - FA Cup"         : "FA",
    "Spain - Primera División" : "La Liga", 
    "Spain - Copa del Rey"     : "Copa Del Rey",
    "Portugal - Primeira Liga" : "Liga",
    "Portugal - Taça da Liga"  : "Taça da Liga"
};

config.footballMatches = 
{
		today :    {POR : [], SPA : [], ENG : [], EUR : []},
		tomorrow : {POR : [], SPA : [], ENG : [], EUR : []},
		after :    {POR : [], SPA : [], ENG : [], EUR : []}
};               

module.exports = config;