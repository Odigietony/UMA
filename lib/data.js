
/*
* library for stroing and editing data
* 1. Create file.
*    a. open folder dir.
*    b. write to file in dir.
*    c. close the file.
*/


// Dependencies
var fs = require('fs');
var path = require('path');


// Container for the module to be exported
var lib = {};

// base directory
lib.baseDir = path.join(__dirname, '/../.data/');

// Write data to file
lib.create = function(dir,file,data,callback){
  // Open file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
    // a file descriptor is a way to uniquely identify a file (and to perform actions like writing to the file).
    if(!err && fileDescriptor){
      // Convert data to a string.
      var stringData = JSON.stringify(data);

      // write to file and close it.
      fs.writeFile(fileDescriptor, stringData, function(err){
        if(!err){
            // Close the file
            fs.close(fileDescriptor, function(err){
              if(!err){
                callback(false);
              }else{
                callback('Error closing file'+ err);
              };
            });
        }else{
          callback('Could not write to file.'+ err);
        }
      });
    }else{
      callback('Could not create new file, it may or may not already exist.');
    }
  });
};

// Read data in file
lib.read = function(dir, file, callback){
  fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', function(err, data){
    if(!err){
      callback(data);
    }else{
      callback('Could not read file due to', err);
    }
  });
};


// Update a file
lib.update = function(dir,file,data,callback){
  // Open the file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // convert to string
      var stringData = JSON.stringify(data);

      // Truncated to the file
      fs.truncate(fileDescriptor, function(err){
        if(!err){
          // Write to file
          fs.writeFile(fileDescriptor,stringData, function(err){
            if(!err){
              // Close the file
              fs.close(fileDescriptor,function(err){
                if(!err){
                  callback(false);
                }else {
                  callback('Error closing the file');
                }
              })
            }else {
              callback('Error writing to file');
            }
          })
        }else {
          callback('Error truncating file');
        }
      })
    }else {
      callback('Could not open the file, it may or may not already exist.');
    }
  })

};


// Deleting a file
lib.delete = function(dir,file,callback){
  // To delete a file, you use the unlink method.
  fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
    if(!err){
      callback(false);
    }else {
      callback('Error deleting the file');
    }
  });
};

// Export the module
module.exports = lib;
