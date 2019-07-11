var bluepages = require('bluepages');
var admin_group='BMD_ADMIN';
var user_group='RSC Map Change Team';
var options = ['name']

module.exports.login = function(req, res) {
  console.log("LET'S SEE");

  bluepages.authenticate(req.body.userid, req.body.pass ,function(err,verified){
    if(err) {
      console.log(err);
      res.send({success: false, message: "INVALID credentials!", group: null})
    }
    else {
      if(verified){
        var email = req.body.userid;
        bluepages.authenticateGroup(req.body.userid, admin_group, function(err,verified){
          if(err) {
            console.log(err);
            res.send({success: false, message: "ENTER CREDENTIALS", group: null})
          }
          else {
            if(verified) {
              console.log('The user is present in '+ admin_group +' group');
              bluepages.getUserInfo({email: email}, options, function(err, result) {
                if(err) {
                  console.log('Failed to fetch userinfo');
                  res.send({success: true, message: "Success ADMIN login!", group: 'admin', userinfo: {}})
                }
                else {
                  console.log('Userinfo fetched!')
                  console.log(result)
                  res.send({success: true, message: "Success ADMIN login!", group: 'admin', userinfo: result})
                }
              })
            }
            else {
              console.log('The user is NOT present in '+ 'admin' +' group');
              bluepages.authenticateGroup(req.body.userid, user_group ,function(err,verified){
                if(err) {
                  console.log(err);
                  res.send({success: false, message: "ENTER CREDENTIALS", group: null})
                }
                else {
                  if(verified) {
                    console.log('The user is present in '+ user_group +' group');
                    bluepages.getUserInfo({email: email}, options, function(err, result) {
                      var username_result = result;
                      if(err) {
                        console.log('Failed to fetch userinfo');
                        res.send({success: true, message: "Success user login!", group: 'user', userinfo: {}})
                      }
                      else {
                        console.log('Userinfo fetched!')
                        console.log(result)
                        delegates.get(req.body.userid, function(err, result) {
                          console.log(result);
                          if(err) {
                            console.log(err);
                            res.send({success: true, message: "Success USER login!", group: 'user', userinfo: username_result})
                          }
                          else {
                            if(result.assigned.length)
                            res.send({success: true, message: "Success LEAD login!", group: 'lead', userinfo: username_result})
                            else
                            res.send({success: true, message: "Success USER login!", group: 'user', userinfo: username_result})
                          }
                        })
                      }
                    })
                  }
                  else {
                    console.log('The user is NOT present in '+ user_group +' group');
                    res.send({success: true, message: "INVALID CREDENTIALS", group: null})
                  }
                 }
                });
              }
            }
          });
        }
        else {
          console.log("Invalid credentials!");
          res.send({success: false, message: "Invalid credentials!", group: null})
        }
      }
    });
  }
