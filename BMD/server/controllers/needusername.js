var bluepages = require('bluepages');
var options = ['name'];

module.exports.getusername = function(userid, callback) {

  if(!userid || userid=='') {
    return callback(true, '');
  }
  bluepages.getUserInfo({email: userid}, options, function(err, result) {
    if(err) {
      console.log(err);
      return callback(true, '');
    }
    else {
      return callback(false, result.name);
    }
  });
}
