angular.module('S2M.Common', [])


	.service('CommonService', function () {

		var os = require('os');
		//var moment = require('moment');
		var scanStartTime = '';

		var scanEndTime = '';

		var defaultScanCost = 6000;

		var setTime = 0;

		var scanTimeCost = 0;



		this.timeToCost = function (tStart, tEnd) {

			var totalSeconds = parseInt((tEnd - tStart) / 1000); // 밀리초를 초 단위로 환산


			if (totalSeconds <= 1800) {

				scanTimeCost = defaultScanCost;

			} else if (totalSeconds > 1800) {

				scanTimeCost = defaultScanCost + (Math.floor((totalSeconds - 1800) / 300) * 1000);

			}

			console.log('CommonService.scanTimeCost: ' + scanTimeCost);
			

			return scanTimeCost;



		};

		this.getPCName = function() {

		    // 컴퓨터 이름에서 5개만 빼온다 (ex, scan1, scan2..)
		    var nameString = os.hostname();
		    nameString = nameString.substring(0, 5);

		   return nameString;
		}


		// 현 서버 url을 가져온다
    	this.getServerUrl = function() {

	        var db_url = 'http://192.168.0.34:47751';

	        return db_url;
    	};

	});

