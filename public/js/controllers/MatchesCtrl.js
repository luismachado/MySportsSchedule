angular.module('MatchesCtrl', []).controller('MatchesController', function($scope, Matches) {

    $scope.condense = false;

    Matches.getMatches().success(function (response) {  

        $scope.all= {'today' : response.today, 'tomorrow' : response.tomorrow, 'after' : response.after};
        $scope.days = ['today', 'tomorrow', 'after'];

        $scope.carouselIndex = 0;

        // Read from localStorage
        if(localStorage.getItem("mysportssch_config"))
            $scope.config = JSON.parse(localStorage.getItem("mysportssch_config"));
        if(localStorage.getItem("mysportssch_keys"))
            $scope.keys = JSON.parse(localStorage.getItem("mysportssch_keys"));
        if(localStorage.getItem("mysportssch_condensed"))
            $scope.condense = JSON.parse(localStorage.getItem("mysportssch_condensed"));

        // Check if configuration received was updated since last time
        if(response.config && !($scope.config && $scope.config.timestamp >= response.config.timestamp)) {
            console.log("entrou")
            $scope.config = response.config;
            $scope.keys = [];
            for (var key in $scope.config.visibilities)
                $scope.keys.push(key);
            localStorage.setItem("mysportssch_keys", JSON.stringify($scope.keys));
        }

        $scope.leagues = {'today' : {matches:{}, matchCount:{}}, 'tomorrow' : {matches:{}, matchCount:{}}, 'after' : {matches:{}, matchCount:{}}};

        slicePerLeague($scope.all.today, $scope.leagues.today);
        slicePerLeague($scope.all.tomorrow, $scope.leagues.tomorrow);
        slicePerLeague($scope.all.after, $scope.leagues.after);

        $scope.currentDate = $scope.all.today.date;

        $scope.applyFilters();
    });

    $scope.saveConfig = function () {
        localStorage.setItem("mysportssch_config", JSON.stringify($scope.config));
        localStorage.setItem("mysportssch_condensed", JSON.stringify($scope.condense));
    };

    $scope.applyFilters = function (){
        applyVisibilityFilters();
        countVisibilities();
        $scope.saveConfig();
    }

    var applyVisibilityFilters = function () {
        var league, competition;

        for (var day in $scope.all) {
            for(var listIdx = 0; $scope.all[day].matches && listIdx < $scope.all[day].matches.length; listIdx++) 
            {
                league = $scope.all[day].matches[listIdx].league;
                competition = $scope.all[day].matches[listIdx].competition;
                $scope.all[day].matches[listIdx].visible = ($scope.config.visibilities[league].visible == true 
                    && $scope.config.visibilities[league].competitions[competition] == true) ? true : false;
            }
        }
    }

    var slicePerLeague = function (dayAll, day) {
        day.date = dayAll.date;
        var matches = dayAll.matches;

        for(var listIdx = 0; matches && listIdx < matches.length; listIdx++) 
        {
            var match = matches[listIdx];
            var leagueName = match.league;
            if(day.matches[leagueName]) 
                day.matches[leagueName].push(match);
            else
                day.matches[leagueName] = [match];
        }
    }

    var countVisibilities = function () {
        countVisibleMatchesPerDay($scope.leagues.today);
        countVisibleMatchesPerDay($scope.leagues.tomorrow);
        countVisibleMatchesPerDay($scope.leagues.after);

        $scope.all.today.matchCount = countVisibleMatches($scope.all.today.matches);
        $scope.all.tomorrow.matchCount = countVisibleMatches($scope.all.tomorrow.matches);
        $scope.all.after.matchCount = countVisibleMatches($scope.all.after.matches);
    }

    var countVisibleMatchesPerDay = function (day) {
        for (var key in day.matches) {
            day.matchCount[key] = countVisibleMatches(day.matches[key]);
        }
    }

    var countVisibleMatches = function(matches) {
        var visibleNo = 0
        for(var listIdx = 0; matches && listIdx < matches.length; listIdx++) 
        {
            if (matches[listIdx].visible)
                visibleNo++;
        }
        return visibleNo;
    }

    // Everytime the page is changed the current date is reset
    $scope.$watch(function(scope) { return scope.carouselIndex },
        function(newValue, oldValue) {
            if($scope.all) {
                switch(newValue) {
                    case 0:
                        return $scope.currentDate = $scope.all.today.date;
                    case 1:
                        return $scope.currentDate = $scope.all.tomorrow.date;
                    case 2:
                        return $scope.currentDate = $scope.all.after.date;
                } return null;
            } 
        }
    );

    // Handle keypresses
    $scope.prevPage = function () {
        if ($scope.carouselIndex > 0) {
            $scope.carouselIndex--;
        }
    };

    $scope.nextPage = function () {
        if ($scope.carouselIndex < 2) {
            $scope.carouselIndex++;
        }
    };

    var getKeyboardEventResult = function (keyEvent) {
      return window.event ? keyEvent.keyCode : keyEvent.which;
    };

    $scope.onKeyUp = function ($event) {
        var keyPress = getKeyboardEventResult($event);

        if(keyPress == '37')
            $scope.prevPage();
        else if(keyPress == '39')
            $scope.nextPage();
    };

});