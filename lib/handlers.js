/***
*
* Request Handlers
*
*
*/


// Dependencies
var _data = require('./data');
var helpers = require('./helpers');


// For Routing
// Create a handler object
var handler = {};

// Define the ping handler
handler.ping = function(data, callback){
  callback(200);
};

// users
handler.users = function(data, callback){
  var acceptableMethods = ['get', 'post', 'put', 'delete'];
  if(acceptableMethods.indexOf(data.method) > -1) {
    handler._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handler._users = {};

// Users - Get
// Required data - phone
// Optional data- none
// @// TODO: Only let authenticated users access their own object. Don't let them access anyone elses.
handler._users.get = function(data, callback){
  // validate that the queryStringObject is actually a phone.
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 13 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user.
      _data.read('users', phone, function(err,data){
        if(!err && data){
          // Remove the hashedPassword from the user object before returning it to the request object.
          delete data.hashedPassword;
          callback(200, data);
        }else {
          callback(404);
        }
      });
  }else {
    callback(400, {'Error': 'Bad request, missing required field.'});
  }
};

// Users - Post
// Required data - firstName, lastName, phone, password, tosAgreement
// Optional data - none
handler._users.post = function(data,callback){
  // Check that all required fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 13 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement){
    // Make sure the user doesnt already exist
    _data.read('users',phone,function(err,data){
      if(err){
        // Hash the password
        var hashedPassword = helpers.hash(password);

        // Create the user object
        if(hashedPassword){
          var userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' : true
          };

          // Store the user
          _data.create('users',phone,userObject,function(err){
            if(!err){
              callback(200);
            } else {
              console.log(err);
              callback(500,{'Error' : 'Could not create the new user'});
            }
          });
        } else {
          callback(500,{'Error' : 'Could not hash the user\'s password.'});
        }

      } else {
        // User alread exists
        callback(400,{'Error' : 'A user with that phone number already exists'});
      }
    });

  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }

};

// Users - Put
// Required data - phone
// Optional data - firstName, lastName, password
/**
** @Note: Since we are reading and writing to a file and not a database, we don't need to parse in an Id along with the payload.
** rather we, ensure the phone number is required, then use it to find the data/file to be modified, and use the optional fields
** if any to modify those same fields in the file.
**/
handler._users.put = function(data, callback){
    // validate phone.
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 13 ? data.payload.phone.trim() : false;

    // validate optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if(phone){
      // Error if nothing is sent to update
      if(firstName || lastName || pasword){
        // if the phone is valid, we use it to find the requested file.
        _data.read('users', phone, function(err, userData){
          if(!err && userData){
            // Update the necessary fields
            if(firstName){
              userData.firstName = firstName;
            }
            if(lastName){
              userData.lastName = lastName;
            }
            if(password){
              userData.hashedPassword = helpers.hash(password);
            }
            // Store the new updates
            _data.update('users', phone, userData, function(err){
              if(!err){
                callback(201);
              }else {
                console.log(err);
                callback(500, {'Error': 'Problem updating record.'});
              }
            });

          }else {
            callback(404, {'Error': 'The specified user does not exist.'});
          }
        });
      }else {
        callback(400, {'Error':'Missing required field.'});
      }
    }else {
      callback(400, {'Error': 'Missing required field.'});
    }
};

// Users - Delete
// Required data - phone
// Optional data - none
// TODO: Only let authenticated users access their own object. Don't let them access anyone elses.
// @TODO: Cleanup (delete) any other files associated with this user.
handler._users.delete = function(data, callback){
  // Validate the phone number from the queryStringObject
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 13 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Find the file using the phone param
    _data.read('users', phone, function(err, fileData){
      if(!err && fileData){
          _data.delete('users', phone, function(err){
            if(!err){
              callback(200);
            }else {
              console.log(err);
              callback(500, {'Error': 'Problem deleting record.'});
            }
          });
      }else {
        callback(404)
      }
    });
  }else {
    callback(400, {'Error': 'Missing required field.'});
  }
};

// Define a default handler to handle not found routes
handler.notFound = function(data, callback){
  callback(404);
};


// Export the module
module.exports = handler;
