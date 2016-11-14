var myModule = angular.module('zipModule', []);

myModule.controller('zipCtrl', function ($scope, $http){

    $scope.init = function() {

        $scope.scanpc = '';



        $http.get('http://192.168.0.34:47751/scanpcname')
                .then(function (response) {

                    $scope.scanpc = response.data;

                    console.log('response: ' + pcname);

                    // 현재 scanpc이름으로 저장된 _id 값을 받아온다.
                    $http({
                        method: 'GET', //방식
                        //url: 'http://192.168.0.34:47751/userForId/' + MainService.getPCname(), /* 통신할 URL */
                        url: 'http://192.168.0.34:47751//userForId/:' + $scope.scanpc, /* 통신할 URL */
                        headers: {'Content-Type': 'application/json; charset=utf-8'} //헤더
                        })
                        .success(function(data, status, headers, config) {
                            if( data ) {
                                /* 성공적으로 결과 데이터가 넘어 왔을 때 처리 */

                                //$scope.datas = data;

                                console.log('DBdata_sort: ' + angular.toJson(data));
                            }
                            else {
                                /* 통신한 URL에서 데이터가 넘어오지 않았을 때 처리 */
                            }
                        })
                        .error(function(data, status, headers, config) {
                            /* 서버와의 연결이 정상적이지 않을 때 처리 */
                            console.log(status);
                        });

                    console.log('$scope.scanpc: ' + $scope.scanpc);

                    //alert('$scope.scanpc: ' + $scope.scanpc);

                })
     
    } // END

    $scope.init();

    $scope.delivery = {

      type: '택배'
    }


    $scope.getZipcode = function() {

    };

    var postData;

    $scope.zipcode = function () {

        

        //팝업 위치를 지정(화면의 가운데 정렬)
        var width = 300; //팝업의 너비
        var height = 500; //팝업의 높이
        new daum.Postcode({
                width: width,
                height: height,
            oncomplete: function(data) {
                // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

                // 각 주소의 노출 규칙에 따라 주소를 조합한다.
                // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
                var fullAddr = ''; // 최종 주소 변수
                var extraAddr = ''; // 조합형 주소 변수

                // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                    fullAddr = data.roadAddress;

                } else { // 사용자가 지번 주소를 선택했을 경우(J)
                    fullAddr = data.jibunAddress;
                }

                // 사용자가 선택한 주소가 도로명 타입일때 조합한다.
                if(data.userSelectedType === 'R'){
                    //법정동명이 있을 경우 추가한다.
                    if(data.bname !== ''){
                        extraAddr += data.bname;
                    }
                    // 건물명이 있을 경우 추가한다.
                    if(data.buildingName !== ''){
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    // 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
                    fullAddr += (extraAddr !== '' ? ' ('+ extraAddr +')' : '');
                }

                // 우편번호와 주소 정보를 해당 필드에 넣는다.
                document.getElementById('sample6_postcode').value = data.zonecode; //5자리 새우편번호 사용
                document.getElementById('sample6_address').value = fullAddr;

                // 커서를 상세주소 필드로 이동한다.
                document.getElementById('sample6_address2').focus();
            }
        }).open({
            left: (window.screen.width / 2) - (width / 2),
            top: (window.screen.height / 2) - (height / 2)
        });
    }

    $scope.restoreSave = function () {

        $(document).ready(function() {
            var zipcode = $('#sample6_postcode').val();
            var address = $('#sample6_address').val();
            var addressDetail = $('#sample6_address2').val();

            console.log('zipcode: ' + zipcode);
            console.log('address: ' + address);
            console.log('addressDetail: ' + addressDetail);

            var postJson = new Object();

            postJson.zipcode = zipcode;
            postJson.address = address;
            postJson.addressDetail = addressDetail;

            postData = JSON.stringify(postJson);

            alert(postData);


/*            $http({
            method: 'GET', //방식
            url: 'http://localhost:8080/serverClose'
            })
            .success(function(data) {
                alert(angular.toJson(data));
                return data;
            })
            .error(function() {
                console.log(status);
                return null;
            });*/


            window.close();
        });
    };

})  // end Controller
