angular.module('S2M.Booklist', [])

	.service('ContentService', function () {

		var uid = 1;
		var totalOptionCost = 0;

        var totalRestoreCost = 0;

		var contents = [];

        var gui = require('nw.gui');
        var win;
        var hasRestoreFlag = false;

        var currentFilePath = global.__dirname;

        var cmd = require('node-cmd');


	//save method create a new contents if not already exists
    //else update the existing object
    this.save = function (content) {
        if (content.id == null) {
            //if this is new contents, add it in contacts array
            content.id = uid++;
            contents.push(content);
            
        } else {
            //for existing contents, find this contents using id
            //and update it.
            for (i in contents) {
                if (contents[i].id == content.id) {
                    contents[i] = content;
                }
            }
        }

        //console.log('content.retina: ' + content.retina);  // true, false

 
    };

    //simply search contents list for given id
    //and returns the contents object if found
    this.get = function (id) {
        for (i in contents) {
            if (contents[i].id == id) {
                return contents[i];
            }
        }
 
    };


    //iterate through contents list and delete 
    //contact if found
    this.delete = function (id) {
        for (i in contents) {
            if (contents[i].id == id) {
                contents.splice(i, 1);
            }
        }
    };
 
    //simply returns the contents list
    this.list = function () {
        return contents;
    };

    this.getTotalCost = function() {

        totalOptionCost = 0;

        for (var i = 0; i < contents.length; i++) {
            totalOptionCost += contents[i].sumOptionPrice;
        }

        //alert('totalOptionCost:', totalOptionCost);

        return totalOptionCost;
    }

    this.getTotalRestoreCost = function() {

        totalRestoreCost = 0;


        for (var i = 0; i < contents.length; i++) {

            if (angular.isUndefined(contents[i].restore) || contents[i].restore == null) {

            } else {
                
                //alert('totalRestoreCost==', totalOptionCost);
                totalRestoreCost += contents[i].restore.price;
            }
        }

        return totalRestoreCost;
    };

    this.getUrlNext = function() {

        var url = '/booklist';
        

        for (var i = 0; i < contents.length; i++) {

            if (contents[i].checkRestore) {

              hasRestoreFlag = true;  
            }
        }

        if (hasRestoreFlag) {
            
            // ex, C:\\Program Files (x86)\\Adobe\\Acrobat 9.0\\Acrobat  
            // acrobat 실행.
            // & 는 여러 명령어를 순서대로 실행할때 쓰임.

            var workingDrive = global.__dirname.substring(0,2);

            console.log('workingDrive: ' + workingDrive);

            // 현재 디스크를 workingDrive 에 넣고 변수를 대입.
            // 작업장이 있는 디스크 내에 nwjs를 설치해야 한다.
            
            var cmdString = 'cd ' + currentFilePath + '\\postzipcode & node server';

     
            cmd.get(cmdString, function(data){
                    //console.log('data : ' + data);
                }
            );
            
            this.createZip();
        }
        
        return url;
    };

    this.createZip = function() {

        win = gui.Window.open ('http://localhost:8080', {
              position: 'center',
              frame: false,
              width: 800,
              height: 600
            });

    };

    this.killNode = function() {

        var process = require('process');
        var pid = '';

        var workingDrive = global.__dirname.substring(0,2);

        // 현재 디스크를 workingDrive 에 넣고 변수를 대입.
        // 작업장이 있는 디스크 내에 nwjs를 설치해야 한다.


        // 복원 주소 서버를 스캔작업이 모두 완료되면(스캔작업완료 버튼 클릭) 
        // 복원주소 서버의 PID를 구해와서 
        // 그 PID를 shutdown 시킨다.
        

        // 서버 PORT로 정보가져오기
        var findPids = workingDrive + ' & cd ' + currentFilePath + '\\postzipcode & netstat -o -n -a | findstr 0.0:8080';

        console.log('findPids: ' + findPids);

        // PORT를 대상으로 서버 다운 시킴
        var shutdownZipcodeServer = workingDrive + ' & cd ' + currentFilePath + '\\postzipcode & taskkill /F /PID ' + pid;

        console.log('shutdownZipcodeServer: ' + shutdownZipcodeServer);
 
        cmd.get(findPids, function(data){
                console.log('data : ' + data);
                pid = data.substring(71, data.length);
                console.log('pid: ' + pid);

                var shutdownZipcodeServer = workingDrive + ' & cd ' + currentFilePath + '\\postzipcode & taskkill /F /PID ' + pid;

                cmd.get(shutdownZipcodeServer, function(data){
                    console.log('서버를 종료합니다. \n 정보: ' + data);

                    }
                );

            }
        );

       
    }
 
});