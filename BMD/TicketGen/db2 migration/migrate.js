var ibmdb = require('ibm_db'),
    nano = require('nano')('http://admin:admin123@localhost:5984'),
    acc_db = nano.db.use('accountmerge'),
    trans = nano.db.use('transactions'),
    ticketform = nano.db.use('ticketform'),
    nonticketform = nano.db.use('nonticketform'),
    escform = nano.db.use('escalationform'),
    user = nano.db.use('forbiddenusers'),
    parature = nano.db.use('paraturenames'),
    other = nano.db.use('other');

var count=0;
 ibmdb.open("DATABASE=DATA;HOSTNAME=localhost;UID=db2inst1;PWD=db@inst!;PORT=50001;AUTHENTICATION=SERVER;PROTOCOL=TCPIP", function(err, conn)
      {
      	if(err) return console.log(err);
 	        console.log("connection created!");

//ticketform migration

          ticketform.list({include_docs: true}, function(err, result){


           conn.prepare("insert into report.ticketform (CID, APPRECIATED_USERID, APPRECIATED_USERNAME, REASON, CLIENT, TDATE, FUNCTIONAL_TEAM, TICKET_CATEGORY, RATINGTYPE, SEVERITY, STATUS, TICKETNO, TYPE, USERID , USERNAME, STATE, APPRECIATION_TEXT, FEEDBACK ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", function(err, stmt){
             if(err) console.log(err+ "\n ticketform\n");
              else {
                 for(var i=0;i<result.total_rows;i++)
                 {       var arr = "";
                         var l=result.rows[i].doc.status
                         var usern=result.rows[i].doc.username?result.rows[i].doc.username:" ";
                         var appusern=result.rows[i].doc.appreciated_username?result.rows[i].doc.appreciated_username:" ";

                       if(result.rows[i].doc.state){
                         if(result.rows[i].doc.state.quickres) arr="QUICK RESPONSE";
                        if(result.rows[i].doc.state.complexsol) arr= arr +", COMPLEX SOLUTION";
                        if(result.rows[i].doc.state.other)  arr= arr+ ", OTHER";

                       }
                       else arr= ""


                         if(l==1){
                           if(result.rows[i].doc.type == "external") {

                            if(result.rows[i].doc.ratingtype == "appr"){


                      stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user, appusern, result.rows[i].doc.approval_reason, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.ticketCategory, result.rows[i].doc.ratingtype,
                      result.rows[i].doc.severity , result.rows[i].doc.status, result.rows[i].doc.ticketno, result.rows[i].doc.type, result.rows[i].doc.user,usern, arr, result.rows[i].doc.apprtxt, " "], function(err, result){
                        if(err) console.log(err + "\naccepted ticketform external written app\n");


                       });
                     }

                      else if(result.rows[i].doc.ratingtype == "starrate"){
                          var feedBack = result.rows[i].doc.feedback?result.rows[i].doc.feedback : "NO FEEDBACK";
                          console.log("feedback=" + feedBack);
                            var star="5-star rating(" +  result.rows[i].doc.stars + ")";
                         stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user, appusern, result.rows[i].doc.approval_reason, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.ticketCategory, result.rows[i].doc.ratingtype,
                         result.rows[i].doc.severity , result.rows[i].doc.status, result.rows[i].doc.ticketno, result.rows[i].doc.type, result.rows[i].doc.user,usern, arr ,star ,feedBack ], function(err, result){
                                if(err) console.log(err + "\n accepted ticketform external starrate\n");

                                            });
                                          }
                                        }

                        else if(result.rows[i].doc.type == "internal"){

                          stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user, appusern,result.rows[i].doc.approval_reason, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.ticketCategory, "no rating type",
                          result.rows[i].doc.severity , result.rows[i].doc.status, result.rows[i].doc.ticketno, result.rows[i].doc.type, result.rows[i].doc.user, usern, arr ,result.rows[i].doc.apprtxt, " "], function(err, result){
                                 if(err) console.log(err + "\naccepted ticketform internal\n");

                                             });



                        }


                       }

                       else if(l==-1){

                         if(result.rows[i].doc.type == "external") {
                           if(result.rows[i].doc.ratingtype == "appr"){

                             stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user, appusern, result.rows[i].doc.rejection_reason, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.ticketCategory, result.rows[i].doc.ratingtype,
                             result.rows[i].doc.severity , result.rows[i].doc.status, result.rows[i].doc.ticketno, result.rows[i].doc.type, result.rows[i].doc.user,usern, arr, result.rows[i].doc.apprtxt, " "], function(err, result){
                               if(err) console.log(err +"\nrejected ticketform external written appreciation");

                       });
                     }

                     if(result.rows[i].doc.ratingtype == "starrate"){
                       var feedBack = result.rows[i].doc.feedback?result.rows[i].doc.feedback : "NO FEEDBACK";
                       console.log("feedback=" + feedBack);
                       var star="5-star rating(" +  result.rows[i].doc.stars + ")";
                      stmt.execute([result.rows [i].doc._id, result.rows[i].doc.appreciated_user, appusern, result.rows[i].doc.rejection_reason, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.ticketCategory, result.rows[i].doc.ratingtype,
                      result.rows[i].doc.severity , result.rows[i].doc.status, result.rows[i].doc.ticketno, result.rows[i].doc.type, result.rows[i].doc.user,usern, arr ,star ,feedBack ], function(err, result){
                             if(err) console.log(err + "\n rejected ticketform external starrate");
                     });
                     }


                   }


                 else if(result.rows[i].doc.type == "internal"){

                   stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user, appusern,result.rows[i].doc.rejection_reason, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.ticketCategory, "no rating type",
                   result.rows[i].doc.severity , result.rows[i].doc.status, result.rows[i].doc.ticketno, result.rows[i].doc.type, result.rows[i].doc.user,usern, arr ,result.rows[i].doc.apprtxt," "], function(err, result){
                          if(err) console.log(err + "\n rejected ticketform internal\n");

                          });
                         }

                    }

                       else {
                         console.log("no insertion since ticketform is not being verified by the leads ,status is pending")
                         continue};


                 }
               }
           });

          });





           //transaction migration

                trans.list({include_docs: true}, function(err, result) {


               conn.prepare("insert into report.transactions (CID, ACTION, ACTIONBY, ACTIONTIME,  DESCRIPTION) values (?, ?, ?, ?, ?)", function(err, stmt)
                 {
                   if(err) console.log(err + "\nTransactions\n");
                    else {
                      for(var i=0;i<result.total_rows;i++)
                      {
                            stmt.execute([result.rows[i].doc._id, result.rows[i].doc.ACTION, result.rows[i].doc.ACTIONBY, result.rows[i].doc.ACTIONTIME, result.rows[i].doc.DESCRIPTION], function(err, result) {
                               if(err)  console.log(err + "\nTransactions\n");
                          });
                      }
                    }
                  });

                })





          //nonticketform migration

          nonticketform.list({include_docs: true}, function(err, result){




          conn.prepare("insert into report.nonticketform (ID, APPRECIATED_USERID,APPRECIATED_USERNAME, APPRTXT, CLIENT, TDATE, FUNCTIONAL_TEAM, APPRECIATED_BY, REASON, STATUS, TYPE, USERID, USERNAME ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", function(err, stmt){
            if(err) console.log(err + "\n nonticketform \n");
              else {
                  for(var i=0;i<result.total_rows;i++)
                 {
                   var k=result.rows[i].doc.status;
                   var nusern=result.rows[i].doc.username?result.rows[i].doc.username:" ";
                   var nappusern=result.rows[i].doc.appreciated_username?result.rows[i].doc.appreciated_username:" ";

                   if(k==1){

                     stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user,nappusern, result.rows[i].doc.apprtxt, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.appreciatedby, result.rows[i].doc.approval_reason,
                      result.rows[i].doc.status,result.rows[i].doc.type,result.rows[i].doc.user,nusern], function(err, result){
                        if(err) console.log(err + "\n nonticketform \n");
                      });
                    }

                   else if(k==-1 ){

                     stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user,nappusern, result.rows[i].doc.apprtxt, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.appreciatedby, result.rows[i].doc.rejection_reason,
                      result.rows[i].doc.status,result.rows[i].doc.type,result.rows[i].doc.user,nusern], function(err, result){
                         if(err) console.log(err + "\n nonticketform \n");
                       });
                     }
                     else {
                       console.log("no insertion since nonticketform is not being verified by the leads ,status is pending")
                       continue;
                     }

                 }
               }

               });

          });

          // accountmerge migration

               acc_db.list({include_docs: true}, function(err, result) {

               conn.prepare("insert into report.accoutmerge (PACCOUNT, ACCOUNT, REGION) values (?, ?, ?)", function(err, stmt) {
                 if(err) console.log(err + "\nAccount merge\n");
               for(var i=0;i<result.total_rows;i++)
                {
                  stmt.execute([result.rows[i].doc.PACCOUNT, result.rows[i].doc.ACCOUNT, result.rows[i].doc.REGION], function(err, result) {
                    if(err) console.log(err + "\nAccount merge\n");

                });
               }
             });
            });

//parature migration

parature.list({include_docs: true}, function(err, result) {

conn.prepare("insert into report.parature (CID, PARATURE_NAME, LDAP_NAME, IBM_INTRANET_ID) values (?, ?, ?, ?)", function(err, stmt) {
  if(err) console.log(err + "\nparature error\n");
for(var i=0;i<result.total_rows;i++)
 {
   stmt.execute([result.rows[i].doc._id, result.rows[i].doc.par_name, result.rows[i].doc.ldap_name, result.rows[i].doc.intranet_id], function(err, result) {
     if(err) console.log(err + "\nparature error\n");

 });
}
});
});


       //escalation migration

          escform.list({include_docs: true}, function(err, result){



          conn.prepare("insert into report.escalationform (ID, ESCALATED_USERID, ESCALATED_USERNAME, ESCALATION_TEXT, CLIENT, DATE_OF_REPORT,DATE_OF_RESOLUTION, FUNCTIONAL_TEAM, IBMISSUE, ESCALATION_RAISED_BY, SEVERITY, TICKETNO,TICKET_CATEGORY, TYPE, USERID, USERNAME, ACTION_TAKEN ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", function(err, stmt){
                if(err) console.log(err);
                 for(var i=0;i<result.total_rows;i++)
                 { 
                  var severity = result.rows[i].doc.severity?result.rows[i].doc.severity:"-";
                  var dateissue=result.rows[i].doc.dateissue?result.rows[i].doc.dateissue:null;
                  var action = result.rows[i].doc.actiontaken?result.rows[i].doc.actiontaken:"NO ACTION TAKEN";
                  var eusern = result.rows[i].doc.username?result.rows[i].doc.username:" ";
                  var eappusern = result.rows[i].doc.appreciated_username?result.rows[i].doc.appreciated_username:" ";
                  console.log("actiontaken=" + action);
                    if(result.rows[i].doc.ticketno){
                     stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user,eappusern, result.rows[i].doc.apprtxt, result.rows[i].doc.client, result.rows[i].doc.date, dateissue, result.rows[i].doc.team,
                        result.rows[i].doc.ibmissue, result.rows[i].doc.raisedby,severity,result.rows[i].doc.ticketno,result.rows[i].doc.ticketCategory, result.rows[i].doc.type, result.rows[i].doc.user,eusern, action ], function(err, result){
                               if(err) console.log(err + "\nescalation\n");
                      });
                    }
                    else{

                      stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user,eappusern, result.rows[i].doc.apprtxt, result.rows[i].doc.client, result.rows[i].doc.date, dateissue, result.rows[i].doc.team,
                         result.rows[i].doc.ibmissue, result.rows[i].doc.raisedby,severity,"NO TICKETNO","NO TICKET CATEGORY", result.rows[i].doc.type, result.rows[i].doc.user,eusern, action ], function(err, result){
                                if(err) console.log(err + "\nescalation\n");

                        });

                        }
                   }

                    });
                    });



                    // forbidden user migration

                         user.list({include_docs: true}, function(err, result) {


                         conn.prepare("insert into report.forbiddenusers (USERID) values (?)", function(err, stmt) {
                         for(var i=0;i<result.total_rows;i++)
                         {

                           stmt.execute([result.rows[i].doc.userid], function(err, result) {

                             if(err) console.log(err);
                         });
                         }
                         });
                         });

                          //other form migration

                          other.list({include_docs: true}, function(err, result){



                          conn.prepare("insert into report.otherform (ID, APPRECIATED_USERID,APPRECIATED_USERNAME, APPRTXT, OTHER, TDATE, FUNCTIONAL_TEAM, APPRECIATED_BY, REASON, STATUS, TYPE, USERID, USERNAME ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", function(err, stmt){
                            if(err) console.log(err);
                              else {
                                  for(var i=0;i<result.total_rows;i++)
                                 {
                                   var k=result.rows[i].doc.status
                                   var ousern = result.rows[i].doc.username?result.rows[i].doc.username:" ";
                  				   var oappusern = result.rows[i].doc.appreciated_username?result.rows[i].doc.appreciated_username:" ";
                                   if(k==1){


                                     stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user,oappusern, result.rows[i].doc.apprtxt, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.appreciatedby, result.rows[i].doc.approval_reason,
                                      result.rows[i].doc.status,result.rows[i].doc.type,result.rows[i].doc.user,ousern], function(err, result){
                                        if(err) console.log("entry  already exists avoiding duplicates");
                                      });
                                    }

                                   else if(k==-1 ){

                                     stmt.execute([result.rows[i].doc._id, result.rows[i].doc.appreciated_user,oappusern, result.rows[i].doc.apprtxt, result.rows[i].doc.client, result.rows[i].doc.date, result.rows[i].doc.team, result.rows[i].doc.appreciatedby, result.rows[i].doc.rejection_reason,
                                      result.rows[i].doc.status,result.rows[i].doc.type,result.rows[i].doc.user,ousern], function(err, result){
                                         if(err) console.log("entry already exists avoiding duplicates");
                                       });
                                     }
                                     else {
                                       console.log("no insertion since other-form is not being verified by the leads ,status is pending")
                                       continue;
                                     }

                                 }
                               }

                               });

                          });
      });
