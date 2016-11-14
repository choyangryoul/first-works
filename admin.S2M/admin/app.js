var mainModule = angular.module('Admin', 
    [
        'ngRoute',
        'ngAnimate',
        'Admin.Common',
        'Admin.Scanlist',
        'Admin.Restorelist',
        'Admin.Sales',
        'Admin.Setting'
    ]);


mainModule.config(['$routeProvider', function($routeProvider){

    $routeProvider
/*        .when('/', {
            templateUrl: 'app/common/common.html'
        })*/
        .when('/', {
            templateUrl: 'app/scanlist/tmpl/scanlist.html',
            controller: 'ScanlistCtrl',
            controllerAs: 'scanlist'
        })
        .when('/sales', {
            templateUrl: 'app/sales/tmpl/sales.html',
            controller: 'SalesCtrl',
            controllerAs: 'sales'
        })
        .when('/restorelist', {
            templateUrl: 'app/restorelist/tmpl/restore.html',
            controller: 'RestorelistCtrl',
            controllerAs: 'restorelist'
        })
        .when('/setting', {
            templateUrl: 'app/setting/tmpl/setting.html',
            controller: 'SettingCtrl',
            controllerAs: 'setting'
        })
        
//$locationProvider.html5Mode(true);
}])

//We already have a limitTo filter built-in to angular,
//let's make a startFrom filter

mainModule.service('MainService', function($http, $timeout) {

    var Mdb = {};

    this.restoreExistFlag = false;

    
    this.getIP = function() {

        var ip = require('ip');

        var localIp = ip.address(); // 서버, DB 와 동일 PC 일때 local ip 를 얻어옴

        return localIp
    };


    /////////////////////////////////////////////////////////////////////////
    /////////////// PROMISE DB column (user, restore) data 가져오기 /////////////////////////////
    /////////////////////////////////////////////////////////////////////////

    this.getMongoData = function (uId, strPath) {

        var localIp = this.getIP();
        var gui = require('nw.gui');

        var uid = uId;
        var strpath = strPath;

        //alert('strPath: ' + strPath);

        $http.get('http://' + localIp + ':47751/userSearchId/' + uid)
        .then ( function (response) {

            Mdb.user = response.data;

            var id = Mdb.user._id;

            console.log ('promise 1');

            return id;
        }) 
        .then ( function (response) {

            //console.log('user id get : ' + response);

            console.log('promise 2');

            return $http.get('http://' + localIp + ':47751/restoreSearchId/' + response);

        })
        .then ( function (response) {

            Mdb.restore = response.data;

            //console.log('typeof Mdb.restoreData: ' + typeof(Mdb.restore.data));


            if ( Mdb.restore == undefined ) {

                console.log('빈 배열');

                this.restoreExistFlag = true;
                
            } else {
                console.log('정보 있음');

                this.restoreExistFlag = false;
            }


            console.log('this.restoreExistFlag: ' + this.restoreExistFlag);

            console.log('promise 3');

            console.log('promise Mdb userData restoredata: ' + angular.toJson(Mdb));

            return $http.get('http://' + localIp + ':47751/optionprice');
        })
        .then (function (response) {

            Mdb.option = response.data;

            console.log('Mdb : ' + angular.toJson(Mdb));


            if (strPath === 'user') {

                var pathToPage = 'userDetailView.html';
            } else {

                var pathToPage = 'restoreDetailView.html';
            }

                var win = gui.Window.open ('app/scanlist/tmpl/' + pathToPage, {
                    position: 'center',
                    width: 900,
                    height: 650,
                    focus: true
                    }, function(win) {
                        win.data = Mdb;
                });

        })
        .catch ( function (error) {

            console.log(error);
        })

        return Mdb;
        
    } // end getRestoreMongoData

})
mainModule.controller('AdminCtrl', function($scope) {
 

})