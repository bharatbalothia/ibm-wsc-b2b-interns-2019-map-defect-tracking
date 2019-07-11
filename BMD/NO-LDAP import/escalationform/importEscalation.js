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
  //console.log(date + "excel");
  return date;
}

function isValidDate(date)
{
  var matches = /^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/.exec(date);
  if (matches == null) {console.log("returning null"); return false;}
  var d = matches[3];
  var m = matches[2]-1;
  var y = matches[1];
  var composedDate = new Date(y, m, d);

  console.log("d = " + d);
  console.log("m = " + m);

  console.log("y = " + y);

  var n= composedDate.getDate() == d &&
  composedDate.getMonth() == m &&
  composedDate.getFullYear() == y;
  console.log("n="+n);
  return n;
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


var importEsc = function(master, primary, functionalteams, rawdata) {
  var file_path = process.argv[2];
  var missing = []
  var invalid = []
  var import_status = {
    success: 0,
    failed: 0,
    duplicates: 0
  }

  var escLoop = function(data, i, callback) {
    if(data.length==0) {
      return callback();
    }
    item = data[0];
    data.shift();
    tempobj = {};
    tempobj.user = item.USERID;
    tempobj.username = item.USERNAME;
    tempobj.appreciated_user = item.ESCALATED_USERID;
    tempobj.appreciated_username = item.ESCALATED_USERNAME;
    tempobj.client = item.CLIENT;
    tempobj.ticketno = item.TICKET_NUMBER;
    tempobj.date = item.DATE_OF_REPORT;
    tempobj.dateissue = item.DATE_OF_RESOLUTION;
    tempobj.severity = item.SEVERITY;
    tempobj.type = item.ESCALATION_TYPE;
    tempobj.apprtxt = item.ESCALATION_TEXT;
    tempobj.raisedby = item.ESCALATION_RAISED_BY;
    tempobj.ibmissue = item.IBM_ISSUE;
    tempobj.ticketCategory = item.TICKET_CATEGORY;
    tempobj.team = item.FUNCTIONAL_TEAM.toUpperCase();
    tempobj.actiontaken = item.ACTION_TAKEN;
    tempobj.submit_time = getnow();



    if(tempobj.date && (tempobj.date.toString().toLowerCase().search("-")==-1) &&(tempobj.date.toString().toLowerCase().search("/")==-1))
    {
      //console.log("inside split" + tempobj.date);
      if(tempobj.date && tempobj.date.toString().split('\-/').length == 1)
      tempobj.date = ExcelDateToJSDate(tempobj.date)

    }
    tempobj.date=conversion(tempobj.date);
    //console.log("tempobj date= "+ tempobj.date);



    if(tempobj.dateissue && (tempobj.dateissue.toString().toLowerCase().search("-")==-1)&&(tempobj.dateissue.toString().toLowerCase().search("/")==-1))
    {
      if(tempobj.dateissue && tempobj.dateissue.toString().split('\-/').length == 1)
      tempobj.dateissue = ExcelDateToJSDate(tempobj.dateissue)

    }
    tempobj.dateissue=conversion(tempobj.dateissue);
	  // console.log("tempobj dateissue= "+ tempobj.dateissue);




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
        import_status.duplicates++;
      }

      if(tempobj.user=='') status=0, tmparr.unavailable.push("user")
      if(tempobj.username=='') status=0, tmparr.unavailable.push("username")
      if(tempobj.appreciated_user=='') status=0, tmparr.unavailable.push("appreciated_user")
      if(tempobj.appreciated_username=='') status=0, tmparr.unavailable.push("appreciated_username")


      datey = tempobj.date.split("-")[0]
      datem = tempobj.date.split("-")[1]
      dated = tempobj.date.split("-")[2]

      if(tempobj.dateissue){
      dateywhat = tempobj.dateissue.split("-")[0]
      datemwhat = tempobj.dateissue.split("-")[1]
      datedwhat = tempobj.dateissue.split("-")[2]
    
      if((dateywhat<datey)||(datemwhat< datem && dateywhat <= datey)||(datedwhat < dated && datemwhat<= datem && dateywhat <= datey))
      status=0, tmparr.unavailable.push("Date resolved should be greater than or equal to date of escalation report  ");
 
  		}
      if(tempobj.client=='') status=0, tmparr.unavailable.push("client");
      if((tempobj.apprtxt=='')) status=0, tmparr.unavailable.push("escalation text");
      if((tempobj.actiontaken=='')) status=0, tmparr.unavailable.push("action taken");
      if(tempobj.type=='') status=0, tmparr.unavailable.push("type");
      if(tempobj.team=='') status=0, tmparr.unavailable.push("functional team");
      if(tempobj.severity=='') status=0, tmparr.unavailable.push("severity");
       console.log(tempobj.date + "khamar");
      // if(tempobj.date=='' || !isValidDate(tempobj.date) || !checkdate(tempobj.date)) console.log("saba here"), status=0, tmparr.unavailable.push("date report");
      if(tempobj.date==''){
      	console.log("1 ka");
      	status=0, tmparr.unavailable.push("date report");
      }
      else if(!isValidDate(tempobj.date)){
      	console.log("2 ka");
      	status=0, tmparr.unavailable.push("date report");
      }
      else if(!checkdate(tempobj.date)){
      	console.log("3 ka");
      	status=0, tmparr.unavailable.push("date report");
      }



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
            import_status.success++;
            return escLoop(data, ++i, callback);
          })
        });
      }
      else {
        import_status.failed++;
        if(tmparr.unavailable.length)
        missing.push(tmparr);
        else {
          invalid.push(tmparr);
          invalidforms.insert(tmparr, function(err, result) {
            // ok
          })
        }
        return escLoop(data, ++i, callback);
      }
    })
  }
  convertExcel(file_path, null, {sheet: '1'}, function(err, data) {
      escLoop(data, 0, function() {
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
        fs.appendFileSync(logfile, newline)
        fs.appendFileSync(logfile, "not mapped" + newline + newline)
        for(var i=0;i<invalid.length;i++) {
          fs.appendFileSync(logfile, "Line: " + invalid[i].line + newline)
          fs.appendFileSync(logfile, "Client not-mapped: " + invalid[i].form.client + newline)
          fs.appendFileSync(logfile, newline)
        }
      })
  });
}



var main = function() {
  var master=[],
  primary=[];
  get_funteams(function(functionalteams){
    escalationform.list({include_docs:true}, function(err, rawdata) {
      accountmerge.list({include_docs: true}, function(err, result) {
        if(result.total_rows) {
          for(var i=0;i<result.total_rows;i++) {
            master.push(result.rows[i].doc.ACCOUNT);
            primary.push(result.rows[i].doc.PACCOUNT);
            if(i==result.total_rows-1) {
              importEsc(master, primary, functionalteams, rawdata);
            }
          }
        }
        else {
          importEsc(master, primary, functionalteams, rawdata);
        }
      })
    })
  })
}

main();
