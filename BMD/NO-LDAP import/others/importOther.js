var nano = require('nano')('http://admin:admin123@localhost:5984'),
accountmerge = nano.db.use('accountmerge'),
nonticketform = nano.db.use('nonticketform'),
ticketform = nano.db.use('ticketform')
escalationform = nano.db.use('escalationform'),
other = nano.db.use('other'),
functionalteam = nano.db.use('functionalteam'),
parachurenames = nano.db.use('paraturenames'),
invalidforms = nano.db.use('invalidforms'),
fusers = nano.db.use('forbiddenusers'),
url = require('url'),
fs=require('fs'),
path = require('path'),
convertExcel = require('excel-as-json').processFile,
bluepages = require('bluepages'),
needusername = require('../../server/controllers/needusername'),
databasejson = require('../../server/controllers/databasejson'),
fs = require('fs');

function conversion(date){
  var matches = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(date);
  if (matches == null) {console.log("returning null");return date;}

  var d = matches[3];
  var m = matches[2];
  var y = matches[1];
  
  if(d.length == 1) d = "0" + d;
  if(m.length == 1) m = "0" + m;

  var newdate = y + "-" + m + "-" + d;
  console.log("newdate = " + newdate);
  return newdate;
}

function checkdate(date){
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


function getnow() {
  var date_info = new Date();
  var date = date_info.getDate().toString() + '-' + (date_info.getMonth()+1).toString() + '-' + date_info.getFullYear()
  return date
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



var importOther = function(master, primary, functionalteams, rawdata) {
  var file_path = process.argv[2];
  var missing = [];
  var invalid = [];
  var import_status = {
    success: 0,
    failed: 0,
    duplicates: 0
  }

  var otherLoop = function(data, i, callback) {
    if(data.length==0) {
      return callback();
    }
    item = data[0];
    data.shift();
    tempobj = {};
    tempobj.user = item.USERID;
    tempobj.username = item.USERNAME;
    tempobj.appreciated_user = item.APPRECIATED_USERID;
    tempobj.appreciated_username = item.APPRECIATED_USERNAME;
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
        import_status.duplicates++;
      }

      if(tempobj.user=='') status=0, tmparr.unavailable.push("user ID")
      if(tempobj.username=='') status=0, tmparr.unavailable.push("username")
      if(tempobj.appreciated_user=='') status=0, tmparr.unavailable.push("appreciated_user ID")
      if(tempobj.appreciated_username=='') status=0, tmparr.unavailable.push("appreciated_username")
      if(tempobj.client=='') status=0, tmparr.unavailable.push("Other");
      if((tempobj.apprtxt=='')) status=0, tmparr.unavailable.push("written appreciation");
      if(tempobj.type=='') status=0, tmparr.unavailable.push("type");
      if(tempobj.team=='') status=0, tmparr.unavailable.push("functional team");
      if(tempobj.date=='' || !isValidDate(tempobj.date) || !checkdate(tempobj.date)) status=0, tmparr.unavailable.push("date");
   

      if(functionalteams.indexOf(tempobj.team.toUpperCase())==-1) {
        status=0, tmparr.unavailable.push("invalid functional team");
      }
      tempobj.status = 0;

      if(status) {
        other.insert(tempobj, function(err, result) {
          other.get(result.id, function(err, body) {
            rawdata.total_rows++;
            rawdata.rows.push({doc: body})
            import_status.success++;
            return otherLoop(data, ++i, callback);
          })
        });
      }
      else {
        import_status.failed++;
        if(tmparr.unavailable.length) {
          missing.push(tmparr);
        }
        else {
          invalid.push(tmparr);
          invalidforms.insert(tmparr, function(err, result) {
            // ok
          })
        }
        return otherLoop(data, ++i, callback);
      }
    });
  }
  convertExcel(file_path, null, {sheet: '1'}, function(err, data) {
    otherLoop(data, 0, function() {
      console.log("Success:\t" + import_status.success);
      console.log("Failed: \t" + import_status.failed);
      console.log("Duplicates:\t" + import_status.duplicates);

      var newline = "\n"
      var logfile = "import.log";
      fs.writeFileSync(logfile, "file: " + file_path + newline);
      fs.appendFileSync(logfile, newline)
      console.log("Done\nCheck import.log for more info");
      fs.appendFileSync(logfile, "missing" + newline)
      fs.appendFileSync(logfile, newline)
      for(var i=0;i<missing.length;i++) {
        fs.appendFileSync(logfile, "Line: " + missing[i].line + newline)
        for(var j=0;j<missing[i].unavailable.length;j++)
        fs.appendFileSync(logfile, missing[i].unavailable[j] + newline)
        fs.appendFileSync(logfile, newline)
      }
    
    })
  });
}


var main = function() {
  var master=[],
  primary=[];
  get_funteams(function(functionalteams){
    other.list({include_docs:true}, function(err, rawdata) {
      accountmerge.list({include_docs: true}, function(err, result) {
        if(result.total_rows) {
          for(var i=0;i<result.total_rows;i++) {
            master.push(result.rows[i].doc.ACCOUNT);
            primary.push(result.rows[i].doc.PACCOUNT);
            if(i==result.total_rows-1) {
              importOther(master, primary, functionalteams, rawdata);
            }
          }
        }
        else {
          importOther(master, primary, functionalteams, rawdata);
        }
      })
    })
  })
}

main();
