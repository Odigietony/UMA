/**
* Primary file for the Api
*
***/

//Dependency
const http = require('http'); // to create and start our server in http
const https = require('https'); // to create and start our server in https
const url = require('url'); // to enable us get the parsed url
var StringDecoder =  require('string_decoder').StringDecoder; // to enable us decode the payload.
var config = require('./lib/config'); // setting our environment port
var fs = require('fs'); // to read files
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

// Instanstiate the HTTP server
// The server should respond to all requests with a string
let httpServer = http.createServer(function(req, res) {
unifiedServerFunction(req, res);
});



// Start the server HTTP server
httpServer.listen(config.httpPort, function(){
  console.log("Server started and listening on http port "+config.httpPort+" in "+config.environmentName+" mode");
});


// configure the httpsServerOptions
let httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

// Instanstiate/ create the HTTPS server
let httpsServer = https.createServer(httpsServerOptions, function(req, res){
  unifiedServerFunction(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){
  console.log("Server started and listening on https port " +config.httpsPort);
  console.log("Use Ctrl + C to close.")
});



// Alll the server logic for both the http and https server
var unifiedServerFunction = function(req, res){

  // Get the url from the request object and parse it to a variable
  let parseUrl = url.parse(req.url, true);

  // Get the path using the pathname key from the parseUrl object variable
  let path = parseUrl.pathname;
  // Trim the path (from http:localhost:2000/foo to just foo);
  let trimmedPath = path.replace(/^\/+|\/+$/g,'');

  // Get the method
  let method = req.method.toLowerCase();

  // Get the query from the string (for getting query)
  var queryStringObject = parseUrl.query;

  // Get the headers as an object
  var headers = req.headers;

  // Get the payload if there is any (we use the stringDecoder library)
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  //if the request recieves data, decode it and append it to our buffer string variable
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });

  // When the whole payload has been recieved, parse it to the variable and send a response.
  req.on('end', function(){
    buffer += decoder.end();

    // When the request ends we want to get all the data and route to a handler based on the requested path.
    // 1. get the requested path
    var choodsenPath = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handler.notFound;

    // 2. Construct the data we are going to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'headers': headers,
      'method': method,
      'payload': helpers.parseJsonToObject(buffer)
    };

    // 3. Route the request to the handler that will handle the request ie the one specified in the choodsenPath
    choodsenPath(data,function(statuscode, payload){
      // use the statuscode called by the handler, or default to 200
      // if the statuscode is a number then accept it, else return our default
      statuscode = typeof(statuscode) == 'number' ? statuscode : 200;

      // Use the paylaod returned by the handler
      payload = typeof(payload) == 'object' ? payload : {};

      // Convert the paylaod to a string using JSON.stringify
      var payloadString = JSON.stringify(payload);

      // Return the response
      // send a reponse
      res.setHeader('Content-Type', 'application/json'); //return the response as json.
      res.writeHead(statuscode);
      res.end(payloadString);

        // log the pathname
        console.log('Returning this reponse ', statuscode, payloadString);
    });
  });
};




// Define a router object
var router = {
  'ping': handlers.ping,
  'users': handlers.users
};
