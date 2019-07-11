var nano = require('nano')('http://admin:admin123@localhost:5984'),
nonticketform = nano.db.use('nonticketform'),
ticketform = nano.db.use('ticketform')
escalationform = nano.db.use('escalationform'),
other = nano.db.use('other'),
functionalteam = nano.db.use('functionalteam'),
parachutenames = nano.db.use('paraturenames'),
invalidforms = nano.db.use('invalidforms'),
fusers = nano.db.use('forbiddenusers'),
url = require('url'),
fs=require('fs'),
json2csv = require('json2csv'),
json2xls = require('json2xls'),
path = require('path'),
convertExcel = require('excel-as-json').processFile,
bluepages = require('bluepages'),
needusername = require('./needusername'),
needusername_enhanced = require('./needusername_enhanced'),
databasejson = require('./databasejson');


function get_funteams(callback) {
  functionalteam.list({include_docs: true}, function(err, result) {
    var functionalteams = []
    if(!result.total_rows) {
      return callback(functionalteams);
    }
    result.rows.forEach(function(item) {
      functionalteams.push(item.doc.name);
      if(functionalteams.length==result.total_rows) {
        return callback(functionalteams);
      }
    })
  })
}

function getnow() {
  var date_info = new Date();
  var date =  date_info.getFullYear() + '-' + (date_info.getMonth()+1).toString() + '-' +date_info.getDate().toString()
  return date;
}

function conversion(date){
  var matches = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(date);
  if (matches == null) return date;

  var d = matches[3];
  var m = matches[2];
  var y = matches[1];
  console.log("d=" +d);
    console.log("m=" +m);
      console.log("y=" +y);

  if(d.length == 1) d = "0" + d;
  if(m.length == 1) m = "0" + m;

  var newdate = y + "-" + m + "-" + d;
  console.log("new date after conversion =" + newdate);
  return newdate;
}

function checkdate(date){
  console.log("check date function");
  var today_date = new Date();
  var t_year  = today_date.getFullYear();
  var t_month = today_date.getMonth()+1;
  var t_date  = today_date.getDate();

  var matches = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(date);
  if (matches == null) return false;
  var d = matches[3]*1;
  var m = matches[2]*1;
  var y = matches[1]*1;

if(y < t_year) return 1;
else if(y == t_year && m < t_month) return 1;
else if(y == t_year && m ==t_month && d <=t_date) return 1;
else return 0;


}

function ExcelDateToJSDate(serial) {
  var utc_days  = Math.floor(serial - 25569);
  var utc_value = utc_days * 86400;
  var date_info = new Date(utc_value * 1000);

  var date =  date_info.getFullYear() + '-' + (date_info.getMonth()+1).toString() + '-' + date_info.getDate().toString()
  console.log(date + "excel");
  return date;
}

function isValidDate(date)
{

  var matches = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(date);
  if (matches == null) return false;
  var d = matches[3];
  var m = matches[2] - 1;
  var y = matches[1];
  var composedDate = new Date(y, m, d);
  return composedDate.getDate() == d &&
  composedDate.getMonth() == m &&
  composedDate.getFullYear() == y;
}


module.exports.importticketform = function(req, res, master, primary, records, recordval, missing, rawdataticket) {
  var count=0;
  var dp = {}
  records.push(req.body.user);
  recordval.push({});
  var idx = records.indexOf(req.body.user);
  recordval[idx].tntform=0;
  recordval[idx].failedtntform=0;
  recordval[idx].duptntform=0;
  recordval[idx].status = 1;
  recordval[idx].filename = req.body.filename;
  recordval[idx].datetime = req.body.datetime;

  var tmp_path = req.file.path;
  var dst_path = path.resolve(__dirname+'/../../client/importform.xlsx');

  var unmapped_tick = [];
  var unmapped_nontick = [];
  var functionalteams = [];

  var TicketLoop = function(data, i, callback) {
    if(data.length==0) {
      return callback();
    }
    item = data[0];
    data.shift();
    tempobj = {}
    tempobj.client = item.CLIENT;
    tempobj.appreciated_user = item.APPRECIATED_USER
    tempobj.ticketno = item.TICKET_NUMBER.toString();
    tempobj.date = item.DATE;
    tempobj.type = item.TYPE.toLowerCase();
    tempobj.user = item.USER;
    tempobj.team = item.FUNCTIONAL_TEAM.toUpperCase();
    tempobj.feedback = item.FEEDBACK;
    tempobj.state = item.APPRECIATION_REASONS
    tempobj.severity = item.SEVERITY.toString();
    tempobj.ticketCategory = item.TICKET_CATEGORY;
    tempobj.ratingtype = (item.TYPE=='external'&&(item.APPRECIATION_COMMENTS.toLowerCase().search("5-star rating")!=-1))?"starrate":"appr";
    tempobj.submit_time = getnow();
    if(tempobj.ratingtype=="appr") {
      tempobj.apprtxt = item.APPRECIATION_COMMENTS;
      tempobj.stars = null
    }
    else {
      tempobj.apprtxt = null;
      if(item.APPRECIATION_COMMENTS.split('(')[1])
      tempobj.stars = item.APPRECIATION_COMMENTS.split('(')[1][0];
      else
      tempobj.stars = -1
      if(!(parseInt(tempobj.stars)>=1&&parseInt(tempobj.stars)<=5)) {
        tempobj.stars = "invalid";
      }
    }
    if(tempobj.date && (tempobj.date.toString().toLowerCase().search("-")==-1)&&(tempobj.date.toString().toLowerCase().search("/")==-1))
    {
      console.log("inside split" + tempobj.date);
    if(tempobj.date && tempobj.date.toString().split('\-/').length == 1)
    tempobj.date = ExcelDateToJSDate(tempobj.date)
    }
    tempobj.date=conversion(tempobj.date);
    console.log("tempobj date= "+ tempobj.date);


    var tmparr = {"line": i+1, "unavailable": [], "map":true, "form": tempobj, "type": "ticket"};
    var status = 1;
    if(master.indexOf(tempobj.client)==-1) {
      if(primary.indexOf(tempobj.client)==-1) {
        status=0;
        tmparr.map=false;
      }
      else tempobj.client=master[primary.indexOf(tempobj.client)];
    }
    var object = {
      user: tempobj.user,
      appreciated_user: tempobj.appreciated_user,
      date: tempobj.date,
      client: tempobj.client,
      type: tempobj.type,
      ticketno: tempobj.ticketno,
      id: null
    }
    databasejson.data(rawdataticket, object, function(repeat) {
      if(repeat) {
        status=0, tmparr.unavailable.push("APPRECIATION ALREADY EXISTS");
        recordval[idx].duptntform++;
      }
      needusername_enhanced.getusername(tempobj.user, dp, function(err, username) {
        tempobj.username = username;
        if(err)
        status=0, tmparr.unavailable.push("Invalid user " + tempobj.user);
        needusername_enhanced.getusername(tempobj.appreciated_user, dp, function(err, username) {
          tempobj.appreciated_username = username;
          if(err)
          status=0, tmparr.unavailable.push("Invalid appreciated user " + tempobj.appreciated_user);
          if(tempobj.client=='') status=0, tmparr.unavailable.push("client");
          if((tempobj.apprtxt=='' && tempobj.starrate=='')) status=0, tmparr.unavailable.push("appreciation text");
          if(tempobj.type=='') status=0, tmparr.unavailable.push("type");
          if(tempobj.ticketno=='') status=0, tmparr.unavailable.push("ticket number");
          if(tempobj.severity=='') status=0, tmparr.unavailable.push("severity");
          if(tempobj.date==''||!isValidDate(tempobj.date) || !checkdate(tempobj.date)) status=0, tmparr.unavailable.push("date");
          if(tempobj.state=='') status=0, tmparr.unavailable.push("application state");
          if(tempobj.team=='') status=0, tmparr.unavailable.push("functional team");
          if(tempobj.stars=='invalid') status=0, tmparr.unavailable.push("stars"), tempobj.stars=null;

          if(functionalteams.indexOf(tempobj.team.toUpperCase())==-1) {
            status=0, tmparr.unavailable.push("invalid functional team");
          }

          var tmp = {}
          if(!tempobj.state) tempobj.state = ""
          if(tempobj.state.toLowerCase().search('quick')!=-1) tmp.quickres=true
          if(tempobj.state.toLowerCase().search('complex')!=-1) tmp.complexsol=true
          if(tempobj.state.toLowerCase().search('other')!=-1) tmp.other=true
          tempobj.state = tmp;
          tempobj.status = 0;
          if(status) {
            ticketform.insert(tempobj, function(err, result) {
              ticketform.get(result.id, function(err, body) {
                rawdataticket.total_rows++;
                rawdataticket.rows.push({doc: body})
                recordval[idx].tntform++;
                console.log("inserted");
                return TicketLoop(data, ++i, callback);
              })
            });
          }
          else {
            recordval[idx].failedtntform++;
            if(tmparr.unavailable.length)
            missing.push(tmparr);
            else {
              invalidforms.insert(tmparr, function(err, result) {
                invalidforms.get(result.id, function(err, body) {
                  unmapped_tick.push(body);
                })
              })
            }
            return TicketLoop(data, ++i, callback);
          }
        });
      });
    });
  }

  convertExcel(tmp_path, null, {sheet: '1'}, function(err, data) {
    get_funteams(function(result){
      functionalteams = result;
      TicketLoop(data, 0, function() {
        fs.rename(tmp_path, dst_path, function(err) {
          res.send([JSON.stringify(unmapped_tick), JSON.stringify(unmapped_nontick)]);
          res.end();
          console.log("Done");
        });
      })
    })
  });
}


module.exports.importnonticketform = function(req, res, master, primary, records, recordval, missing, rawdatanonticket) {
  var count=0;
  var dp = {}
  records.push(req.body.user);
  recordval.push({});
  var idx = records.indexOf(req.body.user);
  recordval[idx].tntform=0;
  recordval[idx].failedtntform=0;
  recordval[idx].duptntform = 0;
  recordval[idx].status = 1;
  recordval[idx].filename = req.body.filename;
  recordval[idx].datetime = req.body.datetime;

  var tmp_path = req.file.path;
  var dst_path = path.resolve(__dirname+'/../../client/importform.xlsx');

  var unmapped_tick = [];
  var unmapped_nontick = [];

  var functionalteams = [];

  var NonTicketLoop = function(data, i, callback) {
    if(data.length==0) {
      return callback();
    }
    item = data[0];
    data.shift();
    tempobj = {}
    tempobj.client = item.CLIENT;
    tempobj.date = item.DATE;
    tempobj.type = item.TYPE;
    tempobj.user = item.USER;
    tempobj.appreciated_user = item.APPRECIATED_USER
    tempobj.apprtxt = item.APPRECIATION_TEXT;
    tempobj.team = item.FUNCTIONAL_TEAM.toUpperCase();
    tempobj.appreciatedby = item.APPRECIATED_BY;
    tempobj.submit_time = getnow();

    if(tempobj.date &&  (tempobj.date.toString().toLowerCase().search("-")==-1) && (tempobj.date.toString().toLowerCase().search("/")==-1))
    {
      console.log("inside split" + tempobj.date);
    if(tempobj.date && tempobj.date.toString().split('\-/').length == 1)
    tempobj.date = ExcelDateToJSDate(tempobj.date)
    }
    tempobj.date=conversion(tempobj.date);

    var tmparr = {"line": i+1, "unavailable": [], "map":true, "form": tempobj, "type": "nonticket"};
    var status = 1;
    if(master.indexOf(tempobj.client)==-1) {
      if(primary.indexOf(tempobj.client)==-1) {
        status=0;
        tmparr.map=false;
      }
      else tempobj.client=master[primary.indexOf(tempobj.client)];
    }
    var object = {
      user: tempobj.user,
      appreciated_user: tempobj.appreciated_user,
      date: tempobj.date,
      client: tempobj.client,
      type: tempobj.type,
      id: null
    }
    databasejson.data(rawdatanonticket, object, function(repeat) {
      if(repeat) {
        status=0, tmparr.unavailable.push("APPRECIATION ALREADY EXISTS");
        recordval[idx].duptntform++;
      }
      needusername_enhanced.getusername(tempobj.user, dp, function(err, username) {
        tempobj.username = username;
        if(err)
        status=0, tmparr.unavailable.push("Invalid user " + tempobj.user);
        needusername_enhanced.getusername(tempobj.appreciated_user, dp, function(err, username) {
          tempobj.appreciated_username = username;
          if(err)
          status=0, tmparr.unavailable.push("Invalid appreciated user " + tempobj.appreciated_user);
          if(tempobj.client=='') status=0, tmparr.unavailable.push("client");
          if((tempobj.apprtxt=='' && tempobj.starrate=='')) status=0, tmparr.unavailable.push("appreciation text");
          if(tempobj.type=='') status=0, tmparr.unavailable.push("type");
          if(tempobj.team=='') status=0, tmparr.unavailable.push("functional team");
          if(tempobj.date==''||!isValidDate(tempobj.date) || !checkdate(tempobj.date)) status=0, tmparr.unavailable.push("date");

          /*if(tempobj.date && isValidDate(tempobj.date) && checkdate(tempobj.date))
          {
            console.log("inside conversion date =" + tempobj.date );
            tempobj.date=conversion(tempobj.date);
          } */

          if(functionalteams.indexOf(tempobj.team.toUpperCase())==-1) {
            status=0, tmparr.unavailable.push("invalid functional team");
          }

          tempobj.status = 0;

          if(status) {
            nonticketform.insert(tempobj, function(err, result) {
              nonticketform.get(result.id, function(err, body) {
                rawdatanonticket.total_rows++;
                rawdatanonticket.rows.push({doc: body})
                console.log("inserted");
                recordval[idx].tntform++;
                return NonTicketLoop(data, ++i, callback);
              })
            });
          }
          else {
            recordval[idx].failedtntform++;
            if(tmparr.unavailable.length)
            missing.push(tmparr);
            else {
              invalidforms.insert(tmparr, function(err, result) {
                invalidforms.get(result.id, function(err, body) {
                  unmapped_nontick.push(tmparr);
                })
              })
            }
            return NonTicketLoop(data, ++i, callback);
          }
        });
      });
    });
  }

  convertExcel(tmp_path, null, {sheet: '1'}, function(err, data) {
    get_funteams(function(result){
      functionalteams = result;
      NonTicketLoop(data, 0, function() {
        fs.rename(tmp_path, dst_path, function(err) {
          res.send([JSON.stringify(unmapped_tick), JSON.stringify(unmapped_nontick)]);
          res.end();
          console.log("Done");
        });
      })
    })
  });
}



module.exports.importesc = function(req, res, master, primary, records, recordval, missing, rawdata) {
  records.push(req.body.user);
  recordval.push({});
  var idx = records.indexOf(req.body.user);
  recordval[idx].escform=0;
  recordval[idx].failedescform=0;
  recordval[idx].dupescform=0;
  recordval[idx].status=1;
  recordval[idx].filename = req.body.filename;
  recordval[idx].datetime = req.body.datetime;
  var tmp_path = req.file.path;
  var dst_path = path.resolve(__dirname+'/../../client/importesc.xlsx');
  var unmapped = []
  var tempobj = {}
  var functionalteams = []
  var escLoop = function(data, i, callback) {
    if(data.length==0) {
      return callback();
    }
    item = data[0];
    data.shift();
    tempobj = {};
    tempobj.client = item.CLIENT;
    tempobj.ticketno = item.TICKET_NUMBER;
    tempobj.date = item.DATE_OF_REPORT;
    tempobj.dateissue = item.DATE_OF_RESOLUTION;
    tempobj.severity = item.SEVERITY;
    tempobj.type = item.ESCALATION_TYPE;
    tempobj.user = item.USER;
    tempobj.apprtxt = item.ESCALATION_TEXT;
    tempobj.raisedby = item.ESCALATION_RAISED_BY;
    tempobj.ibmissue = item.IBM_ISSUE;
    tempobj.appreciated_user = item.ESCALATED_USER;
    tempobj.ticketCategory = item.TICKET_CATEGORY;
    tempobj.team = item.FUNCTIONAL_TEAM.toUpperCase();
    tempobj.actiontaken = item.ACTION_TAKEN;
    tempobj.submit_time = getnow();


    if(tempobj.date && (tempobj.date.toString().toLowerCase().search("-")==-1) &&(tempobj.date.toString().toLowerCase().search("/")==-1))
    {
      console.log("inside split" + tempobj.date);
      if(tempobj.date && tempobj.date.toString().split('-').length == 1)
      tempobj.date = ExcelDateToJSDate(tempobj.date)

    }
    tempobj.date=conversion(tempobj.date);
    console.log("tempobj date= "+ tempobj.date);



    if(tempobj.dateissue && (tempobj.dateissue.toString().toLowerCase().search("-")==-1)&&(tempobj.dateissue.toString().toLowerCase().search("/")==-1))
    {
      if(tempobj.dateissue && tempobj.dateissue.toString().split('-').length == 1)
      tempobj.dateissue = ExcelDateToJSDate(tempobj.dateissue)

    }
    tempobj.dateissue=conversion(tempobj.dateissue);
    console.log("tempobj dateissue= "+ tempobj.dateissue);



    if(tempobj.client==''&&tempobj.ticketno==''&&tempobj.date==''&&tempobj.dateissue==''&&tempobj.type==''&&
    tempobj.user==''&&tempobj.apprtxt==''&&tempobj.raisedby==''&&tempobj.ibmissue==''&&
    tempobj.appreciated_user=='') {
      return escLoop(data, ++i, callback);
    }

    var tmparr = {"line": i+1, "unavailable": [], "map":true, "form": tempobj, "type": "escalation"};
    var status = 1;
    if(master.indexOf(tempobj.client)==-1) {
      if(primary.indexOf(tempobj.client)==-1) {
        status=0;
        tmparr.map=false;
      }
      else tempobj.client=master[primary.indexOf(tempobj.client)];
    }
    var object = {
      user: tempobj.user,
      appreciated_user: tempobj.appreciated_user,
      date: tempobj.date,
      client: tempobj.client,
      type: tempobj.type,
      id: null
    }
    databasejson.data(rawdata, object, function(repeat) {
      if(repeat) {
        status=0, tmparr.unavailable.push("ESCALATION ALREADY EXISTS");
        recordval[idx].dupescform++;
      }
      needusername.getusername(tempobj.user, function(err, username) {
        tempobj.username = username;
        if(err)
        status=0, tmparr.unavailable.push("Invalid userid " + tempobj.user);
        needusername.getusername(tempobj.appreciated_user, function(err, username) {
          tempobj.appreciated_username = username;
          if(err)
          status=0, tmparr.unavailable.push("Invalid escalated userid " + tempobj.appreciated_user);
          datey = tempobj.date.split("-")[0]
          datem = tempobj.date.split("-")[1]
          dated = tempobj.date.split("-")[2]

          dateywhat = tempobj.dateissue.split("-")[0]
          datemwhat = tempobj.dateissue.split("-")[1]
          datedwhat = tempobj.dateissue.split("-")[2]

          if((datedwhat < dated && datemwhat<= datem && dateywhat <= datey)||(datemwhat< datem && dateywhat <= datey)||(dateywhat<datey))
          status=0, tmparr.unavailable.push("Date resolved should be greater than or equal to date of escalation report  ");
          if(tempobj.client=='') status=0, tmparr.unavailable.push("client");
          if((tempobj.apprtxt=='')) status=0, tmparr.unavailable.push("escalation text");
          if((tempobj.actiontaken=='')) status=0, tmparr.unavailable.push("action taken");
          if(tempobj.type=='') status=0, tmparr.unavailable.push("type");
          if(tempobj.team=='') status=0, tmparr.unavailable.push("functional team");
          if(tempobj.severity=='') status=0, tmparr.unavailable.push("severity");
          if(tempobj.date=='' || !isValidDate(tempobj.date) || !checkdate(tempobj.date)) status=0, tmparr.unavailable.push("date report");
        /*  if(tempobj.date && isValidDate(tempobj.date) && checkdate(tempobj.date))
          {
            console.log("inside conversion date =" + tempobj.date );
            tempobj.date=conversion(tempobj.date);
          }
*/
		  console.log("file is here here");//nisarg
          if(tempobj.dateissue){
		          if(!isValidDate(tempobj.dateissue) || !checkdate(tempobj.dateissue)) status=0, tmparr.unavailable.push("date issue");
		          }



          if(functionalteams.indexOf(tempobj.team.toUpperCase())==-1) {
            status=0, tmparr.unavailable.push("invalid functional team");
          }

          if(status) {
            escalationform.insert(tempobj, function(err, result) {
              escalationform.get(result.id, function(err, body) {
                rawdata.total_rows++;
                rawdata.rows.push({doc: body})
                console.log("inserted");
                recordval[idx].escform++;
                return escLoop(data, ++i, callback);
              })
            });
          }
          else {
            recordval[idx].failedescform++;
            if(tmparr.unavailable.length)
            missing.push(tmparr);
            else {
              invalidforms.insert(tmparr, function(err, result) {
                invalidforms.get(result.id, function(err, body) {
                  unmapped.push(tmparr);
                })
              })
            }
            return escLoop(data, ++i, callback);
          }
        })
      });
    });
  }
  convertExcel(tmp_path, null, {sheet: '1'}, function(err, data) {
    get_funteams(function(result) {
      functionalteams = result;
      escLoop(data, 0, function() {
        fs.rename(tmp_path, dst_path, function(err) {
          res.send([JSON.stringify(unmapped)]);
          res.end();
          console.log("Done");
        });
      })
    })
  });
}


module.exports.importother = function(req, res, master, primary, records, recordval, missing, rawdata) {
  records.push(req.body.user);
  recordval.push({});
  var idx = records.indexOf(req.body.user);
  recordval[idx].other=0;
  recordval[idx].failedother=0;
  recordval[idx].dupother=0;
  recordval[idx].status=1;
  recordval[idx].filename = req.body.filename;
  recordval[idx].datetime = req.body.datetime;
  var tmp_path = req.file.path;
  var dst_path = path.resolve(__dirname+'/../../client/importother.xlsx');
  var unmapped = []
  var tempobj = {}
  var functionalteams = []

  var otherLoop = function(data, i, callback) {
    if(data.length==0) {
      return callback();
    }
    item = data[0];
    data.shift();
    tempobj = {};
    tempobj.user = item.USER;
    tempobj.appreciated_user = item.APPRECIATED_USER;
    tempobj.date = item.DATE;
    tempobj.appreciatedby = item.APPRECIATED_BY;
    tempobj.client = item.OTHERS;
    tempobj.type = item.TYPE;
    tempobj.apprtxt = item.APPRECIATION_TEXT;
    tempobj.team = item.FUNCTIONAL_TEAM.toUpperCase();
    tempobj.submit_time = getnow();

if(tempobj.date && (tempobj.date.toString().toLowerCase().search("-")==-1) &&(tempobj.date.toString().toLowerCase().search("/")==-1)){
    if(tempobj.date && tempobj.date.toString().split('-').length == 1)
    tempobj.date = ExcelDateToJSDate(tempobj.date)
  }
  tempobj.date=conversion(tempobj.date);
  console.log("tempobj of other= "+ tempobj.date);

    if(tempobj.client==''&&tempobj.date==''&&tempobj.type==''&&tempobj.team==''&&
    tempobj.user==''&&tempobj.apprtxt==''&&tempobj.appreciated_user=='') {
      return otherLoop(data, ++i, callback);
    }

    var tmparr = {"line": i+1, "unavailable": [], "map":true, "form": tempobj, "type": "other"};
    var status = 1;

    var object = {
      user: tempobj.user,
      appreciated_user: tempobj.appreciated_user,
      date: tempobj.date,
      client: tempobj.client,
      type: tempobj.type,
      id: null
    }
    databasejson.data(rawdata, object, function(repeat) {
      if(repeat) {
        status=0, tmparr.unavailable.push("APPRECIATION ALREADY EXISTS");
        recordval[idx].dupother++;
      }
      needusername.getusername(tempobj.user, function(err, username) {
        tempobj.username = username;
        console.log(err);
        if(err)
        status=0, tmparr.unavailable.push("Invalid userid " + tempobj.user);
        needusername.getusername(tempobj.appreciated_user, function(err, username) {
          tempobj.appreciated_username = username;
          console.log(err);
          if(err)
          status=0, tmparr.unavailable.push("Invalid appreciated userid " + tempobj.appreciated_user);

          if(tempobj.client=='') status=0, tmparr.unavailable.push("Other");
          if((tempobj.apprtxt=='')) status=0, tmparr.unavailable.push("written appreciation");
          if(tempobj.type=='') status=0, tmparr.unavailable.push("type");
          if(tempobj.team=='') status=0, tmparr.unavailable.push("functional team");
          if(tempobj.date=='' || !isValidDate(tempobj.date) || !checkdate(tempobj.date)) status=0, tmparr.unavailable.push("date");
      /*    if(tempobj.date && isValidDate(tempobj.date) && checkdate(tempobj.date))
          {
            console.log("inside conversion date =" + tempobj.date );
            tempobj.date=conversion(tempobj.date);
          }*/


          if(functionalteams.indexOf(tempobj.team.toUpperCase())==-1) {
            status=0, tmparr.unavailable.push("invalid functional team");
          }
          tempobj.status = 0;

          if(status) {
            other.insert(tempobj, function(err, result) {
              other.get(result.id, function(err, body) {
                rawdata.total_rows++;
                rawdata.rows.push({doc: body})
                console.log("inserted");
                recordval[idx].other++;
                return otherLoop(data, ++i, callback);
              })
            });
          }
          else {
            console.log(tmparr);
            recordval[idx].failedother++;
            if(tmparr.unavailable.length) {
              missing.push(tmparr);
            }
            else {
              invalidforms.insert(tmparr, function(err, result) {
                invalidforms.get(result.id, function(err, body) {
                  console.log(body);
                  unmapped.push(tmparr);
                })
              })
            }
            return otherLoop(data, ++i, callback);
          }
        })
      });
    });
  }
  convertExcel(tmp_path, null, {sheet: '1'}, function(err, data) {
    get_funteams(function(result) {
      functionalteams = result;
      otherLoop(data, 0, function() {
        fs.rename(tmp_path, dst_path, function(err) {
          res.send([JSON.stringify(unmapped)]);
          res.end();
          console.log("Done");
        });
      })
    })
  });
}


module.exports.importparachute = function(req, res, records, recordval, missing, rawdata) {
  records.push(req.body.user);
  recordval.push({});
  var idx = records.indexOf(req.body.user);
  recordval[idx].parachute=0;
  recordval[idx].failedparachute=0;
  recordval[idx].dupparachute=0;
  recordval[idx].status=1;
  recordval[idx].filename = req.body.filename;
  recordval[idx].datetime = req.body.datetime;
  var tmp_path = req.file.path;
  var dst_path = path.resolve(__dirname+'/../../client/importother.xlsx');
  var unmapped = []
  var tempobj = {}
  var parachuteLoop = function(data, i, callback) {
    if(data.length==0) {
      return callback();
    }
    item = data[0];
    data.shift();
    tempobj = {};
    tempobj._id =item["Parature Name"];
    tempobj.par_name = item["Parature Name"];
    tempobj.ldap_name = item["LDAP Name"];
    tempobj.intranet_id = item["IBM Intranet ID"];

    if(tempobj.par_name==''&&tempobj.ldap_name==''&&tempobj.intranet_id=='') {
      return otherLoop(data, ++i, callback);
    }

    var tmparr = {"line": i+1, "unavailable": [], "map":true, "form": tempobj, "type": "parachute"};
    var status = 1;
    databasejson.parachute(rawdata, tempobj, function(repeat) {
      if(repeat)
      status=0, tmparr.unavailable.push("duplicate"), recordval[idx].dupparachute++;
      if(tempobj.par_name=='') status=0, tmparr.unavailable.push("Parature Name");
      if((tempobj.ldap_name=='')) status=0, tmparr.unavailable.push("LDAP Name");
      if(tempobj.intranet_id=='') status=0, tmparr.unavailable.push("Intranet ID");

      if(status) {
        console.log(tempobj);
        parachutenames.insert(tempobj, function(err, result) {
          parachutenames.get(result.id, function(err, body) {
            rawdata.total_rows++;
            rawdata.rows.push({doc: body});
            console.log("inserted");
            recordval[idx].parachute++;
            return parachuteLoop(data, ++i, callback);
          })
        });
      }
      else {
        console.log(tmparr);
        recordval[idx].failedparachute++;
        if(tmparr.unavailable.length) {
          missing.push(tmparr);
        }
        else {
          invalidforms.insert(tmparr, function(err, result) {
            invalidforms.get(result.id, function(err, body) {
              console.log(body);
              unmapped.push(tmparr);
            })
          })
        }
        return parachuteLoop(data, ++i, callback);
      }
    })
  }
  convertExcel(tmp_path, null, {sheet: '1'}, function(err, data) {
    console.log(data);
    parachuteLoop(data, 0, function() {
      fs.rename(tmp_path, dst_path, function(err) {
        res.send([JSON.stringify(unmapped)]);
        res.end();
        console.log("Done");
      });
    })
  });
}
