var fs = require('fs'),
nano = require('nano')('http://localhost:5984'),
nonticketform = nano.db.use('nonticketform'),
ticketform = nano.db.use('ticketform')
escalationform = nano.db.use('escalationform'),
invalidforms = nano.db.use('invalidforms'),
fusers = nano.db.use('forbiddenusers'),
accountmerge = nano.db.use('accountmerge'),
transactions = nano.db.use('transactions');

var getname = function(callback) {
  var filename = process.argv[2];
  console.log(process.argv);
  fs.readFile(filename, 'utf-8', function(err, data) {
    if(err) {
      console.log(err);
    }
    else {
      var dbname = JSON.parse(data).dbname;
      if(dbname=='nonticketform') {
        return callback(filename, nonticketform);
      }
      else if(dbname=='ticketform') {
        return callback(filename, ticketform);
      }
      else if(dbname=='escalationform') {
        return callback(filename, escalationform);
      }
      else if(dbname=='invalidforms') {
        return callback(filename, invalidforms);
      }
      else if(dbname=='fusers') {
        return callback(filename, fusers);
      }
      else if(dbname=='accountmerge') {
        return callback(filename, accountmerge);
      }
      else if(dbname=='transactions') {
        return callback(filename, transactions);
      }
      else {
        console.log("Looks like invalid file!")
      }
    }
  })
}


var main = function() {
  getname(function(filename, db) {
    fs.readFile(filename, 'utf-8', function(err, data) {
      var data_json = JSON.parse(data);
      var data_arr = data_json.rows;
      var Insert = function(mydata, callback) {
        if(mydata.length==0) {
          return callback();
        }
        item = mydata[0];
        mydata.shift();
        db.insert(item.doc, function(err, result) {
          if(err) {
            console.log("failed document")
            console.log(item)
            console.log(err);
          }
          else {
            console.log(result);
          }
          Insert(mydata, callback);
        })
      }
      Insert(data_arr, function() {
        console.log("Done dude!")
      });
      console.log(data_arr.rows)
    })
  })
}

main();