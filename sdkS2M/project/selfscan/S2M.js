var mainModule = angular.module('S2M',
	[
		'ngRoute',
		'ngAnimate',
        'S2M.Common',
		'S2M.Booklist',
		'S2M.User',
		'S2M.Restore',
        'ui.bootstrap'
	]);

mainModule.config(['$routeProvider', function($routeProvider){

	$routeProvider
    	.when('/', {
            templateUrl: 'selfscan/user/tmpl/user.html',
            controller: 'UserCtrl',
            controllerAs: 'user'
    	})
    	.when('/booklist', {
            templateUrl: 'selfscan/booklist/tmpl/booklist.html',
            controller: 'BooklistCtrl',
            controllerAs: 'booklist'
    	})
    	.when('/restore', {
    		templateUrl: 'selfscan/restore/tmpl/restore.html',
    		controller: 'RestoreCtrl',
    		controllerAs: 'restore'
    	});
		
//$locationProvider.html5Mode(true);
}])

mainModule.service('MainService', function($http, $timeout, CommonService, ContentService) {

    var os = require('os');
    var userDirName = ''; // 사용자 이름/이메일 폴더 이름
    var path = require('path');
    var mkdirp = require('mkdirp');
    var fs = require('fs');
    var dirnameCounter = 0;
    var workingDrive = global.__dirname.substring(0,2); // ex, C:, D:, G:, .. 
    var curDrive = workingDrive + "\\HoominClient\\work"; // default path.

    var userInfo = []; // 사용자 이름, 이메일을 넣어둔다.

    var scanStartTime = '';
    var scanEndTime = '';

    var scanCost;

    var currentObjid = '';

    var getIdTimeout;

    var getId = '';

    var bookcount = 0;

    // 현재시간을 반환합니다.
    this.getCurrentTime = function() {

        //alert("moment().format() : " + moment().format());

        return  moment().format();
    };


    scanStartTime = this.getCurrentTime();

    // User Directory 생성 (ex. 사용자이름_이메일_20160508)
    this.setDirectory = function() {

        var changeUserDirPath = '';
      

        //alert('this.caller: ' + arguments.callee.caller.name);

        var callerName = arguments.callee.caller.name;

        if (callerName == 'setUserDir') {  // 이름,이메일 폴더 만들기
            

            for (var i = 0; i < arguments.length; i++) {

                // 사용자 이름, 이메일을 배열에 넣는다.
                userInfo.push(arguments[i]); 
            }

            console.log('arguments[0]: ' + arguments[0]);


            var curDate = new Date();

            var year = curDate.getFullYear();  // year type  : number.
            var month = curDate.getMonth() + 1;
            var day = curDate.getDate();


            if ((month + 1) < 10 || day) {
                month = ("00" + month).slice(-2); // 월단위를 2자리로 만든다.
                day = ("00" + day).slice(-2); // 일단위를 2자리로 만든다.
            } else {
                month = month;
                day = day;
            }

            var makeDirDate = String(year) + String(month) + String(day); // 폴더에 현재 년월일 표시.

            
            var userDirectory = userInfo[0] + '_' + userInfo[1] + '_' + String(makeDirDate);

            this.checkDirectory(curDrive, userDirectory); // check directory


            //alert('up-userInfo[0]:  ' + userInfo[0]);
            
        } else { // callerName = 'setRestoreDir' -- 책제목 폴더 만들기


            var contentArgs = angular.fromJson(arguments[0]);
            var filename = '';
            var DirTitlePath = '';
            var optionString = '';
            var page = '';

            //booktitleArray.push(angular.toJson(arguments[0]));

            for (var i = 0; i < contentArgs.length; i++) {

                console.log('booktitleArray[0].title---->' + contentArgs[i].title);

                var title = contentArgs[i].title;
                var retina = contentArgs[i].isRetina;
                var ocr = contentArgs[i].isOcr;
                page = contentArgs[i].page;
                bookCount = contentArgs.length;

                if (page == '') {

                    //alert('before_db_page: ' + page); 

                    page = '0';
                    
                } else {
                    
                    page = parseInt(page);
                }


                if (retina == true && ocr == true) {

                    optionString = '_k1_ocr';
                    
                } else if (retina) {

                    optionString = '_k1';

                } else if (ocr) {

                    optionString = '_ocr';
                    
                } else {

                    optionString = '';
                }

                bookTitleName = contentArgs[i].title + optionString; // string

                bookTitlePath = path.join(userDirName, bookTitleName);

                console.log('bookTitlePath:--->' + bookTitlePath);

                mkdirp(bookTitlePath, function(err) {
                if(err) throw err;

                // TODO:
                // 폴더가 존재하는지 검사.
                // 없으면 폴더생성, 있으면 return.
                
                })


                //alert('contentArgs[i].page: ' + contentArgs[i].length);
            } // end page

            // DB 저장 (사용자정보, 도서정보)


            //alert('scanStartTime: ' + scanStartTime);

            /* AJAX 통신 처리 */
            $http({
                method: 'POST', //방식
                url: CommonService.getServerUrl() + '/user', /* 통신할 URL */
                //url: 'http://192.168.0.34:47751/user', /* 통신할 URL */
                data: {
                    username: userInfo[0],
                    useremail: userInfo[1],
                    scanpc: os.hostname().substring(0,5),
                    createdOn: scanStartTime,
                    scanEndTime: '',
                    cuttingCost: bookCount * 1000,
                    scanDurationTime: '',
                    scanTimeCost: 0,
                    totalCost: 0,
                    totalRestoreCost: ContentService.getTotalRestoreCost(),
                    bookItems: contentArgs
                }, /* 파라메터로 보낼 데이터 */
                headers: {'Content-Type': 'application/json; charset=utf-8'} //헤더
            })
            .then(function(response) {

                return $http.get(CommonService.getServerUrl() + '/userForId/' + os.hostname().substring(0, 5));
            })
/*            .then(function(response) {

                console.log('Promise 1 user data ====================>' + angular.toJson(response.data));

                console.log('PROMISE 2222222222222222222222222222222222222222222');

                var uId = response.data._id;

                console.log('UID------------------>' + uId);

                $http({
                    method: 'PUT', //방식
                    url: 'http://192.168.0.24:47751/restoreForUpdate/' + os.hostname().substring(0, 5),
                    data: {
                        restoreId: uId
                    }
                })
            })*/
            .catch(function(response) {
                
                console.log(status);
            });

            
            return bookCount;

        }

    } // end setDirectory


    this.getDeleteChar = function(title) {

        var regExp = /[ \{\}\[\]\/?.,;:|*~`!^\-_+<>@\#$%&\\\=\'\"]/gi;

        if(regExp.test(title)){


            //특수문자 제거
            var title = title.replace(regExp, " ")

            console.log("특수문자를 제거했습니다. ==>" + title);

        }else{

            console.log("정상적인 문자입니다. ==>" + title);
            
        }

        return title;

    } // end getDeleteChar



    this.checkDirectory = function (drive, directory) {

        var changeDirName = path.join(drive, directory);

        var existNumber = 1;
        var originDirName = '';
        var dirNameArray = [];
        var dirChangeName = '';
        var multiDirPath = '';

        fs.stat(changeDirName, function(err, stats) {

            //Check if error defined and the error code is "not exists"
            if (err && err.code == 'ENOENT') {
                
                //Create the directory, call the callback.
                mkdirp(changeDirName, function(err) {
                if(err) throw err;
                
                });

                userDirName = changeDirName;
                

            } else if(!err && stats.isDirectory()) {  // directory 가 존재한다면.

                //alert('dir is exists');

                fs.readdir(drive, function(err, files) {

                    if (!err) {

                        for (var i = 0; i < files.length; i++) {

                            var filesEnd = directory.length;

                                if (files[i].substring(0, filesEnd) === directory) {

                                    dirNameArray.push(files[i]);

                                }
                            
                        }; // end for

                        existNumber = dirNameArray.length;

                        dirChangeName = String(directory + '(' + existNumber + ')');

                        multiDirPath = drive + '\\' + dirChangeName;


                        userDirName = multiDirPath;
                            
                        mkdirp(multiDirPath, function(err) {
                        if(err) throw err;

                        });

                    }; // end !err if

                }); // end readdir
            };

        });

    }; // checkDirectory


    this.getUserDirName = function() {

        return userDirName;
    }


    this.renameDir = function(content) {

        var path = require('path');
        var fs = require('fs');

        var bookContent = angular.fromJson(content);

        var title = bookContent.title;
        var retina  = bookContent.isRetina;
        var ocr = bookContent.isOcr;

        if (retina && ocr) {
            booktitle = title + '_k1_ocr';
        } else if (retina) {
            booktitle = title + '_k1';
        } else if (ocr) {
            booktitle = title + '_ocr';
        } else {
            booktitle = title;
        }


        sumbmitExt = '_ok';

        oldDirTitlePath = this.getUserDirName() + '\\' + booktitle;

        //alert('oldDirTitlePath: ' + oldDirTitlePath);

        var submitFile = confirm('선택하신 도서작업을 완료하시겠습니까? \n 완료하신후에는 수정이 불가능합니다.');

        if (submitFile) {

            fs.rename(oldDirTitlePath, (oldDirTitlePath + sumbmitExt) , function(err){
                if (err) throw err;

                fs.stat((oldDirTitlePath + sumbmitExt), function (err, stats) {
                    if (err) throw err;
                    console.log('stats: ' + JSON.stringify(stats));
                  });

                //alert('oldPath: ' + filename);
                //alert('newPath: ' + sumbmitFilename);

            });

            return true;
        } else {

            return false;
        }
    }


    // 컴퓨터 이름에서 5개만 빼온다 (ex, scan1, scan2..)
    this.getPCname = function() {
        
        var nameString = os.hostname()
        nameString = nameString.substring(0, 5);

        this.currentObjid = nameString;

        return this.currentObjid;
    };


    this.getCurrentTime = function() {

        var curDate = moment().format();

        return curDate;

    };


    this.clickevent = function() {

        var e = $.Event("keydown");
        e.which = 13;
        e.keyCode = 13;
        $(document).trigger(e); 
        console.log('e:' ,e);

    } // end this.clickevent

    this.runCmd = function() {
        var cmd = require('node-cmd');

        // C:\\Program Files (x86)\\Adobe\\Acrobat 9.0\\Acrobat  
        // acrobat 실행.
        // & 는 여러 명령어를 순서대로 실행할때 쓰임.
 
        cmd.get('c: & cd C:\\Program Files (x86)\\Adobe\\Acrobat 9.0\\Acrobat & acrobat', function(data){
                console.log('data : ' + data);
            }
        );


    } // end this.runCmd


    // 스캔 지속시간을 나타낸다. (ex, 2시간 35분)
    this.scanDurationTime = function(startTime, endTime) {

        var sTime = new Date(startTime).getTime();
        var eTime = new Date(endTime).getTime();

        var timeDiff = eTime - sTime;


        console.log('stime: ' + sTime + ' || eTime: ' + eTime);

        console.log('startTime: ' + startTime + '||| endTime: ' + endTime);
        
        var hh = Math.floor(timeDiff / 1000 / 60 / 60);
        timeDiff -= hh * 1000 * 60 * 60;
        var mm = Math.floor(timeDiff / 1000 / 60);
        timeDiff -= mm * 1000 * 60;
        var ss = Math.floor(timeDiff / 1000);
        timeDiff -= ss * 1000;

        scanTimeDiff = hh + '시간 ' + mm + '분 ' + ss + '초';

        //alert(scanTimeDiff);

        return scanTimeDiff;
    }


});

