angular.module('S2M.Common')

	.controller('MainCtrl', function($scope, $route, $routeParams, $location, CommonService, MainService) {

		var gui = require('nw.gui');
		$scope.$route = $route;
	    $scope.$location = $location;
	    $scope.$routeParams = $routeParams;
	    

	    var main = this;

	    // host 이름을 불러온다.
	    $scope.pcName = CommonService.getPCName();

	    $scope.testOpenDir = function() {

			gui.Shell.openItem('\\\\rest-pc\\표지');
		}
	});

	
	




 