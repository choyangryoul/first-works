var app = angular.module('Admin.Scanlist')

app.filter('startFrom', function() {
    return function(input, start) {
        if(input) {
            start = +start; //parse to int
            return input.slice(start);
        }
        return [];
    }
});

// date에서 년도,월,일 만 가져오기
app.filter('datefilter', function() {
    return function(text) {
        var subDate = text.substring(0, 10);
        return subDate
    }
});

app.controller('ScanlistCtrl', function($scope, $http, $window, $interval, $timeout, MainService, CommonService) {

    $scope.currentPage = 0;
    $scope.pageSize = 10;

    $scope.restoreViewFlag = true; // 복원이 없을경우(false) 복원내역 버튼이 안보임.
    var dataLoadInterval;
    var getDB;

    var moment = require('moment');
    var ip = require('ip');

    $scope.currentServerip = ip.address();


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

    $scope.reloadState = function() {
        $window.location.reload(); 
    }

    $scope.getUserData = function () {

        $scope.currentPage = 1; //current page
        $scope.entryLimit = 10; //max no of items to display in a page

        var url = 'http://' + localIp + ':47751/user'

        $http.get(url)
        .then( function(response) {

            var data = response.data;

            var id = data._id;

            //console.log('get_data: ' + angular.toJson(data));

            if( data ) {
                /* 성공적으로 결과 데이터가 넘어 왔을 때 처리 */

                if (data.length == 0) {

                    alert('사용자 정보가 없습니다');
                    
                } else {

                    $scope.list = data;
                    $scope.filteredItems = $scope.list.length; //Initially for no filter  
                    $scope.totalItems = $scope.list.length;



                    $scope.userData = data;

                    $scope.userDatalength = data.length;


                    // TO DO ///
                    for (var i = 0; i < $scope.userDatalength; i++) {


                    }
                    
                    console.log('filteredItems: ' + $scope.filteredItems);

                }
            }

            return $scope.userData;

        })
        .catch(function(error) {
            /* 서버와의 연결이 정상적이지 않을 때 처리 */
            console.log(error);

        });
        
    };

    // timeout 인자에 함수 주소만 기입, getUserData() --> x
    getDB = $timeout($scope.getUserData, 2000);
    

    dataLoadInterval = $interval($scope.getUserData, 60000);

    $scope.printData = function(data) {

        alert('username: ' + data.username);

        return;
    }


    $scope.openDetailView = function(id, strPath) {

        var uid = id;

        console.log('uid : ' + uid);

        console.log('strPath : ' + strPath);


        MainService.getMongoData(uid, strPath);

    };

    $scope.getEqualDate = function(dbDate) { // 오늘날짜와 비교를 해서 같으면 날짜 색상을 변경한다

        if (dbDate.substring(0, 10) === moment().format('YYYY-MM-DD')) {

            $scope.dateFlag = true;
        } else {

            $scope.dateFlag = false
        }

        return $scope.dateFlag;
    };

})

	
