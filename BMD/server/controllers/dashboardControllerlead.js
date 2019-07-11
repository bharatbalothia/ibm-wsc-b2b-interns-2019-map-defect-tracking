var nano = require('nano')('http://admin:admin123@localhost:5984'),
nonticketform = nano.db.use('nonticketform'),
ticketform = nano.db.use('ticketform')
escalationform = nano.db.use('escalationform'),
other = nano.db.use('other'),
delegates = nano.db.use('delegates'),
url = require('url'),
fs=require('fs'),
needusername = require('./needusername'),
databasejson = require('./databasejson');
var nodemailer = require('nodemailer');
var mail_config = {
       host:"d23hubm6.in.ibm.com",
       port:25,
	   tls: {rejectUnauthorized: false}
    };
var transporter = nodemailer.createTransport(mail_config);

function getnow() {
  var date_info = new Date();
  var date = date_info.getDate().toString() + '-' + (date_info.getMonth()+1).toString() + '-' + date_info.getFullYear()
  return date
}

module.exports.leadfeed = function(req, res, callback) {
  url_parts = url.parse(req.url, true);
  teams = url_parts.query.teams;
  user = url_parts.query.user;
  nonticketform.list({include_docs:true}, function(err, result) {
    var arr1 = [];
    for(var i=0; i<result.total_rows; i++) arr1.push(result.rows[i].doc);
    ticketform.list({include_docs:true}, function(err, result) {
      var arr2 = []
      for(var i=0; i<result.total_rows; i++) arr2.push(result.rows[i].doc);
      other.list({include_docs: true}, function(err, result) {
        var arr3 = [];
        for(var i=0;i<result.total_rows;i++) arr3.push(result.rows[i].doc);
        escalationform.list({include_docs:true}, function(err, result) {
          var arr4 = []
          if(!result.total_rows) return callback(arr1, arr2, arr3, arr4, teams, user);
          for(var i=0; i<result.total_rows; i++) {
            arr4.push(result.rows[i].doc);
            if(i==result.total_rows-1) return callback(arr1, arr2, arr3, arr4, teams, user);
          }
        })
      })
    });
  });
}


module.exports.addnonticket = function(req, res) {
  needusername.getusername(req.body.user, function(status, username) {
    req.body.username = username;
    needusername.getusername(req.body.appreciated_user, function(status, username) {
      req.body.appreciated_username = username;
      nonticketform.insert(req.body, function(err, result) {
        console.log(err);
        nonticketform.get(result.id, function(err, body) {
          res.send(body);
        });
      });
    })
  })
}

module.exports.addticket = function(req, res) {
  needusername.getusername(req.body.user, function(status, username) {
    req.body.username = username;
    needusername.getusername(req.body.appreciated_user, function(status, username) {
      //console.log("drum");
      console.log(username);
      //console.log("drum");
      req.body.appreciated_username = username;
      ticketform.insert(req.body, function(err, result) {
        console.log(result);
        ticketform.get(result.id, function(err, body) {
          res.send(body);
        });
      });
    })
  })
}
module.exports.update_formstatus_ticket = function(req, res) {
  var db = ticketform;
  db.insert(req.body, function(err, result) {
    console.log(result);
    db.get(result.id, function(err, body) {
      console.log(body);
      res.send(body);
    });
  })
}

module.exports.update_formstatus_nonticket = function(req, res) {
  var db = nonticketform;
  db.insert(req.body, function(err, result) {
    console.log(result);
    db.get(result.id, function(err, body) {
      console.log(body);
      res.send(body);
    });
  })
}

module.exports.update_formstatus_other = function(req, res) {
  var db = other;
  db.insert(req.body, function(err, result) {
    console.log(result);
    db.get(result.id, function(err, body) {
      console.log(body);
      res.send(body);
    });
  })
}

module.exports.addescalation = function(req, res) {
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
  escalationform.list({include_docs: true}, function(err, result) {
    databasejson.data(result, object, function(status) {
      if(!status) {
        needusername.getusername(req.body.user, function(status, username) {
          req.body.username = username;
          needusername.getusername(req.body.appreciated_user, function(status, username) {
            req.body.appreciated_username = username;
            escalationform.insert(req.body, function(err, result) {
				var mailOptions = {
									  from: 'BMDtool@in.ibm.com',
									  to: req.body.appreciated_user,
									  subject: 'Escalation Alert',
									  text: 'Escalation raised for case number: ' + req.body.ticketno + ' for the reason: ' + req.body.apprtxt +'\n'+ 'Please contact the map leads if you want to discuss about it',
									  cc: ['raghavkrishnamurthy@in.ibm.com','satyam.jakkula@in.ibm.com'],
									};
									transporter.sendMail(mailOptions, function(error, info){
								  if (error) {
									console.log(error);
								  } else {
									console.log('Email sent: ' + info.response);
								  }
								});
              //console.log("going:" + req.body.appreciated_user);
			  console.log(result);
              escalationform.get(result.id, function(err, body) {
                res.send(body);
              });
            });
          })
        })
      }
      else {
        return res.status(400).send({
          message: 'empty'
        });
      }
    })
  })
}

module.exports.myteams = function(req, res) {
  url_parts = url.parse(req.url, true);
  userid = url_parts.query.userid;
  delegates.get(userid, function(err, result) {
    if(err) {
      console.log(err);
      res.send([{}])
    }
    else {
      res.send([result]);
    }
  })
}

module.exports.update_status_other = function(req, res) {
  other.insert(req.body, function(err, result) {
    console.log(result);
    other.get(result.id, function(err, body) {
      console.log(body);
      res.send(body);
    });
  })
}

module.exports.mysubunits = function(req, res) {
  url_parts = url.parse(req.url, true);
  userid = url_parts.query.userid;
  var myteam = [];
  var arr = [];
  delegates.list({include_docs:true}, function(err, result) {
    if(!result.total_rows) {
      res.send(myteam)
    }
    else {
      for(var i=0;i<result.total_rows;i++) {
        arr.push(result.rows[i].doc);
        if(i==result.total_rows-1) {
          myteam = arr.filter(function(item) {
            return item.manager == userid;
          })
          return res.send(myteam);
        }
      }
    }
  })
}
