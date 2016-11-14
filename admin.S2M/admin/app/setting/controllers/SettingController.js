angular.module('Admin.Setting')

.controller('SettingCtrl', function($scope, $http, MainService) {


	var localIp = MainService.getIP();

	$scope.optionData = {};

	$scope.init = function() {

		$http.get('http://' + localIp + ':47751/optionprice')
		.then(function(response) {

			var data = response.data;

			// DB에 있는 옵션은 배열
			var optionData = data[0];

			$scope.setScancost = optionData.defaultScancost;
			$scope.setCuttingcost = optionData.cuttingcost;
			$scope.setRetina = optionData.retina;
			$scope.setOcr = optionData.ocr;
			$scope.setDeliverycost = optionData.deliveryCost;
			$scope.setMusun = optionData.restore[0].price;
			$scope.setLezak = optionData.restore[1].price;
			$scope.setSpring = optionData.restore[2].price;
			$scope.setHardcover = optionData.restore[3].price;
			$scope.officeInfom = optionData.officeInfom;


			console.log('$scope.optionData------->: ' + angular.toJson($scope.optionData));
		})
		.catch(function(response) {

			console.log(response);
		})


		//console.log('This is setting Area');


	} // end init

	$scope.init();


	$scope.updateOptionprice = function() {

		var optionConfirm = confirm('저장 하시겠습니까?');

		if (optionConfirm) {

			var defaultScancost = parseInt($scope.setScancost);
			var cuttingcost = parseInt($scope.setCuttingcost);
			var retina = parseInt($scope.setRetina);
			var ocr = parseInt($scope.setOcr);
			var deliveryCost = parseInt($scope.setDeliverycost);

			var restore = [
	            {
	                itemNo: 0,
	                item: "무선(본드)",
	                price: parseInt($scope.setMusun)
	            },
	            {
	                itemNo: 1,
	                item: "레자크",
	                price: parseInt($scope.setLezak)
	            },
	            {
	                itemNo: 2,
	                item: "스프링",
	                price: parseInt($scope.setSpring)
	            },
	            {
	                itemNo: 3,
	                item: "양장(하드커버)",
	                price: parseInt($scope.setHardcover)
	            }
	        ];

	        var officeInfom = $scope.officeInfom;

			$http({
	                method: 'PUT', //방식
	                url: 'http://' + localIp + ':47751/updateOption', /* 통신할 URL */
	                //url: 'http://192.168.0.24:47751/userForUpdate/' + $scope.currentObjid, /* 통신할 URL */
	                data: {
	                    defaultScancost: defaultScancost,
						cuttingcost: cuttingcost,
						retina: retina,
						ocr: ocr,
						deliveryCost: deliveryCost,
						restore: restore,
						officeInfom: officeInfom

	                }, /* 파라메터로 보낼 데이터 */
	                headers: {'Content-Type': 'application/json; charset=utf-8'} //헤더
	            })
	            .then(function(response) {

	                //console.log('response: ' + angular.toJson(response.data.restore[0]));
	                
	            })
	            .catch(function(response) {

	                console.log(response);

	            })
	        } else {

	        	return;
	        } // end optionConfirm
            

	} // end updateOptionprice



})