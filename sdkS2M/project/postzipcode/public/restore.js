var myModule = angular.module('zipModule', []);

myModule.controller('zipCtrl', function ($scope, $http, $timeout){
    
    $scope.scanpc = '';
    $scope.currentObjid = '';
    var DB_URL = 'http://192.168.0.34:47751';

    $scope.reName = '';
    $scope.reNum1 = '';
    $scope.reNum2 = '';
    $scope.reNum3 = '';
    $scope.reZipcode = '';
    $scope.reAddr = '';
    $scope.reAddrDetail = '';
    
    
    $scope.init = function() {

        // client scanpc 이름 구하기
        $http.get('http://localhost:8080/scanpcname')
            .then(function (response) {

                $scope.scanpc = response.data;
            })
            .catch(function(response) {

                console.log(response.data);
            })

        // 복원수령 radio버튼이 전부 체크하지 않은 상태로 만든다
        $scope.uncheck = function (event) {
        if (scope.checked == event.target.value) {

            $scope.checked = false
        }
    }
     
    } // END

    $scope.init();

    var postData;

    // 전화번호 필드 auto tab 실행
    $(".inputs").keyup(function () {
        if (this.value.length == this.maxLength) {
          var $next = $(this).next('.inputs');
          if ($next.length)
              $(this).next('.inputs').focus();
          else
              $(this).blur();
        }
    });


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

        var reid = $scope.currentObjid;

        console.log('reid: ' + reid);


        reName = $('#name').val();
        reNum1 = $('#phone1').val();
        reNum2 = $('#phone2').val();
        reNum3 = $('#phone3').val();
        reZipcode = $('#sample6_postcode').val();
        reAddr = $('#sample6_address').val();
        reAddrDetail = $('#sample6_address2').val();
        var restoreType = $("input:radio[name='restore']:checked").val();

        var reAddress = '(' + reZipcode + ') ' + reAddr + ' ' + reAddrDetail;

        var phoneNumber = reNum1 + '-' + reNum2 + '-' + reNum3;


        if (restoreType == '직접수령') {
            reAddress = '';
        }


        var closeConf = confirm('종료 하시겠습니까? \n 복원 완료날짜에 관한건은 카운터에 문의 하십시오');

        if (closeConf) {
        
            $http.get(DB_URL + '/userForId/' + $scope.scanpc)
                .then(function(response) {

                    var uid = response.data._id;

                    console.log('RESTORE user data: =================> ' + angular.toJson(response.data));
                    $http({
                            method: 'POST', //방식
                            //url: 'http://192.168.0.34:47751/restore', /* 통신할 URL */
                            url: DB_URL + '/restore', /* 통신할 URL */
                            data: {
                                restorename: reName,
                                restorephone: phoneNumber,
                                restoreaddress: reAddress,
                                restoretype: restoreType,
                                restorepcname: $scope.scanpc,
                                restoreid: uid
                            }, /* 파라메터로 보낼 데이터 */
                            headers: {'Content-Type': 'application/json; charset=utf-8'} //헤더
                        })
                })
                .then(function(response) {
                    
                    //console.log('RESTORE POST RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR');

                    //window.close();
                })
                .catch(function(response) {
                    /* 서버와의 연결이 정상적이지 않을 때 처리 */
                    console.log(status);
                });

                $timeout(function() {

                    window.close()
                }, 100);
            } else {

                return;
                
            } // end closeConf
    };



    $scope.getObjid = function() {

        var path = DB_URL + '/userForId/' + $scope.scanpc;

        console.log('path: ' + path);
            
        $http.get(path)
            .success(function(data, status, headers, config) {
                if( data ) {
                    /* 성공적으로 결과 데이터가 넘어 왔을 때 처리 */

                    $scope.currentObjid = data._id;

                    console.log('currentObjid: ' + $scope.currentObjid);

                    return $scope.currentObjid;
                }
                else {
                    /* 통신한 URL에서 데이터가 넘어오지 않았을 때 처리 */
                }
            })
            .error(function(data, status, headers, config) {
                /* 서버와의 연결이 정상적이지 않을 때 처리 */
                console.log(status);
            });

            console.log('get_curid: ' + $scope.currentObjid);

            return $scope.currentObjid;
    };

})  // end Controller
