var json2csv = require('json2csv');
var fs = require('fs');
var csvtojson = require('csvtojson');
var path = require('path');
var bluepages = require('bluepages');
var time = require('time');
var nano = require('nano')('http://admin:admin123@localhost:5984'),
ticketlist = nano.db.use('ticketlist');

function GetSortOrder(prop, k) {
  return function(a, b) {
    if (a[prop] > b[prop]) {
      return k;
    } else if (a[prop] < b[prop]) {
      return -k;
    }
    return 0;
  }
}



module.exports.list = function(req, res, conn) {
  conn.list({include_docs:true}, function(err, result) {
    var arr = [];
    for(var i=0; i<result.total_rows; i++) arr.push(result.rows[i].doc);
    res.send(arr);
  })
}

module.exports.add = function(req, res, conn_acc, conn_trans, user) {
  delete req.body.userid;
  var temp;
  req.body._id = req.body.PACCOUNT;
  conn_acc.insert(req.body, function(err, result) {
    conn_acc.get(result.id, function(err, body) {
      temp = body;
      var d = new time.Date();
      d.setTimezone('Asia/Kolkata');
      var date = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds() +", "+ d.getFullYear() + "-" + d.getMonth()+1 + "-" + d.getDate();
      //trans
      var doc = {
        ACTIONBY: user,
        ACTIONTIME: date,
        ACTION: "Inserted",
        DESCRIPTION: req.body.PACCOUNT + ", " + req.body.ACCOUNT
      }
      conn_trans.insert(doc, function(err, result) {
        console.log("Transaction added!");
        res.send(temp);
      });
    })

    ticketlist.list({include_docs:true}, function(err, result) {
      for(var i=0; i<result.total_rows; i++)
      {
        if(result.rows[i].doc.client == req.body.PACCOUNT){
          result.rows[i].doc.client = req.body.ACCOUNT;
          ticketlist.insert(result.rows[i].doc, function(err, result) {
            if(err) console.log(err);
            console.log("success");
          })
        }
      }
    });
  })
}

module.exports.delete = function(req, res, conn_acc, conn_trans, user) {
  delete req.body.userid;
  conn_acc.get(req.body.PACCOUNT, function(err, result) {
    conn_acc.destroy(req.body.PACCOUNT, req.body._rev, function(err, body) {
      console.log("Deleted");
    });
  });
  var d = new time.Date();
  d.setTimezone('Asia/Kolkata');
  var date = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds() +", "+ d.getFullYear() + "-" + d.getMonth()+1 + "-" + d.getDate();
  //trans
  var doc = {
    ACTIONBY: user,
    ACTIONTIME: date,
    ACTION: "Deleted",
    DESCRIPTION: req.body.PACCOUNT + ", " + req.body.ACCOUNT
  }
  conn_trans.insert(doc, function(err, result) {
    console.log("Transaction added!");
  });

  res.end();
}

module.exports.download = function(req, res, conn) {
  conn.list({include_docs: true}, function(err, result) {
    var arr = [];
    for(var i=0; i<result.total_rows; i++)
    {
      arr.push(result.rows[i].doc);
      if(i==result.total_rows-1) {
        var fields = ['PACCOUNT', 'ACCOUNT', 'REGION'];
        var csv = json2csv({data: arr, fields: fields});
        fs.writeFile(path.resolve(__dirname + '/../../client/file.csv'), csv, function(err) {
          if (err) throw err;
          console.log('file saved');
          if(res)
          res.end();
        });
      }
    }
  });
}

module.exports.import = function(req, res, conn_acc, conn_trans, user) {
  var tmp_path = req.file.path;
  console.log(req.file);
  csvtojson()
  .fromFile(tmp_path)
  .on('json',(jsonObj)=>{
    console.log(jsonObj);
    if(jsonObj.PACCOUNT && jsonObj.ACCOUNT && jsonObj.REGION) {
      jsonObj._id = jsonObj.PACCOUNT;
      conn_acc.insert(jsonObj, function(err, result) {
        console.log("Imported!");

        ticketlist.list({include_docs:true}, function(err, result) {
          for(var i=0; i<result.total_rows; i++)
          {
            if(result.rows[i].doc.client == jsonObj.PACCOUNT){
              result.rows[i].doc.client = jsonObj.ACCOUNT;
              ticketlist.insert(result.rows[i].doc, function(err, result) {
                if(err) console.log(err);
                console.log("success");

              })
            }
          }
        });


      });
    }
  })
  .on('done',(error)=>{
    console.log('end')
    var d = new time.Date();
    d.setTimezone('Asia/Kolkata');
    var date = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds() +", "+ d.getFullYear() + "-" + d.getMonth()+1 + "-" + d.getDate();
    //trans
    var doc = {
      ACTIONBY: user,
      ACTIONTIME: date,
      ACTION: "Bulk import",
      DESCRIPTION: "-"
    }
    conn_trans.insert(doc, function(err, result) {
      console.log("Transaction added!");
      res.end();
    });

  });
}

module.exports.sort_region = function(req, res, conn) {
  conn.list({include_docs: true}, function(err, result) {
    var arr = [];
    for(var i=0; i<result.total_rows; i++) arr.push(result.rows[i].doc);
    arr.sort(GetSortOrder("REGION", req.body.order));
    res.send(arr);
  });
}

module.exports.sort_acc_name = function(req, res, conn) {
  conn.list({include_docs: true}, function(err, result) {
    var arr = [];
    for(var i=0; i<result.total_rows; i++) arr.push(result.rows[i].doc);
    arr.sort(GetSortOrder("PACCOUNT", req.body.order));
    res.send(arr);
  });
}

module.exports.sort_master = function(req, res, conn) {
  conn.list({include_docs: true}, function(err, result) {
    var arr = [];
    for(var i=0; i<result.total_rows; i++) arr.push(result.rows[i].doc);
    arr.sort(GetSortOrder("ACCOUNT", req.body.order));
    res.send(arr);
  });
}

module.exports.login = function(req, res) {
  return true;
  var group = 'group_name';
  bluepages.authenticateGroup(req.body.userid, group, function(err, verified) {
    if(err) {
      console.log(err);
      res.send({failed: true, message: "Enter credentials!"});
      return false;
    }
    else {
      if(verified) {
        bluepages.authenticate(req.body.userid, req.body.password, function(err, verified) {
          if(err) {
            console.log(err);
            res.send({failed: true, message: "Error!"});
            return false;
          }
          else {
            if(verified) {
              return true;
            }
            else {
              res.send({failed: true, message: "Invalid credentials!"});
              return false;
            }
          }
        });
      }
      else {
        res.send({failed: true, message: "Login failed!"});
      }
    }
  });
}


module.exports.export = function(req, res, conn, user) {
  var d = new time.Date();
  d.setTimezone('Asia/Kolkata');
  var date = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds() +", "+ d.getFullYear() + "-" + d.getMonth()+1 + "-" + d.getDate();

  var doc = {
    ACTIONBY: user,
    ACTIONTIME: date,
    ACTION: "Bulk export",
    DESCRIPTION: "-"
  }
  conn.insert(doc, function(err, result) {
    console.log("Transaction added!");
  });
}

module.exports.transactions = function(req, res, conn) {
  conn.list({include_docs: true}, function(err, result) {
    var arr = [];
    for(var i=0; i<result.total_rows; i++) arr.push(result.rows[i].doc);
    res.send(arr);
  });
}

