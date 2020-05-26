/**
* Helpers for various Tasks
*/

// Dependencies
var crypto = require('crypto');
var config = require('./config');

// Module Container
var helpers = {};

// To hash the password we use the built in SHA256 (it comes with node by default).
// You can use any other third party hashing algorith.
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.trim().length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  }else {
    return false;
  }
};

// Parse a Json string to an object without throwing error
helpers.parseJsonToObject = function(str){
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};


// Eport the module
module.exports = helpers;
