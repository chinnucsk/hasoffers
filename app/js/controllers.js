'use strict';

/* Controllers */
function UserListController($scope, $http) {
	$http.get('logs/users.json').success(function(data) {
		$scope.users = data;

		// need to assign id's for chart creation first.
		$scope.users.forEach(function (user) {
			user.chartID = $scope.genID();
		});

		$http.post('logs/test.js').success(function(data) {
			alert(data);
		});

		// get log and process.
		$http.get('logs/logs.json').success(function(data) {
			$scope.users.forEach(function (user) {

				// get card stats.
				user.totals = $scope.getTotals(user.id, data);

				// generate chart
				user.chart = $scope.genChart(user.chartID, user.totals.conversionsPerDay);

				// get conversions per day date range string for chart.
				user.conversionsPerDayDateRange = $scope.getDateRangeString(user.totals.conversionsPerDay);

				// generate a random color in case no avatar.
				if (!$scope.hasAvatar(user.id)) {
					user.randomColor = $scope.genColor();		
				}
			});
		});
	});

	// Get a particular user by their id.
	$scope.getUserById = function (id) {
		var user;
		$scope.users.some(function (usr) {
			if (usr.id === id) {
				user = usr;
				return true;
			}
			return false;
		});
		return user;
	}

	// check to see if user has avatar.
	$scope.hasAvatar = function (id) {
		var user = $scope.getUserById(id);
		if (user) {
			return user.avatar.length !== 0;
		}
	}

	// generate random number between min and max.
	$scope.genRandomNumber = function (min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}
	
	// generate a random color
	$scope.genColor = function () {
		var options = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'],
			randomColor = '#',
			cnt = 0;

			while (cnt < 6) {
				randomColor += options[$scope.genRandomNumber(0, 15)];
				cnt += 1;
			}
			return randomColor;
	}

	// Generate a 'random' ID for canvas element in DOM.  Doesn't check that it's unique.
 	$scope.genID = function() {
		return 'id' + Math.floor((Math.random()*1000)+1);
	}

	// Get stats for a user by parsing data from the log file.
	$scope.getTotals = function (userID, data) {
		  	var ret = {
		  		conversions: 0,
		  		impressions: 0,
		  		revenue: 0,
		  		conversionsPerDay: {}
		  	}, date;

		  	data.forEach(function(item) {
		  		if (item.user_id === userID) {
		  			if (item.type === 'impression') {
		  				ret.impressions += 1;
		  			} else {	//assuming only other type is conversion.

		  				// For totals
		  				ret.conversions += 1;
		  				ret.revenue += item.revenue;

		  				// For conversions per day
		  				date = item.time.split(' ')[0];  // this will be key. e.g. '2013-04-13'

		  				if (ret.conversionsPerDay[date] >= 0) {
		  					ret.conversionsPerDay[date] += 1;
		  				} else {
		  					ret.conversionsPerDay[date] = 1;
		  				}
		  			}
		  		}
		  	});
			
		  	return ret;
	  }

	  // return string representing start/end points of data
	  $scope.getDateRangeString = function (conversionsPerDayData) {
	  	var dataPointKeys = Object.keys(conversionsPerDayData).sort();
	  	return dataPointKeys[0] + ' - ' + dataPointKeys[dataPointKeys.length - 1 ]
	  }

	  // generate a simple line chart.
	  $scope.genChart = function (id, data) {
		var ctx, data, options, canvas1, 
			dataPointKeys = Object.keys(data).sort(), // sort data ascending (date string)
			dataPoints = [],
			dataLabels = [];

		dataPointKeys.forEach(function(key) {
			dataPoints.push(data[key]),
			dataLabels.push('');
		});

		  options = {
		    animation: false,
		    bezierCurve: false,
		    pointDot: false, 
		    scaleGridLineColor: 'rgba(0,0,0,0)',
		    scaleLineColor: 'rgba(0,0,0,0)',
		    scaleShowGridLines: false,
		    scaleShowLabels: false
		  };

		  data = {
		    labels: dataLabels,
		    datasets: [{
		      data: dataPoints,
		      fillColor: 'rgba(0,0,0,0)',
		      strokeColor: 'rgba(0,0,0,1)'
		    }]
		  };

		  ctx = document.getElementById(id).getContext('2d');
		  return new Chart(ctx).Line(data, options);
	  }
}