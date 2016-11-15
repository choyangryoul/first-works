angular.module('S2M.Booklist')


    // CONTROLLER
    .controller('BooklistCtrl', function($scope, $http, $window, $location, $timeout, $interval, $routeParams, CommonService, ContentService, MainService) {
        var booklist = this;

        var fs = require('fs');
        var gui = require('nw.gui');
        var path = require('path');
        var os = require('os');
        

        $scope.pageClass = 'page-booklist';

        booklist.content = {};

        booklist.content = ContentService.list();

        $scope.setPage = 0;

        booklist.pageFlag = true;
        booklist.editFlag = false;
        booklist.addCompleteFlag = false;
        booklist.completeWorkFlag = false;

        booklist.completeIdArray = []; // 완료된 Row에 class를 적용하기위해 해당 ID를 저장한다.
        booklist.disabledFlag = [];

        booklist.completeRow = false;

        $scope.closeFlage = false;

        

        //booklist.isRestore = true; // true: 복원선택사항이 안보임, false: 복원선택사항이 보임.

        //booklist.newContent.checkRestore = false; // 복원 checkbox check 유무 , true->checked, false->unchecked

        $scope.selectedRestoreItemNo = -1;
        

        $scope.calRetina = 0;
        $scope.calOcr = 0;
        $scope.calRestore = 0;

        
        $scope.sumOptionPrice = 0;  // 각 Row별 옵션비용 총계.
        $scope.totalOptCost = 0; // 전체 옵션비용(레티나, OCR, 복원) 총계.


        $scope.totalRestoreCost = 0;

        booklist.okSign = false;

        $scope.scanBookCount = '';

        $scope.currentObjid = '';

        $scope.scanTimeCost = 0;

        $scope.scanBookCount = 0;

        $scope.startTime = 0;

        $scope.addCostInterval = '';

        $scope.Mdb = '';

        $scope.endTime = '';
        $scope.startTime = '';

        var startTimeout;
        var startTimeInterval;

        //booklist.newContent.sumOptionPrice = 0;
        $(document).ready(function() {
            $('#demo-basic').poshytip();
        });

        // retina, ocr, page 를 감시해서 변하면 매번 아래 함수를 불러와야 한다.
        // 문제가 있다.
        // 서버와 매번 연결해야 한다. 흠........
        // 비용 부분이 안맞는다..
        // 12시다 졸리다..아훙...


        /**************************************************
        /** option JSON 파일에서 처음 한번만 값을 가져온다. **
        /**************************************************/

        $scope.init = function() {

            $http.get(CommonService.getServerUrl() + '/optionprice')
            //$http.get('http://192.168.0.34:47751/optionprice')
                .then(function (response) { 
                    var optionData = response.data[0];

                    $scope.defaultCost = optionData.defaultScancost;
                    $scope.cuttingCost = optionData.cuttingcost;
                    $scope.retina = optionData.retina;
                    $scope.ocr = optionData.ocr;
                    $scope.deliveryCost = optionData.deliveryCost;
                    $scope.restoresObj = optionData.restore;

                    console.log('This data is called at once for the first time');

                    /***********************************/
                    /* booklist.newContent 초기값 설정. */
                    /***********************************/

                    booklist.newContent = {
                        title: '',
                        page: '',
                        isRetina: false,
                        isOcr: false,
                        sumOptionPrice: 0,
                        retinaCost: 0,
                        ocrCost: 0,
                        checkRestore: false,
                        totalRestoreCost: 0,
                        restore: {
                            itemNo: '',
                            item: '',
                            price: 0
                        }

                    };

                    /***********************************/
                    /***********************************/

                    //console.log('$scope.restores: ' + $scope.restores);
                })



/*                $("#cTitle").keypress(function(e){
                    if ( e.which === 13 ) {
                        console.log("Prevent form submit.");

                        $('#addBookBtn').click();
                        
                        e.preventDefault();
                    }
                });*/

        }

        $scope.init();

        $('#emailInput').keypress(
            function(e){
                if (e.keyCode == 13) {
                    $('#btnSave').click();
                }
        });

        /***********************************************************************************/
        /***********************************************************************************/
        /***************** DAUM open API 를 이용해 도서 ISBN 을 얻어온다. ********************/
        /***********************************************************************************/
        /***********************************************************************************/

        $scope.isbnToTitle = function(isbn) {

            if ( angular.element('#cTitle').val() == '') {
                alert('ISBN 또는 제목을 넣어주세요');
                angular.element('#cTitle').focus();
                return;
            }

            console.log('isbn=' + isbn);
                $.ajax({
                    type: 'GET', //방식
                    dataType: "jsonp",
                    url: "https://apis.daum.net/search/book?q="+isbn, /* 통신할 URL */
                    //jsonp: "callback",
                    data: {
                        apikey: "0d9b1fcb098f86f12524dcff02e2c1cf",
                        q: "다음카카오",
                        output: "json",
                        //searchType: "title"

                    }, /* 파라메터로 보낼 데이터 */
                    headers: {'Content-Type': 'application/json; charset=utf-8'} //헤더
                })
                    .success (function(data) {
                        //console.log('data --> ' + angular.toJson(data));
                        if (data.channel.result !== '0') {
                            for( var i = 0; i < data.channel.result; i++) {

                            
                                console.log('result: ' + data.channel.result);
                                console.log('isbn data: ' + angular.toJson(data.channel.item[i]));

                                var title = data.channel.item[i].title;
                                var author = data.channel.item[i].author_t;
                                //var coverImage = data.channel.item[i].cover_s_url; (커버 이미지)
                                console.log('결과: ' + title+ '(' + author + ')');

                                var result = title + ' (' + author + ')';

                                angular.element('#cTitle').val(result);

                                booklist.newContent.title = result;

                                //$scope.saveContents();

                                angular.element('#cTitle').focus();

                                console.log('newCon: ' + isbn);
                            }
                        } else {
                            console.log('result: ' + data.channel.result);
                            alert('ISBN에 해당하는 자료가 없습니다.');
                            angular.element('#cTitle').val('');
                            angular.element('#cTitle').focus();
                            return;
                        }
                        
                    })
                                        //console.log('title=' + title);
                    .error (function (err) {
                        console.log('err=' + err);
                    })

        
        }

        /***********************************************************************************/
        /***********************************************************************************/
        /***********************************************************************************/


        /************************************************************/
        /***************** SCANNER DETECTION ************************/
        /************************************************************/

        $(document).ready(function() {
            var pressed = false; 
            var chars = [];
            $(window).keypress(function(e) {
                if (e.which >= 48 && e.which <= 57) {
                    chars.push(String.fromCharCode(e.which));
                }
                console.log(e.which + ":" + chars.join("|"));
                if (pressed == false) {
                    setTimeout(function(){
                        if (chars.length >= 10) {
                            var barcode = chars.join("");
                            console.log("Barcode Scanned: " + barcode);
                            // assign value to some input (or do whatever you want)
                            $scope.isbnToTitle(barcode);
                        }
                        chars = [];
                        pressed = false;
                    },300);
                }
                pressed = true;
            });
        });


        /************************************************************/
        /************************************************************/
        /************************************************************/

                angular.element('#cTitle').focus();




  
        $scope.saveContents = function () {

            $scope.selectedId = -1;


            if ($scope.selectedRestoreItemNo === -1 && booklist.newContent.checkRestore) {
                alert('복원 종류를 선택해주세요.');

                return;
            }

            var ctitle = document.getElementById('cTitle');


            $.fn.selectRange = function(start, end) {
                return this.each(function() {
                     if(this.setSelectionRange) {
                         this.focus();
                         this.setSelectionRange(start, end);
                     } else if(this.createTextRange) {
                         var range = this.createTextRange();
                         range.collapse(true);
                         range.moveEnd('character', end);
                         range.moveStart('character', start);
                         range.select();
                     } 
                 });
            };

            if(angular.element('#cTitle').val().trim()  == '') {

                alert('제목을 입력해 주세요');
                angular.element('#cTitle').val('');

                // angular.element('#cTitle').val().replace(/(\s*)/g, '');

                angular.element('#cTitle').focus();

/*                if (ctitle.value !== '') {

                    ctitle.value = ctitle.replace(/(^\s*)|(\s*$)/g, "");

                    // use like this 
                    ctitle.selectRange(1,1);
                }*/

                return;

            } else {

                // title 특수 문자 제거
                booklist.newContent.title = MainService.getDeleteChar(ctitle.value);

                booklist.newContent.title = booklist.newContent.title.replace(/(^\s*)|(\s*$)/g, "");

                if (booklist.newContent.title === '') {

                    alert('특수 문자는 입력할 수 없습니다. \n 제목을 입력해 주세요');
                    angular.element('#cTitle').val('');

                // angular.element('#cTitle').val().replace(/(\s*)/g, '');

                    angular.element('#cTitle').focus();

                    return;
                }

                if (booklist.newContent.page !== '') {
                    booklist.newContent.page = parseInt(booklist.newContent.page);
                }

                booklist.newContent.retinaCost = $scope.calRetina;
                booklist.newContent.ocrCost = $scope.calOcr;

                ContentService.save(booklist.newContent);

                booklist.newContent = {};

                document.getElementById('cTitle').focus();
                
            }

            booklist.pageFlag = true;


            console.log('pageflag: ' + booklist.pageFlag);
            console.log('content = ' + JSON.stringify(booklist.content));

            console.log('$scope.calRetina: ' + $scope.calRetina);

            booklist.newContent.sumOptionPrice = 0;

            $scope.calRetina = 0;
            $scope.calOcr = 0;
            $scope.calRestore = 0;

            //alert('typeof(booklist.totalOptionCost): ' + typeof(ContentService.getTotalCost()));

            $scope.totalOptCost = ContentService.getTotalCost(); // 전체 옵션 비용을 계산한다.

            // 전체 복원비용을 계산한다.(추후에 DB에 저장 예정.)
            $scope.totalRestoreCost = ContentService.getTotalRestoreCost();
            

            console.log('$scope.totalRestoreCost:' + $scope.totalRestoreCost);

            //angular.element('#cTitle').focus();

        };

     
     
        booklist.delete = function (id) {
     
            ContentService.delete(id);
            if (booklist.newContent.id == id) booklist.newContent = {};

            $scope.totalOptCost = ContentService.getTotalCost(); // 전체 옵션 비용을 계산한다.

            // 전체 복원비용을 계산한다.(추후에 DB에 저장 예정.)
            $scope.totalRestoreCost = ContentService.getTotalRestoreCost();
        };
     
     
        booklist.edit = function (id) {

            booklist.newContent = angular.copy(ContentService.get(id));

            if (angular.fromJson(booklist.newContent.checkRestore)) {

                var selectedItemNo = angular.fromJson(booklist.newContent.restore.itemNo);
                var selectedRestorePrice = angular.fromJson(booklist.newContent.restore.price)


                $scope.selectedRestoreItemNo = selectedItemNo;
                $scope.calRestore = selectedRestorePrice;

                //booklist.getSumOptionPrice();

            } else {
                return;
            }

            $scope.calRetina = angular.toJson(booklist.newContent.retinaCost);
            $scope.calOcr = angular.toJson(booklist.newContent.ocrCost);

            $scope.sumOptionPrice = $scope.calRetina + $scope.calOcr + $scope.calRestore;
 
 
            console.log('edited_$scope.calRetina:==============>' + $scope.calRetina);
            console.log('edited_$scope.calOcr:==============>' + $scope.calOcr);
            console.log('edited_$scope.calRestore:==============>' + $scope.calRestore);
            console.log('edited_$scope.sumOptionPrice:==============>' + $scope.sumOptionPrice);

            booklist.getSumOptionPrice();

            /********************************************/

        };



        // 복원 종류 클릭시.

        booklist.selectedRestoreType  = function(index) {

            $scope.calRestore = $scope.restoresObj[index].price;
            $scope.resType = $scope.restoresObj[index].item;

            booklist.newContent.restore = {
                "itemNo": index,
                "item": $scope.resType,
                "price": $scope.calRestore
            };


            booklist.getSumOptionPrice();

        }


        booklist.fetchDataAndCalPrice = function() {

            if (booklist.newContent.isRetina && booklist.newContent.isOcr) {


                $scope.calRetina = parseInt(($scope.setPage * $scope.retina) / 100); // DB에 있는 retina 비용을 setPage 에 곱한다. 

                $scope.calOcr = parseInt(($scope.setPage * $scope.ocr) / 100); // DB에 있는 ocr 비용을 setPage 에 곱한다.

            } else if (booklist.newContent.isRetina && !booklist.newContent.isOcr) {


                $scope.calRetina = parseInt(($scope.setPage * $scope.retina) / 100); // DB에 있는 retina 비용을 setPage 에 곱한다. 
                $scope.calOcr = 0;

            } else if (!booklist.newContent.isRetina && booklist.newContent.isOcr) {


                $scope.calOcr = parseInt(($scope.setPage * $scope.ocr) / 100); // DB에 있는 ocr 비용을 setPage 에 곱한다.

                $scope.calRetina = 0;

            } else {

                booklist.newContent.isRetina = false;
                booklist.newContent.isOcr = false;

                $scope.calRetina = 0;
                $scope.calOcr = 0;
            }


            booklist.newContent.retinaCost = $scope.calRetina;
            booklist.newContent.ocrCost = $scope.calOcr;

            console.log('fetch_CALRESTORE: ' + $scope.calRestore);
            console.log('CALOCR: ' + $scope.calOcr);
            console.log('CALRETINA: ' + $scope.calRetina);

            console.log('booklist.newContent.sumOptionPrice----------------------> ' + booklist.newContent.sumOptionPrice);

            booklist.getSumOptionPrice();

        };


        booklist.getSumOptionPrice = function() {


            if (booklist.newContent.isRetina && booklist.newContent.isOcr) {


                $scope.calRetina = parseInt(($scope.setPage * $scope.retina) / 100); // DB에 있는 retina 비용을 setPage 에 곱한다. 

                $scope.calOcr = parseInt(($scope.setPage * $scope.ocr) / 100); // DB에 있는 ocr 비용을 setPage 에 곱한다.

            } else if (booklist.newContent.isRetina && !booklist.newContent.isOcr) {


                $scope.calRetina = parseInt(($scope.setPage * $scope.retina) / 100); // DB에 있는 retina 비용을 setPage 에 곱한다. 
                $scope.calOcr = 0;

            } else if (!booklist.newContent.isRetina && booklist.newContent.isOcr) {


                $scope.calOcr = parseInt(($scope.setPage * $scope.ocr) / 100); // DB에 있는 ocr 비용을 setPage 에 곱한다.

                $scope.calRetina = 0;

            } else {


                $scope.calRetina = 0;
                $scope.calOcr = 0;
            }


            booklist.newContent.sumOptionPrice = parseInt($scope.calRetina + $scope.calOcr + $scope.calRestore);

            console.log('getSumFunc_booklist.newContent.restore----------------------> ' + angular.toJson(booklist.newContent.restore));

            console.log('getSumFunc_$scope.calRetina:==============>' + $scope.calRetina);
            console.log('getSumFunc_$scope.calOcr:==============>' + $scope.calOcr);
            console.log('getSumFunc_$scope.calRestore:==============>' + $scope.calRestore);


        };


        // 페이지값을 감시를 하며 setPage 값을 변경한다.
        $scope.$watch('booklist.newContent.page', function(newVal, oldVal) {

            if(newVal == oldVal) { // 처음 구동시 둘다 undefined 임.

                return;
            }


            console.log('oldVal===>', oldVal);
            console.log('newVal===>', newVal);


            // input page 값을 watching 하면서 page 값에 변화에 따라 checkbox 값을 변경한다.
            // 새로들어온 값(newVal)이 null 이면 retina, ocr check 값을 unchecked 값으로 만든다.
            // page값이 없으면 pageFlag값을 true로 변경해서 CSS style을 불러옴.(disabled 값)
            
            
            // newContent가 save 버튼클릭으로 인해 newContent.page 가 undefined가 됨.
            
            if (newVal == '' || angular.isUndefined(newVal) || newVal <= 0) {


                booklist.newContent.page = '';
                booklist.newContent.isRetina = false;
                booklist.newContent.isOcr = false;

                booklist.pageFlag = true;

                $scope.calRetina = 0;
                $scope.calOcr = 0;

            } else {

                if (parseInt(newVal) == 0) {
                    booklist.pageFlag = true;
                } else {
                    booklist.pageFlag = false;
                }

                (parseInt(newVal) > 0 && parseInt(newVal) < 100) ? $scope.setPage = 100 : $scope.setPage = parseInt(booklist.newContent.page - (booklist.newContent.page % 100));


                if (booklist.newContent.isRetina && booklist.newContent.isOcr) {

                    $scope.calRetina = parseInt(($scope.setPage * $scope.retina) / 100);

                    $scope.calOcr = parseInt(($scope.setPage * $scope.ocr) / 100);

                } else if (booklist.newContent.isRetina && !booklist.newContent.isOcr) {

                    $scope.calRetina = parseInt(($scope.setPage * $scope.retina) / 100);
                    $scope.calOcr = 0;

                } else if (!booklist.newContent.isRetina && booklist.newContent.isOcr) {

                    $scope.calOcr = parseInt(($scope.setPage * $scope.ocr) / 100);
                    $scope.calRetina = 0;

                } else {

                    $scope.calRetina = 0;
                    $scope.calOcr = 0;
                }

                /*if (booklist.newContent.isOcr) {
                    $scope.calOcr = parseInt(($scope.setPage * $scope.ocr.price) / 100);
                } else {
                    $scope.calOcr = 0;
                }*/
                 //booklist.fetchDataAndCalPrice();


                /*if (booklist.newContent.isRetina || booklist.newContent.isOcr) {
                    booklist.newContent.sumOptionPrice = $scope.calRetina + $scope.calOcr;
                };*/

                console.log('oldVal===>', oldVal);
                console.log('newVal===>', newVal);

                console.log('$watch_$scope.calRetina--->' + $scope.calRetina);
                console.log('$watch_$scope.calOcr--->' + $scope.calOcr);

            }



            booklist.getSumOptionPrice();

            console.log('booklist.newContent.sumOptionPrice:-->>>>> ' + booklist.newContent.sumOptionPrice);

        })


        $scope.$watch('booklist.newContent.checkRestore', function(newVal, oldVal) {

            if(newVal === oldVal) {
                return;
            };

            if (!newVal && !angular.isUndefined($scope.calRestore)) {

                $scope.selectedRestoreItemNo = -1;
            }

            if (!newVal) {
                if ($scope.selectedRestoreItemNo === -1) {
                    //$scope.radioValue = angular.element('input[type=radio][name=restore]:checked').val();

                    //angular.element("input:radio[name='restore']:radio[value='" + $scope.radioValue + "']").attr("checked",false);

                    $scope.calRestore = 0;

                    booklist.newContent.restore = null;

                    booklist.getSumOptionPrice();
                }
            }
           
        });

        // input page 숫자만 입력하게 하는 function

        booklist.inputNumberKeycode = function (Ev) {
                if (window.event) { // IE코드
                    var code = window.event.keyCode;
                } else { // 타브라우저
                    var code = Ev.which;
                }
             
                if ((code > 34 && code < 41) || (code > 47 && code < 58) || (code > 95 && code < 106) || code == 8 || code == 9 || code == 13 || code == 46)
                {
                    window.event.returnValue = true;
                    return;
                }
             
                if (window.event) {
                    window.event.returnValue = false;
                } else {
                    Ev.preventDefault();    
                }
        }



        // node-regedit Library
        // regedit 생성, 변경, 삭제 가능하게 해줌
        // 스캔 프로그램 기본설정 폴더를 변경해주는 함수.
        
        $scope.activeXtest = function(content) {

            var regedit = require('regedit')

            var userDir = MainService.getUserDirName();

            var title = content.title;

            if (content.isRetina && content.isOcr) {

                title = title + '_k1_ocr';
            } else if (content.isRetina) {

                title = title + '_k1';
            } else if (content.isOcr) {

                title = title + '_ocr';
            } else {

                title = title;
            }


            /*regedit.deleteKey(['HKCU\\Software\\Canon Electronics Inc.\\CapturePerfect 3.0\\General\\ScanBatch_Dir', 'HKCU\\Software\\Canon Electronics Inc.\\CapturePerfect 3.0\\General\\ScanBatch_Title'], function(err) {
                
                console.log(err);
            });*/

           
            var valuesToPut = {
                'HKCU\\Software\\Canon Electronics Inc.\\CapturePerfect 3.0\\General': {
                    'ScanBatch_Dir': {
                        value: userDir + '\\' + title, // openDir 경로를 넣어준다.
                        type: 'REG_SZ'
                    },
                    'ScanBatch_Title': {
                        value: '111',
                        type: 'REG_SZ'
                    }
                }
            }

            regedit.putValue(valuesToPut, function(err) {

                if (err) {
                    alert(err);
                } else {
                    alert('regedit success');
                }

            })

        /*var regedit = require('node-reg');
 
        regedit.addKey(
        {
            target: 'HKEY_CURRENT_USER\\Software\\Canon Electronics Inc.\\cho',
            name: 'ScanBatch_Dir',
            value: 'C:\\HoominClient\\work\\cho',
            type: 'REG_SZ'
        }).then(function(result) {
            console.log(result)
            alert(result);
        });

        regedit.addKey(
        {
            target: 'HKEY_CURRENT_USER\\Software\\Canon Electronics Inc.\\cho',
            name: 'ScanBatch_Title',
            value: '111',
            type: 'REG_SZ'
        }
        ).then(function(result) {
            console.log(result)
        });
        
         
        regedit.getKey({
            target: 'HKCU\\Software\\testReg'
        }).then(function(result) {
            console.log(result);
        });
*/
        }

        // node.js 외부 프로그램 실행
        // 스캔 프로그램을 실행해주는 함수.

        $scope.execProgram = function(id) {

            booklist.bookInfo = angular.copy(ContentService.get(id));

            //alert('This is a execProgram');


            $scope.activeXtest(booklist.bookInfo); // 해당 폴더로 스캔 업션창을 연다.

            const execFile = require('child_process').execFile;
            const path = "C:\\Program Files\\Canon Electronics\\CapturePerfect 3.0\\Cappe3.exe"; // 실행 프로그램 경로.
	        //const path = "C:\\Program Files (x86)\\Canon Electronics\\CapturePerfect 3.0\\Cappe3.exe";
            execFile(path, function (error, stdout, stderr) {
                console.log(stdout);
                console.log(error);
            });
        }


        // 복원이 있을경우 복원정보 작성 페이지로 이동.
        $scope.restoreRegister = function() {

            ContentService.getUrlNext();
        }


        $scope.getObjid = function() {

            var path = CommonService.getServerUrl() + '/userForId/' + os.hostname().substring(0,5);

            console.log('path: ' + path);
                
            $http.get(path)
                .success(function(data, status, headers, config) {
                    if( data ) {
                        /* 성공적으로 결과 데이터가 넘어 왔을 때 처리 */

                        $scope.currentObjid = data._id;

                        console.log('$scope.currentObjid: ' + $scope.currentObjid);

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


        };



        $scope.setRestoreDir = function (content) {

            if (content.length == 0) {

                alert('책제목을 입력해 주세요.');
                angular.element('#cTitle').focus();
                return;

            };


            var restoreConfirm = confirm("입력을 완료하시겠습니까? 완료후 수정이 불가능합니다.");

            if (restoreConfirm === true) {

                var limit = document.forms[0].elements.length;

                booklist.addCompleteFlag = true;


                // 스캔 등록된 책 권수를 받오온다
                $scope.scanBookCount = MainService.setDirectory(content);


                if ($scope.scanBookCount) {


                    $scope.restoreRegister();
                };


                booklist.newContent = {};

                $scope.getObjid();





                // 입력 완료 버튼 클릭시 폼요소 disabled 활성화.
                for (var i = 0;i < limit; i++) {

                    document.forms[0].elements[i].disabled = true;

                }

                // TEST //////////////////////////////////////////////////


                //alert('$scope.currentObjid=====>: ' + $scope.currentObjid);


                
                startTimeout = $timeout(function () {

                    //alert('interval start!!!!!!!!!!!!!!!');

                    startTimeInterval = $interval(function() {

                        $scope.addScanCostPer5minutes();

                        //alert('30초 경과!!!');

                    }, 1000*60*5);


                }, 1000*60*30);


            } else {

                return;
            }


            $scope.startTime = MainService.getCurrentTime(); // 스캔 시작 시작 체크

            $scope.scanTimeCost = $scope.defaultCost;


            $scope.closeFlage = true;

        };

        // 30분 이후에 5분마다 1000원씩 추가
        $scope.addScanCostPer5minutes = function() {

            $scope.scanTimeCost += 1000;

            console.log('1000원 추가 됨');

            console.log('$scope.scanTimeCost: ' + $scope.scanTimeCost);
        }


        // 수정버튼 클릭시 해당 Row 색 변경
        $scope.toggleClass = function (id) {

            booklist.completeIdArray[id] = booklist.completeIdArray[id] == 'selectedColor'?'':'selectedColor';
            booklist.disabledFlag[id] = booklist.disabledFlag[id] == true? '': true;
        };

        

        $scope.submitDir = function(id) {

            booklist.contents = angular.copy(ContentService.get(id));

            //booklist.completeIdArray.push(booklist.contents.id); // class 적용하기위한 ID Array

            
           

            //$scope.selectedId = booklist.contents.id;

            if (MainService.renameDir(booklist.contents)) {

                this.toggleClass(id);

            } else {
                return;
            }


            booklist.completeWorkFlag = true;

            //alert(booklist.completeWorkFlage);
        }


        $scope.openDir = function (id) {

            //test

            
            booklist.currentDir = angular.copy(ContentService.get(id));

            var curTitle = booklist.currentDir.title;

            var path = curTitle;

            //alert(path);

            if (booklist.currentDir.isRetina && booklist.currentDir.isOcr) {

                path = path + '_k1_ocr';
            } else if (booklist.currentDir.isRetina) {
                path = path + '_k1';
            } else if (booklist.currentDir.isOcr) {
                path = path + '_ocr';
            }

            var currentUserDir = MainService.getUserDirName() + '\\';

            //alert('currentUserDir: ' + currentUserDir);

            var workDrive = currentUserDir + path;

            //alert('workDrive: ' + workDrive);
           
            gui.Shell.openItem(workDrive);


        }

         $scope.getHotkey = function() {
                        // Load native UI library.
            var gui = require('nw.gui');

            var shortcut = new gui.Shortcut({

                key: "Ctrl+Shift+A",
                active: function() {
                    gui.window.get().show();
                    console.log('You pressed ' + this.key);
                }
            });

            gui.App.registerGlobalHotKey(shortcut);

            

         };

         var win = require('nw.gui').Window.get();


         $scope.completeAllWorks = function() {

            $scope.cancelToggle = false;

            console.log('$scope.totalOptCost: ' + $scope.totalOptCost + '\n $scope.scanTimeCost: ' + $scope.scanTimeCost + '\n 재단비: ' + $scope.cuttingCost * $scope.scanBookCount);

            //alert('$scope.currentObjid : ' + $scope.currentObjid);


            $scope.endTime = moment().format(); // 스캔 완료 시간 체크


            $scope.scanDuTime = MainService.scanDurationTime($scope.startTime, $scope.endTime); // 스캔 이용 시간(ex, 1시간 25분)


            console.log('$scope.scanDuTime: ' + $scope.scanDuTime);



            ContentService.killNode(); // 스캔작업이 모두 끝났을때 복원서버를 닫는다.

            

            //$scope.elapsedTime = $scope.endTime - $scope.startTime; // 밀리초로 리턴.

            //$scope.timeCost = CommonService.timeToCost($scope.startTime, $scope.endTime);

            //alert('complete_$scope.timeCost: ' + $scope.timeCost);


            // 복원 여부 확인해서 복원인경우 복원 구하기
            if (angular.isUndefined($scope.restoreObj)) {

                //alert('restore is not exist');

            } else {

                
            }

            console.log('comp_scanTimeCost: ' + $scope.scanTimeCost);
            console.log('comp_scanDuTime: ' + $scope.scanDuTime);

            console.log('big error id: ' + $scope.currentObjid);

            // DB 저장 (사용자정보, 도서정보)

            /* AJAX 통신 처리 */
            $http({
                method: 'PUT', //방식
                url: CommonService.getServerUrl() + '/userForUpdate/' + $scope.currentObjid, /* 통신할 URL */
                //url: 'http://192.168.0.24:47751/userForUpdate/' + $scope.currentObjid, /* 통신할 URL */
                data: {
                    scanEndTime: moment().format(),
                    totalCost: ($scope.scanTimeCost + ContentService.getTotalCost() + ($scope.scanBookCount * $scope.cuttingCost)), // 스캔시간비용 + 전체옵션비용 + 재단비
                    scanDurationTime: $scope.scanDuTime,
                    scanTimeCost: $scope.scanTimeCost

                }, /* 파라메터로 보낼 데이터 */
                headers: {'Content-Type': 'application/json; charset=utf-8'} //헤더
            })
            .then(function(response) {

                var data = response.data;
                
            })
            .catch(function(response) {

                console.log(response);

            })
         };

         $scope.finalCheck = function() {

            $scope.completeAllWorks();

            var restoreConfirm = confirm("모든 스캔작업을 완료하시겠습니까? \n 확인을 누르시면 잠시후 프로그램이 종료됩니다.");

            if (restoreConfirm === true) {

                $interval.cancel(startTimeInterval);
                $timeout.cancel(startTimeout);

                $scope.cancelToggle = true;

                win.close(true);

            } else {

                $scope.cancelToggle = false;

                return;

            } 

            return $scope.cancelToggle;
            
         };

        // X(close) 버튼을 클릭했을때 감지하기


        

/*        win.on("close", function(){

            if (!$scope.closeFlage) {

                    var restoreConfirm = confirm("종료하시면 모든 정보가 사라집니다 \n종료 하시겠습니까?");

                    if (restoreConfirm) {

                        win.close(true);
                    } else {

                        return;
                    }
            } else {

                $scope.finalCheck();
            }

        }) // end window close*/


          // Listen to main window's close event
          win.on('close', function() {

                $scope.finalCheck();

          });


    }) // end controller

    // DIRECTIVE