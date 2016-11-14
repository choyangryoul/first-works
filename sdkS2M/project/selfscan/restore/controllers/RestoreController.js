angular.module('S2M.Restore')
	.controller('RestoreCtrl', function($scope, $http, $routeParams, MainService) {

		var restore = this;
		

		restore.testCmd = function() {
			console.log('cmd start');
			MainService.clickevent();
			console.log('cmd end');
		}

		// server.js 에서 server 적용.http://localhost:3000
		// postzipcode 폴더에서 DAUM Api 를 불러옴.



/*		$scope.getChildWin = function () {

			//$('#zip').value = win.document.getElementById('sample6_postcode').value;

			alert("document.getElementById('zip').value:" + document.getElementById('zip').value);
		};*/
		$scope.getWebData  = function() {
            $.ajax({
                    url: "http://localhost:3000"
                })
                    .success (function(data) {
                        //console.log('data --> ' + angular.toJson(data));
                        console.log('data=====>' + data.postData);
                        
                    })
                                        //console.log('title=' + title);
                    .error (function (err) {
                        console.log('err=' + err);
                    })

        }

	});