var convertExcel = require('excel-as-json').processFile;
var db = require('nano')({
  "url": "http://admin:admin123@localhost:5984/ticketlist",
  "requestDefaults": {
    "timeout": "100"
  } // in miliseconds
});
var accountmerge = require('nano')('http://admin:admin123@localhost:5984').db.use('accountmerge');
var path = require('path');
var csvtojson = require('csvtojson')
var fs = require('fs');
var main = function(mydata) {
  var existing = []
  var exist_account = [];
  var exist_master = [];
  var failed = []
  var duplicates = []
  var import_status = {
    success: 0,
    failed: 0,
    duplicates: 0
  }

  var newline = "\n"
  var logfile = process.argv[3]?process.argv[3]:"import.log";
  fs.writeFileSync(logfile, "file: " + process.argv[2] + newline);

  var savetodb = function(jsondata, line, callback) {
    if(!jsondata.length) {
      return callback();
    }
    var tempdata = {}
    var item = jsondata[0];
    var idx = -1;
    jsondata.shift();
    if(exist_master.indexOf(item["Account Name"])==-1 && (idx=exist_account.indexOf(item["Account Name"]))!=-1) {
      item["Account Name"] = exist_master[idx];
    }

    var dups = existing.filter(function(thisitem) {
      return thisitem.client == item["Account Name"] && thisitem.ticketno == item["Ticket Number"];
    })

    if(!(item["Ticket Number"] && item["Account Name"] && item["Category"])) {
      import_status.failed++;
      var str = (line+1) + "\t" + item["Ticket Number"] + "\t\t" + item["Account Name"] + "\t\t" +
                        item["Category"] + "\t\t" + item["Severity"] + newline;
      failed.push(str);
      return savetodb(jsondata, ++line, callback);
    }
    else if (dups.length==0) {
      tempdata.ticketno = item["Ticket Number"];
      tempdata.client = item["Account Name"];
      tempdata.category = item["Category"];
      tempdata.severity = item["Severity"]?item["Severity"].toString().replace(/\D/g, ''):"";
      db.insert(tempdata, function(err, result) {
        db.get(result.id, function(err, body) {
          existing.push(body);
          import_status.success++;
          return savetodb(jsondata, ++line, callback);
        })
      })
    }

    else if (!(dups[0].category==item["Category"]&&dups[0].severity==item["Severity"].toString().replace(/\D/g, ''))) {
      db.get(dups[0]._id, function(err, result) {
        result.category = item["Category"];
        result.severity = item["Severity"]?item["Severity"].toString().replace(/\D/g, ''):"";
      db.insert(result, function(err, result) {
        db.get(result.id, function(err, body) {
          existing = existing.filter(function(thisitem) {
            return thisitem._id != dups[0]._id;
          })
          existing.push(body);
          import_status.success++;
          return savetodb(jsondata, ++line, callback);
        })
      })
      })
    }

    else {
      var str = (line+1) + "\t" + item["Ticket Number"] + "\t\t" + item["Account Name"] + "\t\t" +
                        item["Category"] + "\t\t" + item["Severity"] + newline;
      duplicates.push(str);
      import_status.duplicates++;
      return savetodb(jsondata, ++line, callback);
    }
  }

  var getclientdata = function(callback) {
    accountmerge.list({include_docs: true}, function(err, result) {
      if(!result.total_rows)
      return  callback(exist_account, exist_master);
      for(var i=0;i<result.total_rows;i++) {
        exist_account.push(result.rows[i].doc.PACCOUNT)
        exist_master.push(result.rows[i].doc.ACCOUNT)
        if(i==result.total_rows-1) {
          return  callback(exist_account, exist_master);
        }
      }
    })
  }
  var fn_success = function() {
    console.log("Success:\t" + import_status.success);
    console.log("Failed: \t" + import_status.failed);
    console.log("Duplicates:\t" + import_status.duplicates);
    console.log("Check log file for more info");
    var delim = "\n------------------------------------------------------------------\n"
    fs.appendFileSync(logfile, delim);
    fs.appendFileSync(logfile, "Duplicates:" + newline + newline);
    fs.appendFileSync(logfile, "Line Ticket Number    Account Name    Category    Severity" + newline);
    duplicates.forEach(function(item) {
      fs.appendFileSync(logfile, item);
    });
    fs.appendFileSync(logfile, delim);
    fs.appendFileSync(logfile, "Failed:" + newline + newline);
    fs.appendFileSync(logfile, "Line Ticket Number    Account Name    Category    Severity" + newline);
    failed.forEach(function(item) {
      fs.appendFileSync(logfile, item);
    })
    fs.appendFileSync(logfile, delim);
  }
  getclientdata(function() {
    db.list({
      include_docs: true
    }, function(err, result) {
      if (!result.total_rows)
      return savetodb(mydata, 0, fn_success);
      else {
        for (var i = 0; i < result.total_rows; i++) {
          existing.push(result.rows[i].doc);
          if (i == result.total_rows - 1)
          return savetodb(mydata, 0, fn_success);
        }
      }
    })
  })
}

var  start = function() {
  var mydata = [];
  var filename = path.resolve(process.argv[2]);
  if(process.argv[2].split('.')[1]=='csv') {
    csvtojson()
    .fromFile(filename)
    .on('json',(jsonObj)=>{
      mydata.push(jsonObj);
    })
    .on('done',(error)=>{
      if(error) {
        console.log("failed");
      }
      else {
        return main(mydata);
      }
    });
  }
  else if (process.argv[2].split('.')[1]=='xlsx') {
    convertExcel(filename, null, {sheet: '1'}, function(err, mydata) {
      if(err) {
        console.log("failed");
      }
      else {
        return main(mydata);
      }
    });
  }
  else {
    console.log("invalid");
  }
}

start();
