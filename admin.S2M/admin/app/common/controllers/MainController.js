var app = angular.module('Admin.Common')

app.controller('MainCtrl', function($scope, $http, $window, $interval, $timeout) {


    $scope.currentPage = 0;
    $scope.pageSize = 10;
    var dataLoadInterval;
    var getDB;


    var ip = require('ip');
    var os = require('os');

    var localIp = ip.address(); // 서버, DB 와 동일 PC 일때 local ip 를 얻어옴

    var nameOfServer = os.hostname().substring(0, 5);
    var workingDrive = global.__dirname.substring(0,2) // ex, C:, D:, G:, .. 

    alert('현재 서버 아이피는 ' + localIp + ' 입니다');


    (function() {

        var cmd = require('node-cmd');
        var task = require('ms-task');

         task.pidOf('mongod.exe', function (err, processes) {

            if (err) {

                //alert('processes: ' + processes[0]);

                return;

            }
            if (processes[0] == undefined) {

                //alert('processes is not exists');

                cmd.get('C: & cd C:\\mongodb\\bin & mongod --dbpath C:\\data\\db --journal', function(data){
                    console.log('dbdata : ' + data);

                    alert('db');
                }
                ); // DB


                cmd.get(workingDrive + ' & cd ' + workingDrive + '\\selfscanguider & node server', function(data){
                    console.log('data : ' + data);

                    alert('server');
                    }
                ); // server

            } //END IF


         });

        console.log('This is a Main init');

    })();

/*    if (nameOfServer == 'VAIOD' || nameOfServer == 'DESKT') {

        $scope.init();
        
    } else {

        return;
    }*/

    $scope.runDBServer = function() {

        var url = 'http://' + localIp + ':47751/optionprice'

         $http.get(url)
            .then(function(response) {

                var data = response.data;

                if (data) {

                    if (data.length === 0) {

                        console.log('First data');

                        $scope.addOptionData(); // DB에 option 데이터가 없을때
                    }

                    //alert('옵션 데이터를 성공적으로 가져왔습니다');

                    //console.log('optionData: ' + angular.toJson(data));
                }

            })
            .catch(function(response) {
                /* 서버와의 연결이 정상적이지 않을 때 처리 */
                console.log(response);
                alert('error area');
            });

    }; // END runDBServer


    

    $scope.killOfPids = function(serviceName) {

        var task = require('ms-task');
        var cmd = require('node-cmd');

        task.pidOf(serviceName, function(err, processes) {

            for (var i = 0; i < processes.length; i++) {

                //console.log('processes: ' + processes[0]);

                cmd.get('taskkill /F /PID '+ processes[i], function(data){
                    console.log('killdata : ' + data);

                    console.log('processes[' + i + '] : ' + processes[i]);

                    }
                );

            }; //end for

        });

    };

    $scope.addOptionData = function() {

        var defaultScancost = 6000;
        var cuttingcost = 1000;
        var retina = 500;
        var ocr = 500;
        var deliveryCost = 4500;
        var restore = [
            {
                itemNo: 0,
                item: "무선(본드)",
                price: 3000
            },
            {
                itemNo: 1,
                item: "레자크",
                price: 3000
            },
            {
                itemNo: 2,
                item: "스프링",
                price: 3000
            },
            {
                itemNo: 3,
                item: "양장(하드커버)",
                price: 5000
            }
        ];
        var officeInfom = "";

        $http({
            method: 'POST', //방식
            //url: 'http://192.168.0.34:47751/user', /* 통신할 URL */
            url: 'http://' + localIp + ':47751/optionprice', /* 통신할 URL */
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
            .success(function(data, status, headers, config) {
                if( data ) {
                    /* 성공적으로 결과 데이터가 넘어 왔을 때 처리 */
                    console.log('Data is added successfully');
                }
                else {
                    /* 통신한 URL에서 데이터가 넘어오지 않았을 때 처리 */
                }
            })
            .error(function(data, status, headers, config) {
                /* 서버와의 연결이 정상적이지 않을 때 처리 */
                console.log(status);
            });
    } // END addOptionData

    $scope.stopDBServer = function() {

        var moment = require('moment');
        var cmd = require('node-cmd');


        // mongo 
        // use admin
        // db.shutdownServer()
        // 한줄로 명령어 입력 MongoDB를 safty 하게 종료하기

        cmd.get('C: & cd C:\\mongodb\\bin & mongo 127.0.0.1/admin --eval "db.shutdownServer()"', function(data){
            console.log('stopdata : ' + data);

            $scope.killOfPids('node.exe'); // servicename 으로 process 닫기

            }
        );


        //$interval.cancel(dataLoadInterval); // interval 정지
        $timeout.cancel(getDB); // timeout 정지
    }

    
    getDB =function () {

        $scope.runDBServer();
        //$scope.reGetData();

        //alert('This is a area timeout');

    };
    

    $timeout(getDB, 1000);

    //dataLoadInterval = $interval($scope.reGetData, 60000);


    
    


    // X(close) 버튼을 클릭했을때 감지하기
    var win = require('nw.gui').Window.get();

    win.on("close",function(){

        $scope.stopDBServer();

        alert("서버를 닫습니다.");

        win.close(true);
    })



})
