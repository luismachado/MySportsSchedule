angular.module('MatchesCtrl', []).controller('MatchesController', function($scope, Matches) {
	
	$scope.currentPage = 0;

	Matches.getMatches().success(function (response) {
		$scope.today = response.today;
		$scope.tomorrow = response.tomorrow;
		$scope.after = response.after;

		$scope.currentPage = 0;
		$scope.refreshCurrentDay();

	});

	$scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }

        $scope.refreshCurrentDay();

    };

    $scope.nextPage = function () {
        if ($scope.currentPage < 2) {
            $scope.currentPage++;
        }

        $scope.refreshCurrentDay();
    };

    $scope.refreshCurrentDay = function () {

    	switch($scope.currentPage) {
		    case 0:
		        $scope.currentDay = $scope.today;
		        break;
		    case 1:
		        $scope.currentDay = $scope.tomorrow;
		        break;
		    case 2:
		        $scope.currentDay = $scope.after;
		        break;
		} 	
    } 

});