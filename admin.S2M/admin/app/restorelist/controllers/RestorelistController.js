angular.module('Admin.Restorelist')

.controller('RestorelistCtrl', function($scope, $http, $interval, $timeout, MainService) {

	$scope.currentPage = 0;
    $scope.pageSize = 10;
    var dataLoadInterval;
    var getDB;

    var moment = require('moment');


    // 페이징, 정렬 구현
   $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.filter = function() {
        $timeout(function() { 
            $scope.filteredItems = $scope.filtered.length;
        }, 10);
    };
    $scope.sort_by = function(predicate) {
        $scope.predicate = predicate;
        $scope.reverse = !$scope.reverse;
    };

	var localIp = MainService.getIP();

    $scope.getRestoreData = function () {

        $http({
            method: 'GET', //방식
            url: 'http://' + localIp + ':47751/restore', /* 통신할 URL */
            headers: {'Content-Type': 'application/json; charset=utf-8'} //헤더
        })
        .success(function(data, status, headers, config) {

            console.log('get_data: ' + angular.toJson(data));

            if( data ) {
                /* 성공적으로 결과 데이터가 넘어 왔을 때 처리 */

                if (data.length == 0) {

                    alert('사용자 정보가 없습니다');

                    $http({
                        method: 'GET', //방식
                        url: 'http://' + localIp + ':47751/user', /* 통신할 URL */
                        headers: {'Content-Type': 'application/json; charset=utf-8'} //헤더
                    })
                    .success(function(data, status, headers, config) {

                        $scope.list = data;

                    })
                    .error(function(data, status, hearders, config) {

                    });

                    return;
                    
                } else {

                    $scope.list = data;
                    $scope.currentPage = 1; //current page
                    $scope.entryLimit = 20; //max no of items to display in a page
                    $scope.filteredItems = $scope.list.length; //Initially for no filter  
                    $scope.totalItems = $scope.list.length;


                    $scope.restoreData = data;

                    $scope.restoreDatalength = data.length;


                    //alert('$scope.userData.length: ' + $scope.userData.length);

                    //alert('$scope.restoreData: ' + $scope.restoreData);

                }
 

                //alert('사용자 데이터를 성공적으로 가져왔습니다');


            }

        })
        .error(function(data, status, headers, config) {
            /* 서버와의 연결이 정상적이지 않을 때 처리 */
            console.log(data);

        });
        
        
    };


    // timeout 인자에 함수 주소만 기입, getUserData() --> x
    getDB = $timeout($scope.getRestoreData, 1000);
    

    dataLoadInterval = $interval($scope.getRestoreData, 60000);
	
})