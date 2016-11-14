var https = require('https');

var client_id = '_UFwa1CCM31j82z4xa3X';
var client_secret = 'ubVbdXaZjI';
var host = 'openapi.naver.com';
var port = 443;
var uri = '/v1/search/book.xml?target=book&start=1';

var options = {
    host: host,
    port: port,
    path: uri,
    method: 'GET',
    headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
};

var req = https.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + res.headers);
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
    });
});
req.end();