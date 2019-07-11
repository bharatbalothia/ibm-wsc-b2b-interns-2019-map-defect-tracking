var nano = require('nano')('http://admin:admin123@localhost:5984'),
nonticketform = nano.db.use('nonticketform'),
ticketform = nano.db.use('ticketform'),
defectlogs = nano.db.use('defectlogs');
other = nano.db.use('other'),
url = require('url'),
needusername = require('./needusername'),
databasejson = require('./databasejson');

function getnow() {
  var date_info = new Date();
  var date = date_info.getDate().toString() + '-' + (date_info.getMonth()+1).toString() + '-' + date_info.getFullYear()
  return date
}

module.exports.userfeed = function(req, res, callback) {
  url_parts = url.parse(req.url, true);
  user = url_parts.query.feedId;

  nonticketform.list({include_docs:true}, function(err, result) {
    var arr1 = []
    for(var i=0; i<result.total_rows; i++){
      arr1.push(result.rows[i].doc);
    }
    ticketform.list({include_docs:true}, function(err, result) {
      var arr2 = []
      for(var i=0; i<result.total_rows; i++){
        arr2.push(result.rows[i].doc);
      }
      other.list({include_docs:true}, function(err, result) {
        var arr3 = []
        if(!result.total_rows)
        return callback(arr1, arr2, arr3, user);
        for(var i=0;i<result.total_rows;i++) {
            arr3.push(result.rows[i].doc);
            if(i==result.total_rows-1) {
              return callback(arr1, arr2, arr3, user);
            }
        }
      })
    });
  });
}


module.exports.adddefect = function(req,res){

defectlogs.insert(req.body, function(err,result){

if(err){
  console.log('Defect Could not be inserted');
}

});


}


module.exports.addnonticket = function(req, res) {
  req.body.submit_time = getnow();
  var object = {
    user: req.body.user,
    appreciated_user: req.body.appreciated_user,
    date: req.body.date,
    client: req.body.client,
    type: req.body.type,
    id: req.body._id
  }
  nonticketform.list({include_docs: true}, function(err, result) {
    databasejson.data(result, object, function(status) {
      if(!status) {
        needusername.getusername(req.body.user, function(status, username) {
          req.body.username = username;
          needusername.getusername(req.body.appreciated_user, function(status, username) {
            req.body.appreciated_username = username;
            nonticketform.insert(req.body, function(err, result) {
              console.log(err);
              if(err) {
                return res.status(400).send({
                  message: 'How dare you!'
                });
              }
              nonticketform.get(result.id, function(err, body) {
                return res.send(body);
                console.log(body);
              });
            });
          })
        })
      }
      else {
        return res.status(400).send({
          message: 'How dare you!'
        });
      }
    })
  })
}



module.exports.addticket = function(req, res) {
  
  req.body.submit_time = getnow();
  var object = {
    user: req.body.user,
    appreciated_user: req.body.appreciated_user,
    date: req.body.date,
    client: req.body.client,
    type: req.body.type,
    ticketno: req.body.ticketno,
    id: req.body._id
  }
  ticketform.list({include_docs: true}, function(err, result) {
    databasejson.data(result, object, function(status) {
      if(!status) {
        needusername.getusername(req.body.user, function(status, username) {
          req.body.username = username;
          needusername.getusername(req.body.appreciated_user, function(status, username) {
            req.body.appreciated_username = username;
            ticketform.insert(req.body, function(err, result) {
              console.log(result);
              if(err) {
                return res.status(400).send({
                  message: 'How dare you!'
                });
              }
              ticketform.get(result.id, function(err, body) {
                res.send(body);
              });
            });
          })
        })
      }
      else {
        return res.status(400).send({
          message: 'How dare you!'
        });
      }
    })
  })
}



module.exports.addother = function(req, res) {
  req.body.submit_time = getnow();
  var object = {
    user: req.body.user,
    appreciated_user: req.body.appreciated_user,
    date: req.body.date,
    client: req.body.client,
    type: req.body.type,
    id: req.body._id
  }
  other.list({include_docs: true}, function(err, result) {
    databasejson.data(result, object, function(status) {
      if(!status) {
        needusername.getusername(req.body.user, function(status, username) {
          req.body.username = username;
          needusername.getusername(req.body.appreciated_user, function(status, username) {
            req.body.appreciated_username = username;
            other.insert(req.body, function(err, result) {
              console.log(result);
              if(err) {
                console.log("failed to insert");
                return res.status(400).send({
                  message: 'failed to insert!'
                });
              }
              other.get(result.id, function(err, body) {
                return res.send(body);
              });
            });
          })
        })
      }
      else {
        return res.status(400).send({
          message: 'Quota over!'
        });
      }
    })
  })
}
