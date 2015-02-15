angular.module('MatchesCtrl', []).controller('MatchesController', function($scope, Matches) {
	
	$scope.currentPage = 0;
	$scope.showCondensed = false;

	Matches.getMatches().success(function (response) {
		$scope.today = response.today;
		$scope.todayAll = response.todayAll;
		$scope.tomorrow = response.tomorrow;
		$scope.tomorrowAll = response.tomorrowAll;
		$scope.after = response.after;
		$scope.afterAll = response.afterAll;

		$scope.currentPage = 0;
		$scope.refreshCurrentDay();

	});

	var getKeyboardEventResult = function (keyEvent) {
      return window.event ? keyEvent.keyCode : keyEvent.which;
    };

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

    $scope.onKeyUp = function ($event) {
    	var keyPress = getKeyboardEventResult($event);

    	if(keyPress == '37')
    		$scope.prevPage();
    	else if(keyPress == '39')
    		$scope.nextPage();
    };

    $scope.refreshCurrentDay = function () {

    	switch($scope.currentPage) {
		    case 0:
		        $scope.currentDay = $scope.today;
		        $scope.currentAll = $scope.todayAll;
		        break;
		    case 1:
		        $scope.currentDay = $scope.tomorrow;
		        $scope.currentAll = $scope.tomorrowAll;
		        break;
		    case 2:
		        $scope.currentDay = $scope.after;
		        $scope.currentAll = $scope.afterAll;
		        break;
		} 	
    } 

});