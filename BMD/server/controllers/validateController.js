var bluepages = require('bluepages');

module.exports.validate = function(req, res) {
  //return res.send({"validation": true});
  bluepages.checkIfUserExists(req.body.userid, function(err, result) {
    if(err) console.log(err);
    else {
      res.send({"validation": result});
    }
  })
}
