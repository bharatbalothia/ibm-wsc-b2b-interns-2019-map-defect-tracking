var nano = require('nano')('http://admin:admin123@localhost:5984'),
nonticketform = nano.db.use('nonticketform');
ticketform = nano.db.use('ticketform');
escalationform = nano.db.use('escalationform');
other = nano.db.use('other');

var getarr = function(rawdata, callback) {
  var arr = [];
  if(rawdata.length==0) return callback(arr);
  for(var i=0;i<rawdata.total_rows;i++) {
    arr.push(rawdata.rows[i].doc);
    if(i==rawdata.total_rows-1)
      return callback(arr);
  }
}


var myLoop = function(db, field, data, callback) {
  if(data.length==0) return callback();
  item = data[0];
  data.shift();
  arr1=item[field];
  console.log(arr1);
  year = arr1.split('-')[0];
  mon = arr1.split('-')[1];
  date = arr1.split('-')[2];
  if(mon.length==1) mon = "0" + mon;
  if(date.length==1) date = "0" + date;
  var newdate= year + "-" + mon+ "-" + date;
  console.log(newdate);
  item[field]=newdate;
  db.insert(item, function(err, result) {
    console.log(result );
    console.log("\n"+ err + JSON.stringify(db) );
    myLoop(db, field, data, callback);
  })
}

var setdate = function(arr, db, field, callback){
    var day,mon,year;
    for(var i=0; i<arr.length; i++)
    {
      arr1=(arr[i][field]);
      console.log(arr1);
      year = arr1.split('-')[0];
      mon = arr1.split('-')[1];
      date = arr1.split('-')[2];
      if(mon.length==1) mon = "0" + mon;
      if(date.length==1) date = "0" + date;
       console.log(date);
      var newdate= year + "-" + mon+ "-" + date;
      console.log(newdate);
      arr[i].doc[field]=newdate;
      db.insert(result.rows[i].doc, function(err, result) {
        console.log(result );
        console.log("\n"+ err + JSON.stringify(db) );
        if(i==result.total_rows-1) {
          callback();
          console.log("callback");
        }
      })
  }
}

var main = function(){
  ticketform.list({include_docs: true}, function(err, result) {
    getarr(result, function(arr) {
      console.log(arr);
      myLoop(ticketform, "date", arr, function() {
        nonticketform.list({include_docs: true}, function(err, result) {
          getarr(result, function(arr) {
            myLoop(nonticketform, "date", arr, function() {
              escalationform.list({include_docs: true}, function(err, result) {
                getarr(result, function(arr) {
                  myLoop(escalationform, "date", arr, function() {
                    escalationform.list({include_docs: true}, function(err, result) {
                      getarr(result, function(arr) {
                        myLoop(escalationform, "dateissue", arr, function() {
                          other.list({include_docs: true}, function(err, result) {
                            getarr(result, function(arr) {
                              myLoop(other, "date", arr, function() {
                                console.log("success");
                              })
                            })
                          })
                        })
                      })
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}

main();
