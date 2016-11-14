angular.module('S2M.User')

	.controller('UserCtrl', function($scope, $http, $location, $window, $routeParams, CommonService, MainService) {

		var user = this;


		$scope.adminName = 'admin';
		$scope.adminEmail = '1212';

		$scope.pageClass = 'page-home'; // ng-animate

		user.selectDirection = '#/booklist'; // default direction 값

		user.directionFlag = false;

        $scope.officeInfom = "";


		user.PCName = MainService.getPCname();

        $scope.init = function() {

            var url = CommonService.getServerUrl() + '/optionprice'

            $http.get(url)
            .then(function(response) {

                var data = response.data;
 
                if (data) {

                    if (data.length !== 0) {

                        $scope.officeInfom = data[0].officeInfom;
                    }

                }

            })
            .catch(function(response) {

                console.log(response);
                alert('error area');
            });
        }

        

        // argument.callee.caller.name 함수의 대안으로 기명함수를 써야한다
		$scope.setUserDir = function setUserDir(name, email) {

/*            if (user.userForm.$invalid) {

                alert('invalid');
            }*/

            MainService.setDirectory(name, email);
		};

        // Enter key press event -- email input 에서 Enter key 클릭시 다음 진행
        $('#emailInput').keypress(
            function(e){
                if (e.keyCode == 13) {
                    $('#btnSave').click();
                }
            });
        
        

/*		$scope.$watch('user.userName', function(newVal, oldVal) {

            if(newVal === oldVal) {
                return;
            };


            if ($scope.adminName == user.userName) {

            	user.adminNameFlag = true;
            } else {

            	user.adminNameFlag = false;
            }

           
        });

        $scope.$watch('user.userEmail', function(newVal, oldVal) {

            if(newVal === oldVal) {
                return;
            };

            if ($scope.adminEmail == user.userEmail) {

            	user.adminEmailFlag = true;
            } else {

            	user.adminEmailFlag = false;
            }
           
        });*/

        moment.locale('ko');

        $scope.now  = moment().format('LLLL');

        $scope.init();

	});