var express = require('express'),
app = express(),
bodyParser = require('body-parser'),
bb = require('express-busboy'),
morgan = require('morgan'),
dashboardControlleradmin = require('./server/controllers/dashboardControlleradmin'),
dashboardControllerlead = require('./server/controllers/dashboardControllerlead'),
dashboardControlleruser = require('./server/controllers/dashboardControlleruser'),
dashboardControllercrmm = require('./server/controllers/dashboardControllercrmm'),
dashboardControllerlogin = require('./server/controllers/dashboardControllerlogin'),
dashboardControllerimport = require('./server/controllers/dashboardControllerimport'),
validateController = require('./server/controllers/validateController'),
nano = require('nano')('http://admin:admin123@localhost:5984'),
accountmerge = nano.db.use('accountmerge'),
trans = nano.db.use('transactions'),
parature = nano.db.use('paraturenames'),
file_db = nano.db.use('formfiles'),
ticketlist = nano.db.use('ticketlist'),
multer = require('multer'),
upload = multer({dest: __dirname+'/client/uploads/'}),
fs=require('fs'),
url = require('url'),
nonticketform = nano.db.use('nonticketform'),
ticketform = nano.db.use('ticketform'),
escalationform = nano.db.use('escalationform'),
other = nano.db.use('other'),
parachutenames = nano.db.use('paraturenames');
defectlogs = nano.db.use('defectlogs');

var master= []
var primary = []
var records = []
var recordval = []
var missing = []
var missers = []
var importinfo = []
var object={}
var id;


accountmerge.list({include_docs:true}, function(err, result) {
  for(var i=0;i<result.total_rows;i++) {
    master.push(result.rows[i].doc.ACCOUNT);
    primary.push(result.rows[i].doc.PACCOUNT);
  }
})

dashboardControllercrmm.download(null, null, accountmerge);

var server = app.listen(3005, function() {
  console.log("Running at port 3005");
});

var io = require('socket.io').listen(server);


app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use('/', express.static(__dirname + '/client/'));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

/*Login*/
 app.post('/login', dashboardControllerlogin.login);



/*Count DOCS*/

app.get('/api/count_Dbs',function(req,res){


var count=[]
defectlogs.list({include_docs:true}, function(err,result){

if(!result.total_rows)
res.send(count);
for(var i=0;i<result.total_rows;i++){
  count.push(result.rows[i].doc);
  if(i==result.total_rows-1)
        res.send(count);

}

})



})





/*Defect Tickets*/
app.get('/api/defects',function(req, res){

var def_arr=[]
defectlogs.list({include_docs:true}, function(err,result){

if(!result.total_rows)
res.send(def_arr);
for(var i=0;i<result.total_rows;i++){
  def_arr.push(result.rows[i].doc);
  if(i==result.total_rows-1)
        res.send(def_arr);

}

})

})




var getTodayDate = function(){



var today = new Date();
var dd = today.getDate()+1;

var mm = today.getMonth()+1; 
var yyyy = today.getFullYear();
if(dd<10) 
{
    dd='0'+dd;
} 

if(mm<10) 
{
    mm='0'+mm;
} 
today = dd+'/'+mm+'/'+yyyy;

return today;

}






/************************************************DEFECT LOGGING*******************************/
 app.post('/defectlog', function(req,res){
var currentDate =  getTodayDate();

var client = JSON.stringify(req.body.client).substring(1,JSON.stringify(req.body.client).length-1);
var def_tit;
var def_fix =JSON.stringify(req.body.defectFixedBy).substring(1,JSON.stringify(req.body.defectFixedBy).length-1);

var other_def;
var def_tit;
if(typeof JSON.stringify(req.body.OtherDefectTitle)!= 'undefined')
{
def_tit = 'Other- '+JSON.stringify(req.body.OtherDefectTitle).substring(1,JSON.stringify(req.body.OtherDefectTitle).length-1);
}
else{
def_tit = JSON.stringify(req.body.defectTitle).substring(1,JSON.stringify(req.body.defectTitle).length-1);

}



var date_fixed = JSON.stringify(req.body.dated).substring(1,JSON.stringify(req.body.dated).length-1)+'/' + JSON.stringify(req.body.datem).substring(1,JSON.stringify(req.body.datem).length-1)+'/'+JSON.stringify(req.body.datey).substring(1,JSON.stringify(req.body.datey).length-1); ;
var date_log = getTodayDate();

var log_name = JSON.stringify(req.body.email).substring(1,JSON.stringify(req.body.email).length-1);
var case_cat = JSON.stringify(req.body.caseCategory).substring(1,JSON.stringify(req.body.caseCategory).length-1);
var sev = JSON.stringify(req.body.severity).substring(1,JSON.stringify(req.body.severity).length-1);
var func_team = JSON.stringify(req.body.functionTeam).substring(1,JSON.stringify(req.body.functionTeam).length-1);



var desc= JSON.stringify(req.body.disc).substring(1,JSON.stringify(req.body.disc).length-1);
var reso = JSON.stringify(req.body.reso).substring(1,JSON.stringify(req.body.reso).length-1);

var sub = JSON.stringify(req.body.subject).substring(1,JSON.stringify(req.body.subject).length-1);
var tran= JSON.stringify(req.body.transaction).substring(1,JSON.stringify(req.body.transaction).length-1);


object={
'Client_Name' : client,
'Defect_Title' : def_tit,
'Defect_Fixed_by': def_fix,
'OtherDefectTitle': other_def,
'Date_Fixed':date_fixed,
'Date_Logged':date_log,
'Logger_Name': log_name,
'Case_Category': case_cat,
'Subject': sub,
'Severity' : sev,
'Functional_Team': func_team,
'Case_No':JSON.stringify(req.body.ticketNo).substring(1,JSON.stringify(req.body.ticketNo).length-1),
'Description':desc,
'Resolution_Provided':reso,
'Transaction':tran

}



defectlogs.info(function(err,body){
  console.log('DOCUMENT ENTERED No.'+body.doc_count);

   var count= body.doc_count+1;

if(body.doc_count>10)
{
defectlogs.insert(object,'000'+JSON.stringify(count));
res.send({ID:'000'+JSON.stringify(count)})
 }//if--Ends
else
{
defectlogs.insert(object,'0000'+JSON.stringify(count));
res.send({ID:'0000'+JSON.stringify(count)})

}//else-ends

});

 


}



);


/*clients from crmm*/

app.get('/api/getclients', function(req, res) {
  var arr= []
  accountmerge.list({include_docs:true}, function(err, result) {
    if(!result.total_rows) res.send(arr)
    for(var i=0;i<result.total_rows;i++) {
      arr.push(result.rows[i].doc.ACCOUNT)
      if(i==result.total_rows-1) res.send(arr);
    }
  })
});

/*whatsup*/

app.get('/whathappened', function(req, res) {
  url_parts = url.parse(req.url, true);
  user = url_parts.query.user;
  var idx = records.indexOf(user);
  if(idx==-1)
  res.send([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  else {
    console.log(recordval[idx]);
    res.send([recordval[idx].tntform, recordval[idx].escform, recordval[idx].other, recordval[idx].failedtntform,
      recordval[idx].failedescform, recordval[idx].failedother, recordval[idx].status, recordval[idx].datetime,
      recordval[idx].filename, recordval[idx].parachute, recordval[idx].failedparachute, recordval[idx].duptntform,
        recordval[idx].dupescform, recordval[idx].dupother, recordval[idx].dupparachute]);
      recordval.splice(idx, 1);
      records.splice(idx, 1);
    }
  })


  /*Validate user*/
  app.post('/validateuser', validateController.validate);


  /*Logout*/

  app.post('/logout', function(req, res) {
    user = req.body.user;
    var idx = records.indexOf(user);
    if(idx!=-1) {
      recordval = recordval.splice(idx, 1);
      records = records.splice(idx, 1);
    }
    res.send({})
  })

  /*Tickets*/

  app.get('/api/ticketlist', function(req, res) {
    var arr = []
    ticketlist.list({include_docs:true}, function(err, result) {
      if(!result.total_rows)
      res.send(arr);
      for(var i = 0;i<result.total_rows;i++) {
        arr.push(result.rows[i].doc);
        if(i==result.total_rows-1)
        res.send(arr);
      }
    })
  })


  /*user section*/
  app.get('/api/userfeed', function(req, res) {
    var callback = function(arr1, arr2, arr3, user) {
      var allaccepted = {}
      var myappreciated = {}
      allaccepted.nonticket = arr1.filter(function(item) {
        return item.status==1;
      })
      allaccepted.ticket = arr2.filter(function(item) {
        return item.status==1;
      })
      allaccepted.other = arr3.filter(function(item) {
        return item.status==1;
      })
      myappreciated.nonticket = allaccepted.nonticket.filter(function(item) {
        return item.appreciated_user==user;
      })
      myappreciated.ticket = allaccepted.ticket.filter(function(item) {
        return item.appreciated_user==user;
      })
      myappreciated.other = allaccepted.other.filter(function(item) {
        return item.appreciated_user==user;
      })
      arr1 = arr1.filter(function(item) {
        return item.user==user;
      })
      arr2 = arr2.filter(function(item) {
        return item.user==user;
      })
      arr3 = arr3.filter(function(item) {
        return item.user==user;
      })
      res.send(JSON.stringify([JSON.stringify(arr1), JSON.stringify(arr2), JSON.stringify(arr3), JSON.stringify(allaccepted), JSON.stringify(myappreciated)]));
    }
    dashboardControlleruser.userfeed(req, res, callback);
  });
  app.post('/post_non_ticketform_user', dashboardControlleruser.addnonticket);
  app.post('/post_ticketform_user', dashboardControlleruser.addticket);
  app.post('/post_other_user', dashboardControlleruser.addother);
  app.post('/post_defect', dashboardControlleruser.adddefect);


  /*lead section*/


  app.get('/api/leadfeed', function(req, res) {
    var callback = function(arr1, arr2, arr3, arr4, teams, user) {
      var myforms = {}
      var myappreciated = {}
      if(!teams) teams = []
      myforms.nonticket = arr1.filter(function(item) {
        return item.user == user;
      })
      myforms.ticket = arr2.filter(function(item) {
        return item.user == user;
      })
      myforms.other = arr3.filter(function(item) {
        return item.user == user;
      })
      myforms.escalation = arr4.filter(function(item) {
        return item.user == user;
      })
      myappreciated.nonticket = arr1.filter(function(item) {
        return item.appreciated_user == user && (teams.indexOf(item.team) == -1);
      })
      myappreciated.ticket = arr2.filter(function(item) {
        return item.appreciated_user == user && (teams.indexOf(item.team) == -1);
      })
      myappreciated.other = arr3.filter(function(item) {
        return item.appreciated_user == user && (teams.indexOf(item.team) == -1);
      })
      myappreciated.escalation = arr4.filter(function(item) {
        return item.appreciated_user == user && (teams.indexOf(item.team) == -1);
      })
      var newarr1 = arr1.filter(function(item) {
        return (teams.indexOf(item.team) != -1);
      })
      var newarr2 = arr2.filter(function(item) {
        return (teams.indexOf(item.team) != -1);
      })
      var newarr3 = arr3.filter(function(item) {
        return (teams.indexOf(item.team) != -1);
      })
      var newarr4 = arr4.filter(function(item) {
        return (teams.indexOf(item.team) != -1);
      })
      res.send(JSON.stringify([JSON.stringify(newarr1), JSON.stringify(newarr2), JSON.stringify(newarr3), JSON.stringify(newarr4), JSON.stringify(myforms),JSON.stringify(myappreciated)]));
    }
    dashboardControllerlead.leadfeed(req, res, callback);
  });
  app.post('/post_non_ticketform_lead',dashboardControllerlead.addnonticket);
  app.post('/post_ticketform_lead',dashboardControllerlead.addticket);
  app.post('/post_escalationform_lead',dashboardControllerlead.addescalation);
  app.post('/update_formstatus_ticket', dashboardControllerlead.update_formstatus_ticket);
  app.post('/update_formstatus_nonticket', dashboardControllerlead.update_formstatus_nonticket);
  app.post('/update_formstatus_other', dashboardControllerlead.update_formstatus_other);
  app.get('/api/myteams', dashboardControllerlead.myteams);
  app.get('/api/mysubunits', dashboardControllerlead.mysubunits);


  /*lets add files*/

  app.post('/addfile', upload.single('file'), function(req, res) {
    var tmp_path = req.file.path;
    var attach = {
      name: "superuser"
    }
    file_db.insert(attach, function(err, result) {
      var dst_path = path.resolve(__dirname + '/attachments/' + result.id);
      console.log(dst_path);
      fs.rename(tmp_path, dst_path, function(err) {
        console.log(err);
        res.send({link: result.id});
      })
    });
  });

  /*lets download files*/
  app.post('/downloadattach', function(req, res) {
    var src_path = path.resolve(__dirname + '/attachments/' + req.body.id);
    var dst_path = path.resolve(__dirname + '/client/downloadattach/' + req.body.name);
    fs.createReadStream(src_path).pipe(fs.createWriteStream(dst_path));
    res.send({"success": true})
  });


  app.post('/junk', function(req, res) {
    res.send({link: "No file"});
  });

  /*admin section*/

  app.get('/adminfeed', function(req, res) {
    var callback = function(arr1, arr2, arr3, arr4) {
      res.send(JSON.stringify([JSON.stringify(arr1), JSON.stringify(arr2), JSON.stringify(arr3), JSON.stringify(arr4)]));
    }
    dashboardControlleradmin.adminfeed(req, res, callback);
  });

  app.get('/adminparature', function(req, res) {
    var callback = function(arr4) {

      console.log(arr4);
      res.send([JSON.stringify(arr4)]);
    }
    dashboardControlleradmin.adminparature(req, res, callback);
  });

//  app.post('/delete_paratureitem', function(req, res) {
//    console.log(req.body);
//    dashboardControlleradmin.deleteparature(req, res, parature);
//  });

  app.post('/add_parature',dashboardControlleradmin.addparature);
  app.post('/delete_paratureitem',dashboardControlleradmin.deleteparature);
  app.get('/export_nonticket', dashboardControlleradmin.export_nonticket);
  app.get('/export_ticket', dashboardControlleradmin.export_ticket);
  app.get('/export_escalation', dashboardControlleradmin.export_escalation);
  app.get('/export_other', dashboardControlleradmin.export_other);
  app.get('/export_parature', dashboardControlleradmin.export_parature);
  app.post('/delete_form', dashboardControlleradmin.delete_form);
  app.post('/add_functionalteam', dashboardControlleradmin.add_functionalteam);
  app.post('/delete_functionalteam', dashboardControlleradmin.delete_functionalteam);
  app.get('/get_functionalteams', dashboardControlleradmin.get_functionalteams);
  app.post('/delete_invalid', dashboardControlleradmin.deleteinvalid);

  app.post('/importticketform', upload.single('file'), function(req, res) {
    var master= []
    var primary = []
    accountmerge.list({include_docs:true}, function(err, result) {
      if(!result.total_rows) {
        missers.push(req.body.user);
        missing.push([]);
        ticketform.list({include_docs:true}, function(err, resultticket) {
          dashboardControllerimport.importticketform(req, res, master, primary, records, recordval, missing[missers.indexOf(req.body.user)], resultticket);
        })
      }
      else {
        for(var i=0;i<result.total_rows;i++) {
          master.push(result.rows[i].doc.ACCOUNT);
          primary.push(result.rows[i].doc.PACCOUNT);
          if(i==result.total_rows-1) {
            missers.push(req.body.user);
            missing.push([]);
            ticketform.list({include_docs:true}, function(err, resultticket) {
              dashboardControllerimport.importticketform(req, res, master, primary, records, recordval, missing[missers.indexOf(req.body.user)], resultticket);
            })
          }
        }
      }
    })
  });

  app.post('/importnonticketform', upload.single('file'), function(req, res) {
    var master= []
    var primary = []
    accountmerge.list({include_docs:true}, function(err, result) {
      if(!result.total_rows) {
        missers.push(req.body.user);
        missing.push([]);
        nonticketform.list({include_docs:true}, function(err, resultnonticket) {
          dashboardControllerimport.importnonticketform(req, res, master, primary, records, recordval, missing[missers.indexOf(req.body.user)], resultnonticket);
        })
      }
      else {
        for(var i=0;i<result.total_rows;i++) {
          master.push(result.rows[i].doc.ACCOUNT);
          primary.push(result.rows[i].doc.PACCOUNT);
          if(i==result.total_rows-1) {
            missers.push(req.body.user);
            missing.push([]);
            nonticketform.list({include_docs:true}, function(err, resultnonticket) {
              dashboardControllerimport.importnonticketform(req, res, master, primary, records, recordval, missing[missers.indexOf(req.body.user)], resultnonticket);
            })
          }
        }
      }
    })
  });

  app.post('/importesc', upload.single('file'), function(req, res) {
    var master= []
    var primary = []
    accountmerge.list({include_docs:true}, function(err, result) {
      if(!result.total_rows) {
        missers.push(req.body.user);
        missing.push([]);
        escalationform.list({include_docs:true}, function(err, result) {
          dashboardControllerimport.importesc(req, res, master, primary, records, recordval, missing[missers.indexOf(req.body.user)], result);
        })
      }
      else {
        for(var i=0;i<result.total_rows;i++) {
          master.push(result.rows[i].doc.ACCOUNT);
          primary.push(result.rows[i].doc.PACCOUNT);
          if(i==result.total_rows-1) {
            missers.push(req.body.user);
            missing.push([]);
            escalationform.list({include_docs:true}, function(err, result) {
              dashboardControllerimport.importesc(req, res, master, primary, records, recordval, missing[missers.indexOf(req.body.user)], result);
            })
          }
        }
      }
    })
  });

  app.post('/importother', upload.single('file'), function(req, res) {
    var master= []
    var primary = []
    accountmerge.list({include_docs:true}, function(err, result) {
      if(!result.total_rows) {
        missers.push(req.body.user);
        missing.push([]);
        other.list({include_docs:true}, function(err, result) {
          dashboardControllerimport.importother(req, res, master, primary, records, recordval, missing[missers.indexOf(req.body.user)], result);
        })
      }
      else {
        for(var i=0;i<result.total_rows;i++) {
          master.push(result.rows[i].doc.ACCOUNT);
          primary.push(result.rows[i].doc.PACCOUNT);
          if(i==result.total_rows-1) {
            missers.push(req.body.user);
            missing.push([]);
            other.list({include_docs:true}, function(err, result) {
              dashboardControllerimport.importother(req, res, master, primary, records, recordval, missing[missers.indexOf(req.body.user)], result);
            })
          }
        }
      }
    })
  });


  app.post('/importparachute', upload.single('file'), function(req, res) {
    missers.push(req.body.user);
    missing.push([]);
    parachutenames.list({include_docs: true}, function(err, rawdata) {
      dashboardControllerimport.importparachute(req, res, records, recordval, missing[missers.indexOf(req.body.user)], rawdata);
    })
  });


  app.get('/api/missing', function(req, res) {
    console.log("I'm here");
    var arr1 = [], arr2 = [], arr3 = [], arr4=[], arr5=[];
    var url_parts = url.parse(req.url, true);
    var idx = missers.indexOf(url_parts.query.user);
    if(idx==-1) {
      res.send(JSON.stringify([JSON.stringify(arr1), JSON.stringify(arr2), JSON.stringify(arr3), JSON.stringify(arr4), JSON.stringify(arr5)]));
    }
    else if(!missing[idx].length) {
      res.send(JSON.stringify([JSON.stringify(arr1), JSON.stringify(arr2), JSON.stringify(arr3), JSON.stringify(arr4), JSON.stringify(arr5)]));
      missing.splice(idx, 1);
      missers.splice(idx, 1);
      res.end();
    }
    else {
      console.log("missing");
      console.log(missing[idx]);
      console.log("missing");
      for(var i = 0;i<missing[idx].length;i++) {
        if(missing[idx][i].type=="ticket") {
          arr1.push(missing[idx][i]);
        }
        else if(missing[idx][i].type=="nonticket") {
          arr2.push(missing[idx][i]);
        }
        else if(missing[idx][i].type=="other") {
          arr3.push(missing[idx][i]);
        }
        else if(missing[idx][i].type=="escalation") {
          arr4.push(missing[idx][i]);
        }
        else {
          arr5.push(missing[idx][i]);
        }

        if(i==missing[idx].length-1) {
          res.send(JSON.stringify([JSON.stringify(arr1), JSON.stringify(arr2), JSON.stringify(arr3), JSON.stringify(arr4), JSON.stringify(arr5)]));
          missing.splice(idx, 1);
          missers.splice(idx, 1);
          break;
        }
      }
    }
  });



  app.post('/forbiduser', dashboardControlleradmin.forbiduser);
  app.post('/activateuser', dashboardControlleradmin.activateuser);
  app.get('/getfusers', dashboardControlleradmin.getfusers);
  app.post('/updateticket', dashboardControlleradmin.updateticket);
  app.post('/updatenonticket', dashboardControlleradmin.updatenonticket);
  app.post('/updateesc', dashboardControlleradmin.updateesc);
  app.post('/updateother', dashboardControlleradmin.updateother);
  app.get('/api/invalid', dashboardControlleradmin.invalidforms);
  app.post('/delegate', dashboardControlleradmin.delegate);
  app.post('/delegate_edit', dashboardControlleradmin.delegate_edit);
  app.post('/delegate_subassign', dashboardControlleradmin.delegate_subassign);
  app.post('/delegate_delete', dashboardControlleradmin.delegate_delete);
  app.get('/listdelegates', dashboardControlleradmin.listdelegates);
  app.post('/delegate_detach', dashboardControlleradmin.delegate_detach);

  /*socket io*/
  io.on('connection', function(socket) {
    //console.log("connection created");


	socket.on('defectlog',function(data){

alert('Inside defect LOG SOCKET');
defectlogs.insert({name:data.email},'DEF002');
	
	
});


    socket.on('newform', function(form) {
 
console.log(form);
      io.emit('notification', {
        type: form.type,
        data: form.data
      });
    });

    socket.on('newform_edit', function(form) {
      console.log(form);
      io.emit('notification_edit', {
        type: form.type,
        data: form.data
      });
    });

    socket.on('statuschange_ticket', function(form) {
      console.log(form);
      io.emit('statuschange_ticket', {
        message: 'status updated',
        data: form
      });
    });

    socket.on('statuschange_nonticket', function(form) {
      console.log(form);
      io.emit('statuschange_nonticket', {
        message: 'status updated',
        data: form
      });
    });

    socket.on('statuschange_other', function(form) {
      console.log(form);
      io.emit('statuschange_other', {
        message: 'status updated',
        data: form
      });
    });

    socket.on('duderefresh', function(lol) {
      io.emit('duderefresh', {
        message: 'It\'s time to refresh!',
        data: lol
      })
    })

    socket.on('new_delegate', function(new_data) {
      io.emit('new_delegate', {
        message: 'New delegate added!',
        data: new_data
      })
    })

    socket.on('update_delegate', function(new_data) {
      io.emit('update_delegate', {
        message: 'delegate updated!',
        data: new_data
      })
    })

    socket.on('delete_delegate', function(new_data) {
      io.emit('delete_delegate', {
        message: 'delegate deleted!',
        data: new_data
      })
    })

    socket.on('delete_parature', function(new_data) {
      io.emit('delete_parature', {
        message: 'parature deleted!',
        data: new_data
      })
    })

    socket.on('delete_form', function(form) {
      io.emit('delete_form', {
        message: 'admin deletes form',
        data: form
      })
    })

    socket.on('new_team', function(team) {
      io.emit('new_team', {
        message: 'admin created new team',
        data: team
      })
    })

    socket.on('delete_team', function(team) {
      io.emit('delete_team', {
        message: 'admin deleted a team',
        data: team
      })
    })
  socket.on('delete_invalid', function(team) {
      io.emit('delete_invalid', {
        message: 'admin deleted a invalidnotmapped',
        data: team
      })
    })

  //  socket.on('addition_parature', function(new_data) {
  //    io.emit('addition_parature', {
  //      message: 'parature added!',
  //      data: new_data
  //    })
  //    })
  });

  /*FOR THE LORD*/


  app.get('/api/list', function(req, res) {
    dashboardControllercrmm.list(req, res, accountmerge);
  });
  app.get('/api/transaction', function(req, res) {
    dashboardControllercrmm.transactions(req, res, trans);
  });
  app.post('/new_item', function(req, res) {
    dashboardControllercrmm.add(req, res, accountmerge, trans, req.body.user);
  });
  app.post('/delete_item', function(req, res) {
    console.log(req.body);
    dashboardControllercrmm.delete(req, res, accountmerge, trans, req.body.user);
  });
  app.get('/download', function(req, res){
    dashboardControllercrmm.download(req, res, accountmerge);
  });
  app.post('/uploadcrmm', upload.single('file'), function(req, res){
    dashboardControllercrmm.import(req, res, accountmerge, trans, req.body.user);
  });
  app.post('/export', function(req, res){
    console.log(req.body.user);
    dashboardControllercrmm.export(req, res, trans, req.body.user);
  });
  app.post('/by_region', function(req, res){
    dashboardControllercrmm.sort_region(req, res, accountmerge);
  });
  app.post('/by_acc_name', function(req, res) {
    dashboardControllercrmm.sort_acc_name(req, res, accountmerge);
  });
  app.post('/by_master', function(req, res) {
    dashboardControllercrmm.sort_master(req, res, accountmerge);
  });
