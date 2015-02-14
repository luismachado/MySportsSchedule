angular.module('MatchesService', []).
	factory('Matches', ['$http', function($http) {

	var MatchesAPI = {};	

	MatchesAPI.getMatches = function() {

		return $http({
			url: '/MySportsSchedule/GetGames'
		});
	}

	return MatchesAPI;

}]);