angular.module('Admin.Common', [])

.service('CommonService', function($http) {

	this.testString = function() {

		alert('This is a common service');
	}
})