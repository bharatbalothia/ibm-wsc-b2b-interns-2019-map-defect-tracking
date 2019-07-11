var nano = require('nano')('http://admin:admin123@localhost:5984'),
nonticketform = nano.db.use('nonticketform');
ticketform = nano.db.use('ticketform');
escalationform = nano.db.use('escalationform');
other = nano.db.use('other');

ticketform.list({include_docs:true}, function(err, result) {
    if(err) console.log(err);
    else{
      var arr1;
    var day,mon,year;
    for(var i=0; i<result.total_rows; i++)
    { arr1=(result.rows[i].doc.date);
        if(arr1.split('-')[0].length == 2 || arr1.split('-')[0].length == 1){
      console.log(arr1 + "inside if");
      day = arr1.split('-')[0];
      mon = arr1.split('-')[1];
      year = arr1.split('-')[2];

      var newdate= year + "-" + mon+ "-" + day;
      console.log(newdate);
      result.rows[i].doc.date=newdate;
      ticketform.insert(result.rows[i].doc, function(err, result) {
        console.log(result);
      })
    }
  }
  }
});

nonticketform.list({include_docs:true}, function(err, result) {
  if(err) console.log(err);
  else{

    var arr2;
    var day,mon,year;
    for(var i=0; i<result.total_rows; i++)
    { arr2=(result.rows[i].doc.date);
      if(arr2.split('-')[0].length == 2 || arr2.split('-')[0].length == 1){
      console.log(arr2);
      day = arr2.split('-')[0];
      mon = arr2.split('-')[1];
      year = arr2.split('-')[2];
      console.log(day + "\n" +mon  + "\n" + year + "\n")
      var newdate= year + "-" + mon+ "-" + day;
      console.log(newdate);
      result.rows[i].doc.date=newdate;
      nonticketform.insert(result.rows[i].doc, function(err, result) {
        console.log(result);
      })
    }
  }
  }
});

other.list({include_docs:true}, function(err, result) {
  if(err) console.log(err);
  else{

    var arr3;
    var day,mon,year;
    for(var i=0; i<result.total_rows; i++)
    { arr3=(result.rows[i].doc.date);
      if(arr3.split('-')[0].length == 2 || arr3.split('-')[0].length == 1){
      console.log(arr3);
      day = arr3.split('-')[0];
      mon = arr3.split('-')[1];
      year = arr3.split('-')[2];
      var newdate= year + "-" + mon+ "-" + day;
      console.log(newdate);
      result.rows[i].doc.date=newdate;
      other.insert(result.rows[i].doc, function(err, result) {
        console.log(result);
      })
    }
  }
  }
});

function updatedate(date)
{
  var day,mon,year,newdate;
  console.log(date);
  if(date.split('-')[0].length == 2 || date.split('-')[0].length == 1){
  day = date.split('-')[0];
  mon = date.split('-')[1];
  year = date.split('-')[2];
  newdate = year + "-" + mon+ "-" + day;
  console.log(newdate);
  return newdate;
  }
  else {
    return date;
  }
}
escalationform.list({include_docs:true}, function(err, result) {
  if(err) console.log(err);
  else{

    var arr4;
    var arr5;
    var day,mon,year,d,m,y;
    for(var i=0; i<result.total_rows; i++)
    { arr4=(result.rows[i].doc.date);
      arr5=(result.rows[i].doc.dateissue);

      result.rows[i].doc.date=updatedate(arr4);
      result.rows[i].doc.dateissue=updatedate(arr5);
      escalationform.insert(result.rows[i].doc, function(err, result) {
      console.log(result);
      })
    }
  }
});
