var app = angular.module('UserDetail', [])

// date에서 년도,월,일 만 가져오기
app.filter('datefilter', function() {
    return function(text) {
        var subDate = text.substring(0, 10);
        return subDate
    }
});

app.controller('userDetailCtrl', function($scope, $http, $timeout) {


	var ip = require('ip');
	var gui = require('nw.gui');
    var moment = require('moment');
    var win = gui.Window.get();
    var data = win.data;

    $scope.userData = data.user;
    $scope.restoreData = data.restore[0];

    $(".utoggleBooklistDetailView").hide();
    $(".rtoggleBooklistDetailView").show();

    $(".utoggleBooklist").click(function() {
        $(".utoggleBooklistDetailView").toggle();
    })

    $(".rtoggleBooklist").click(function() {
        $(".rtoggleBooklistDetailView").toggle();
    })

    $scope.includeDelCost = $scope.userData.totalCost;

    console.log('$scope.restoreData: ' + $scope.restoreData);

    $scope.deliveryCost = 0;

    $scope.reType = ''; // 상세정보에 보여줄 택배/직접수령/없음 표시

    moment.locale('ko');

    $scope.startScanTime = moment($scope.userData.createdOn).format('LTS');
    $scope.endScanTime = moment($scope.userData.scanEndTime).format('LTS');
    

    console.log('$scope.userData: ' + angular.toJson($scope.userData));
    console.log('$scope.restoreData: ' + angular.toJson($scope.restoreData));



    $scope.init = function() {

        var url = 'http://' + ip.address() + ':47751/optionprice'

        $http.get(url)
            .then(function(response) {

                var data = response.data;

                if( data ) {
                    /* 성공적으로 결과 데이터가 넘어 왔을 때 처리 */

                    if (data.length === 0) {

                        console.log('First data');

                    } else {

                        $scope.optionData = data;

                    }
                }

                return $scope.optionData;

            })
            .then(function(response) {

                console.log('data_userpage: ' + angular.toJson(response));


                var optionData = response;

                $scope.retinaCost = 0;
                $scope.ocrCost = 0;
                $scope.optionCost = 0;
                $scope.sumPage = 0;
                $scope.isDelivery = false;

                $scope.musunCount = 0;
                $scope.lezakCount = 0;
                $scope.springCount = 0;
                $scope.hardcoverCount = 0;
                $scope.selectedOption = [];

                $scope.totalBookCount = $scope.userData.bookItems.length;
                $scope.restoreBookCount = 0;

                console.log('data: ' + angular.toJson(data));

                for (var i = 0; i < $scope.userData.bookItems.length; i++) {

                    $scope.retinaCost += $scope.userData.bookItems[i].retinaCost;
                    $scope.ocrCost += $scope.userData.bookItems[i].ocrCost;
                    $scope.pages += $scope.userData.bookItems[i].page;




                    $scope.regBookCount = optionData.cuttingcost / 1000;

                    console.log('regBookCount: ' + $scope.regBookCount);


                    if ($scope.userData.bookItems[i].restore != null) {

                        var items = $scope.userData.bookItems[i].restore.item;
                    

                        console.log('test: ' + items);

                        if (items === '무선(본드)') {

                            ++$scope.musunCount;

                        } else if (items === '레자크') {

                            ++$scope.lezakCount;

                        } else if (items === '스프링') {

                            ++$scope.springCount;

                        } else if (items === '양장(하드커버)') {

                            ++$scope.hardcoverCount;

                        }

                        ++$scope.restoreBookCount;

                    } // end null


                    if ($scope.userData.bookItems[i].isRetina) {

                        $scope.userData.bookItems[i].isRetina = '레티나';

                    } else {

                        $scope.userData.bookItems[i].isRetina = '';                        

                    };

                    if ($scope.userData.bookItems[i].isOcr) {

                        $scope.userData.bookItems[i].isOcr = 'OCR';

                    } else {

                        $scope.userData.bookItems[i].isOcr = '';    

                    }


                    //console.log('musunCount: ' + $scope.musunCount);

                    if ($scope.userData.bookItems[i].page) {

                        $scope.sumPage += parseInt($scope.userData.bookItems[i].page);
                    }

                    $scope.isRestore = $scope.userData.bookItems[i].checkRestore;


                    if ($scope.isRestore) {

                        $scope.isDelivery = true;

                    };

                } // end for

                console.log('retinaCost: ' + $scope.retinaCost);
                console.log('page: ' + $scope.sumPage);

                $scope.optionCost = $scope.retinaCost + $scope.ocrCost;




                if ($scope.isDelivery == false) {

                    console.log('restoreData is null');

                    $scope.strRestoreType = '없 음';

                } else {

                    if ($scope.restoreData == false) {

                        console.log('restoreType is false');

                        return;
                    } else {

                        console.log('restoreData is not null');

                        console.log('$scope.restoreData : ' + angular.toJson($scope.restoreData));

                        $scope.strRestoreType = $scope.restoreData.restoreType

                        console.log('$scope.strRestoreType ' + $scope.strRestoreType);

                        

                        if ($scope.strRestoreType === '택배') {

                            $scope.deliveryCost = optionData[0].deliveryCost;

                            $scope.includeDelCost += $scope.deliveryCost; 

                            return;

                        } else {

                            console.log('$scope.restoreData.restoreType: ' + $scope.restoreData.restoreType);
                        }
                    } // end strRestoreType


                } // end isDelivery


            })
            .catch(function(error) {

                console.log(error)
            })

    }; // END init


    $scope.init();

    $scope.scanPrint = function() {
        window.print();
    }
    	 
})