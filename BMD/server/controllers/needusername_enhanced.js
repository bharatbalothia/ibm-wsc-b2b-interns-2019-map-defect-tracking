var bluepages = require('bluepages');
var options = ['name'];

module.exports.getusername = function(userid, dp, callback) {

  if(!userid || userid=='') {
    return callback(true, '');
  }

  if(dp[userid]) {
    console.log('username fetched!')
    return callback(false, dp[userid])
  }
  bluepages.getUserInfo({email: userid}, options, function(err, result) {
    if(err) {
      console.log(err);
      console.log('Failed to fetch username');
      return callback(true, '');
    }
    else {
      dp[userid] = result.name;
      console.log('username fetched!')
      return callback(false, result.name);
    }
  });
}
