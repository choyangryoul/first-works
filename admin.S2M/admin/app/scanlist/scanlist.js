angular.module('Admin.Scanlist', ['ui.bootstrap'])

.service('scanlistService', function($http) {


    this.getIP = function() {

	    var ip = require('ip');

	    var localIp = ip.address(); // 서버, DB 와 동일 PC 일때 local ip 를 얻어옴

	    return localIp
	};
    
}) 