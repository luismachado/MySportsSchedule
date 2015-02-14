angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

		// home page
		.when('/', {
			templateUrl: 'views/releases.html',
			controller: 'MatchesController',
			service : 'MatchesService'
		});

	$locationProvider.html5Mode(true);

}]);