/*
Rushed ugly code by <thomasalwyndavis@gmail.com>

Will clean up and make available

*/
var MailChimpAPI = require('mailchimp').MailChimpAPI;
var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;    
var apiKey = process.env.MAILCHIMP_API_KEY;

try { 
    var api = new MailChimpAPI(apiKey, { version : '2.0' });
} catch (error) {
    console.log(error.message);
}

var express = require('express');
var port = process.env.PORT || 8080;
var allowCrossDomain = function(req, res, next) {
  var allowedHost = [
    'http://dev.stopwatching.us',
    'http://rally.stopwatching.us',
    'http://2.stopwatching.us',
    'http://localhost:4000',
    'https://dev.stopwatching.us',
    'https://rally.stopwatching.us',
    'https://2.stopwatching.us',
    'https://localhost:4000',
    'https://thedaywefightback.org'
  ];
  if(allowedHost.indexOf(req.headers.origin) !== -1 ) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    next();
  } else {
    res.send({auth: false});
  }
}
MongoClient.connect(process.env.MONGOHQ_URL, function(err, db) {
  if(err) throw err;

  var collection = db.collection('emails');
  var server = express();
  server.use(express.bodyParser());
  server.use(allowCrossDomain);

  server.options("*", function(req,res,next){res.send({});});

  server.post('/subscribe', function(req,res,next){
      
      var email = req.body.email;
      var domain  = req.body.domain || 'thedaywefightback.org';

      var merge_vars = {
        EMAIL: email,
        DOMAIN: domain
      };

      collection.insert(merge_vars, function(err, docs) {console.log('Saved Email')});
      api.call('lists', 'subscribe', { 
          id: 'c05d6bd75f', 
          email: {email: email},
          merge_vars: merge_vars,
          send_welcome: true,
          double_optin: false,
          update_existing: true

      }, function (error, data) {
      });
      res.send(JSON.stringify(merge_vars)); // Do something with your data!

  });




  server.listen(port, function() {
    console.log('%s listening at %s', server.name, server.url);
  });

})
