// set up ========================
var http = require('http');
var express  = require('express');
var app      = express();                               // create our app w/ express
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan   = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var port = process.env.PORT || 47751;
var fs = require('fs');
var os = require('os');
var path= require('path');
var ip = require('ip');
var child_process = require('child_process');
var child;
var cors = require('cors');


app.use(cors());
//var Schema = mongoose.Schema

/**********************************/
/* 1.mongoose connection ***********/
/* 2.Define schema *****************/
/* 3.Define model *****************/
/* collection name is modelname add -s and all is lowercase.*/
/************************************************************/
// configure our app to handle CORS requests


//Send the proper header information along with the request

var localIP = ip.address();
console.log('ip: ' + ip.address());

var dbURI = 'mongodb://' + localIP + ':27017/ScanDB';
mongoose.connect(dbURI);
//mongoose.connect('mongodb://localhost:27017/Restore');

/*****************************************************************/
/************************** SCHEMA *******************************/
/*****************************************************************/

// USER //

var userSchema = mongoose.Schema({
    username: String,
    useremail: String,
    scanpc: String,
    createdOn: String,
    scanEndTime: String,
    cuttingCost: Number,
    scanDurationTime: String,
    scanTimeCost: Number,
    totalCost: Number,
    totalRestoreCost: Number,
    bookItems: Array
});

var user = mongoose.model('User', userSchema);



// RESTORE INFO //

var restoreinfoSchema = mongoose.Schema({
    restoreName: String,
    restorePhone: String,
    restoreType: String,
    restoreAddress: String,
    restorePcname: String,
    restoreId: String,
});

var restore = mongoose.model('Restore', restoreinfoSchema);

// OPTION PRICE //

var optionpriceSchema = mongoose.Schema({
    defaultScancost: Number,
    cuttingcost: Number,
    retina: Number,
    ocr: Number,
    deliveryCost: Number,
    restore: [
        {
            itemNo: Number,
            item: String,
            price: Number
        }
    ],
    officeInfom: String
})

var optionprice = mongoose.model('Optionprice', optionpriceSchema);


// configuration =================

app.use(express.static(__dirname));       // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());
//app.use(express.json());

/*app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Max-Age", "3600");
    res.setHeader("Access-Control-Allow-Headers", "Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers,Authorization");
    //res.setHeader('Access-Control-Request-Headers', 'access-control-allow-origin, origin, x-requested-with');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }

});*/

/*var allowCrossDomain = function(req, res, next) {
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);*/


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Client-Offset");
    //res.setHeader('Access-Control-Request-Headers', 'access-control-allow-origin, origin, x-requested-with');



    next();
});

app.use('/printinfo', function (req, res, next) {
    console.log('url: printinfo');

    next();

});




app.get('/printinfo', function (req, res, err){

    book.find().exec(function (err, book) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }
        //console.log('book', book);
        res.send(book);

    })

})


// ==============================================================================
// ROUTES FOR OUR API
// ==============================================================================

// basic route for the home page


app.get('/', function (req, res) {

    res.sendFile(path.join(__dirname + '/public/index.html'));
    console.log('os : ' + os.hostname());
    console.log('clientIP: ', req.ip);

    
//    child_process.execFile('C://Program Files (x86)//Adobe//Acrobat 9.0//Acrobat//Acrobat.exe', function(error, stdout, stderr){
//        console.log(stdout);
//    });


    /* ***************************************
    /* 현재 작업 폴더 띄우기 start
    /* ****************************************

    child = {
        encoding:'utf-8',
        cwd: null
    };


    child_process.execFile('explorer', child , function(error, stdout, stderr){
        console.log(stdout);
    });

    /* *************************************************************************/
    /* ********* 작업폴더 띄우기 end *******************************************/
    /* ************************************************************************/

});


///////////////////////// USER /////////////////////////////////

app.post('/user', function(req, res, err) {

    var userinfo = new user({
        username: req.body.username, 
        useremail: req.body.useremail,
        scanpc: req.body.scanpc,
        createdOn: req.body.createdOn,
        scanEndTime: req.body.scanEndTime,
        cuttingCost: req.body.cuttingCost,
        scanDurationTime: req.body.scanDurationTime,
        scanTimeCost: req.body.scanTimeCost,
        totalCost: req.body.totalCost,
        totalRestoreCost: req.body.totalRestoreCost,
        bookItems:req.body.bookItems
    });

    userinfo.save(function(err) {
        if(err) {
            console.log(err);
            throw err;
        }
        res.send('success');
    })
});

app.get('/user', function (req, res) {

    user.find().sort({ createdOn: -1 }).exec(function (err, user) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }
        //console.log('book', book);
        //console.log(user);
        res.send(user);

    })
});

app.get('/userForId/:scanpc', function (req, res) {

    var pcname = req.params.scanpc;

    user.findOne({ "scanpc": pcname }, { "_id": true, "scanpc": true }).sort( { "createdOn": -1 } ).exec(function (err, user) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }
        //console.log('book', book);
        //console.log(user);
        res.send(user);

    })
});


app.get('/userSearchId/:id', function (req, res) {

    var id = req.params.id;

    user.findOne({ "_id": id }).exec(function (err, user) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }
        //console.log('book', book);
        //console.log(optionprice);
        res.send(user);
 
    })
});


app.put('/userForUpdate/:id', function (req, res) {

    var scanEndTime = req.body.scanEndTime;
    var totalCost = req.body.totalCost;
    var scanDurationTime = req.body.scanDurationTime;
    var scanTimeCost = req.body.scanTimeCost;

    user.update({_id: req.params.id}, {"scanEndTime": scanEndTime, "totalCost": totalCost, "scanDurationTime": scanDurationTime, "scanTimeCost": scanTimeCost}, function (err, user) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }  
        //console.log('book', book);
        console.log(user);
        res.send(user);

    }); 
});

////////////////////////////////////////////////////////////

/////////////////////// OPTIONPRICE ////////////////////////

app.post('/optionprice', function(req, res, err) {

    var option = new optionprice({
        defaultScancost: req.body.defaultScancost,
        cuttingcost: req.body.cuttingcost,
        retina: req.body.retina,
        ocr: req.body.ocr,
        deliveryCost: req.body.deliveryCost,
        restore: req.body.restore,
        officeInfom: req.body.officeInfom
    });

    option.save(function(err) {
        if(err) {
            console.log(err);
            throw err;
        }
        res.send('success');
    })
});


app.get('/optionprice', function (req, res) {

    optionprice.find().exec(function (err, optionprice) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }
        //console.log('book', book);
        //console.log(optionprice);
        res.send(optionprice);

    })
});

app.put('/updateOption', function (req, res) {

        var defaultScancost = req.body.defaultScancost;
        var cuttingcost = req.body.cuttingcost;
        var retina = req.body.retina;
        var ocr = req.body.ocr;
        var deliveryCost = req.body.deliveryCost;
        var restore = req.body.restore;
        var officeInfom = req.body.officeInfom;

    optionprice.update({}, { "defaultScancost": defaultScancost, "cuttingcost": cuttingcost, "retina": retina, "ocr": ocr, "deliveryCost": deliveryCost, "restore": restore, "officeInfom": officeInfom }, function (err, optionprice) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }  
        //console.log('book', book);
        console.log(optionprice);
        res.send(optionprice);

    }); 
});

//////////////////////////////////////////////////////////


//////////////////////// RESTORE /////////////////////////

app.post('/restore', function(req, res, err) {

    var restoreInfo = new restore({
        restoreName: req.body.restorename,
        restorePhone: req.body.restorephone,
        restoreAddress: req.body.restoreaddress,
        restoreType: req.body.restoretype,
        restorePcname: req.body.restorepcname,
        restoreId: req.body.restoreid
    });

    restoreInfo.save(function(err) {
        if(err) {
            console.log(err);
            throw err;
        }
        res.send('success');
    })
});


app.get('/restore', function(req, res) {

    restore.find().exec(function (err, restore) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }
        //console.log('book', book);
        //console.log(optionprice);
        res.send(restore);
 
    })
}) 


app.get('/restoreSearchId/:id', function (req, res) {

    var id = req.params.id;

    restore.find({ "restoreId": id }).exec(function (err, restore) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }
        //console.log('book', book);
        //console.log(optionprice);
        res.send(restore);
 
    })
});

app.put('/restoreForUpdate/:scanpc', function (req, res) {

    var restoreId = req.body.restoreId;

    user.update({ restorePcname: req.params.scanpc }, {"restoreId": restoreId}, function (err, user) {
        if(err) {
            console.log('err: ' , err);
            throw err;
        }  
        //console.log('book', book);
        console.log(user);
        res.send(user);

    }); 
});

//////////////////////////////////////////////////////////////////////

app.get('/scanpcname', function (req, res) {

        var scanpcName = os.hostname().substring(0, 5);
        console.log('scanpcName: ' + scanpcName);
        res.send(scanpcName);

});


app.get('')

 
/************** mongodb에서 파일을 읽어와서 *************/
/************** lists.json파일에 저장한다   ************/

//app.get('/listview', function(req, res) {
//    restore.find({}, function(err, data) {
//        if (!err) {
//            console.log('data1111: ', data);
//
//            fs.writeFile('./public/app/views/lists.json',JSON.stringify(data));
//
//            res.send('list views complete');
//        } else {
//            console.log('This is an error');
//        }
//    });
//})


app.post('/save', function (req, res) {


            console.log('typeof req.body.bookinfos :' + typeof(req.body.bookinfos));



            var booklists = new book({
                    username:req.body.username,
                    useremail:req.body.useremail,
                    bookinfos:req.body.bookinfos  // 데이터가 Array로 안들어온다. 해결책은??

            });

            booklists.save(function (err, data) {
                if (err) {
                    console.err(err);
                    throw err;
                }

                console.log('bookinfo :' + req.body.bookinfos);
                //console.log('bookinfosindex_0: ' + req.body.bookinfos[3]);
                //var infos = JSON.parse(req.body.bookinfos);


                //var infos = booklists.findOne();


                //console.log('bookinfosindex_0: ', infos[1]);
                res.send(JSON.stringify(data));

            });


            
            //db에 순차적으로 insert 한다.

            //res.json(req.body[i].btitle); // 배열속에 객체데이터가 존재한다 [{...}, {...},......]
            //res.send('save is done!!');




    //res.json(req.body);

    fs.mkdir('c:\\' + req.body.username + '_' + req.body.useremail, function(e){
        if(!e || (e && e.code === 'EEXIST')){
            return;
        } else {
            //debug
            console.log(e);
        }
    });
});


/* *************************************/
/* *********Restore 관련 post ***********/
/* *************************************/



app.post('/restoreSave', function (req, res) {


    console.log('typeof req.body.userName :' + typeof(req.body.userName));


    var restoreInfo = new restore({
        userName: req.body.userName,
        userPhone: req.body.userPhone,
        restoreStartDay: req.body.restoreStartDay,
        restoreBookCount: req.body.restoreBookCount,
        hardcover: req.body.hardcover,
        restoretype: req.body.restoretype,
        deliveryAddress: req.body.deliveryAddress,
        deliveryReq: req.body.deliveryReq
    });

    restoreInfo.save(function (err, data) {
        if (err) {
            console.err(err);
            throw err;
        } else {
            pulldata();
        }
        //console.log('username :' + req.body.userName);

        //var dataUserName = "";


        //console.log('fullLists: ', fullLists)

        //res.send(data);
    });




});


//db에 순차적으로 insert 한다.

            //res.json(req.body[i].btitle); // 배열속에 객체데이터가 존재한다 [{...}, {...},......]
            //res.send('save is done!!');




    //res.json(req.body);

//    fs.mkdir('c:\\' + req.body.username + '_' + req.body.useremail, function(e){
//        if(!e || (e && e.code === 'EEXIST')){
//            return;
//        } else {
//            //debug
//            console.log(e);
//        }
//    });


//app.get('/restore', function (req, res, err) {
//    var restore = new Restore();
//    restore.find();
//        console.log(restore);
//        res.send(200, restore);
//})


var pulldata = function() {
    restore.find({}, function(err, data) {

        var filePath = './public/app/views/lists.json'

        fs.writeFile(filePath, JSON.stringify(data));

        //console.log('func_data: ', data);
    })
};






/***********
// get an instance of the express router
var apiRouter = express.Router();

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.post('/save', function (req, res) {
    db.save();
    console.log(req.body);
    console.log('apiRouter...')

});

// more routes for our API will happen here

// REGISTER OUR ROUTES ----------------------------------------------------------
// all of our routes will be prefixed with /api
app.use('/', apiRouter);

 ****************/

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("Magic happens on port " + port);
console.log('__dirname: ' + __dirname);