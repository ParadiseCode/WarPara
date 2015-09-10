// This is a simple node server to use id.net OAuth 2.0 authorization service
// Install dependencies to make this code work
// npm install request

var request = require('request');
var http = require('http');
var url = require('url');
var site = 'https://www.id.net';

http.createServer(function (req, response) {
  var queryData = url.parse(req.url, true).query;
  var pathname = url.parse(req.url).pathname;
  // You can customize this callback as you want
  if (pathname === '/auth/idnet/callback') {

    // check if there is a code
    if (queryData.code) {
      var exchange = {
        code: queryData.code,
        client_id: '53e34133031ee0c9dd000ee8', // replace by your APP_ID
        client_secret: '93f7214cb70398c2473e461d6dc21d2932e44edda5ae7657c8d6653a3e3e9a5b', // replace by your APP_SECRET
        grant_type: 'authorization_code'
      };
      // Exchange code for an access_token
      request.post(site + '/oauth/token', {form: exchange}, function(e,r, body){
        var obj = JSON.parse(body);
        console.log(obj);
        // You need to store this object in your database to reuse it and call API on behalf of the user
        var token = obj.access_token;
        options = {
          headers: {
            Authorization: 'Bearer ' + token
          }
        }
        // Request User information API with access_token
        request.get(site + '/api/v1/json/profile', options, function(e, r, body){
          var obj = JSON.parse(body);
          console.log(obj);
          response.end('Connected as ' + obj.nickname + ' / PID: ' + obj.pid);
        });

      });
    }
  }
}).listen(4000);
