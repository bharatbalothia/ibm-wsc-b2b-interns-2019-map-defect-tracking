var app = angular.module("userApp");


app.controller("userdashboardController", function($rootScope, $interval, $window, $scope, $route,$location, $http, $resource, $cookies, socket, FileName, LoginStatus, uploadAPI, FileSizeError) {

  $scope.config = {
    itemsPerPage: 5,
    fillLastPage: "yes"
  }

  $scope.ticket_data = {
    zero: [],
    one: [],
    minusone: [],
    allaccepted: [],
    myappreciated: []
  }
  $scope.nonticket_data = {
    zero: [],
    one: [],
    minusone: [],
    allaccepted: [],
    myappreciated: []
  }
  $scope.other_data = {
    zero: [],
    one: [],
    minusone: [],
    allaccepted: [],
    myappreciated: []
  }

  $scope.tickets = []
  $scope.defectData = []
  $scope.viewTabData=[]
  $scope.numdays = ['who cares', 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  var Ticket = $resource('/api/ticketlist');
  var ClientList = $resource('/api/getclients');
  var Feed = $resource('/api/userfeed');
  var FunctionalTeams = $resource('/get_functionalteams');
  var DefectData = $resource('/api/defects');
  var CountDb = $resource('/api/count_Dbs');
  var Log_Defect = $resource('/defectlog');


//************DEFECT*********************************//
           
CountDb.query(function(res){

console.log(res.length);

})






$scope.GetId = function (id){

DefectData.query(function(result) {
        

         
          $scope.viewTabData=[];
  for(var i=0;i<result.length;i++) {
	
	
	if(result[i]._id == id)
	{
	
         $scope.viewTabData.push(result[i]);
	}
    }
   
  })


}


$scope.onFileSelect = function(){

alert($image);

}
 $scope.submit_reset= function submitForm() {
            document.getElementId('#defectLogForm').submit();
                        }

  $scope.defectLog= function (defectlogs){
	 
	$http.post('/defectlog', defectlogs).then(function (res){
	
	alert('Data Entered into Database with id '+ JSON.stringify((res.data.ID)))
       
	});  

	
         $scope.defectlogs ="";
	
	
	}

$scope.client_filter_defect= function(client){

 DefectData.query(function(result) {
        

         
          $scope.defectData=[];
  for(var i=0;i<result.length;i++) {
	
	if(result[i].Client_Name == client)
	{
         $scope.defectData.push(result[i]);
	}
	else if(client== 'Select All')
	{
	 $scope.defectData.push(result[i]);
	}
	

    }
   
  })


}


$scope.autoFillLoggerName = function(value){


if(value=='Carry Over from Map Development')
$scope.defectlogs.email="";

else
$scope.defectlogs.email="";


}










/***************************************************DEFECT ENDS*********************************************************************/





  FunctionalTeams.query(function(result) {
    $scope.functionalteams = result;
  })

  Ticket.query(function(result) {
    $scope.tickets = result;
  })

  $scope.clientList = []


  Feed.query({feedId: $cookies.get('dash_userid')},function(result) {
    $scope.nonticket_data.feed = JSON.parse(result[0]);
    $scope.ticket_data.feed = JSON.parse(result[1]);
    $scope.other_data.feed = JSON.parse(result[2]);
    allaccepted = JSON.parse(result[3]);
    myappreciated = JSON.parse(result[4]);
    // Non ticket
    $scope.nonticket_data.zero = $scope.nonticket_data.feed.filter(function(item) {
      return item.status==0;
    })
    $scope.nonticket_data.one = $scope.nonticket_data.feed.filter(function(item) {
      return item.status==1;
    })
    $scope.nonticket_data.minusone = $scope.nonticket_data.feed.filter(function(item) {
      return item.status==-1;
    })
    $scope.nonticket_data.allaccepted = allaccepted.nonticket;
    $scope.nonticket_data.myappreciated = myappreciated.nonticket;

    // ticket
    $scope.ticket_data.zero = $scope.ticket_data.feed.filter(function(item) {
      return item.status==0;
    })
    $scope.ticket_data.one = $scope.ticket_data.feed.filter(function(item) {
      return item.status==1;
    })
    $scope.ticket_data.minusone = $scope.ticket_data.feed.filter(function(item) {
      return item.status==-1;
    })
    $scope.ticket_data.allaccepted = allaccepted.ticket;
    $scope.ticket_data.myappreciated = myappreciated.ticket;

    // Other
    $scope.other_data.zero = $scope.other_data.feed.filter(function(item) {
      return item.status==0;
    })
    $scope.other_data.one = $scope.other_data.feed.filter(function(item) {
      return item.status==1;
    })
    $scope.other_data.minusone = $scope.other_data.feed.filter(function(item) {
      return item.status==-1;
    })
    $scope.other_data.allaccepted = allaccepted.other
    $scope.other_data.myappreciated = myappreciated.other;
    $scope.khamar = $scope.nonticket_data.myappreciated + $scope.ticket_data.myappreciated;

  });


  ClientList.query(function(result) {
    for(var i=0;i<result.length;i++) {
      if($scope.clientList.indexOf(result[i])==-1) $scope.clientList.push(result[i]);
    }
  });

  $scope.modalitem = null;
  $scope.todate = new Date();
  $scope.today_year = parseInt(JSON.stringify($scope.todate).slice(1, 5))
  $scope.today_month = parseInt(JSON.stringify($scope.todate).slice(6, 8))
  $scope.today_day = parseInt(JSON.stringify($scope.todate).slice(9, 11))
  $scope.dated = $scope.today_day.toString();
  $scope.datem = $scope.today_month.toString();
  $scope.datey = $scope.today_year.toString();
  $scope.testdate = {
    day: $scope.dated,
    month: $scope.datem,
    year: $scope.datey
  }
  $scope.page = "Dashboard"
  $scope.login_status = $cookies.get('dash_loggedin')
  $scope.user = $cookies.get('dash_userid')
  $scope.loginname = $cookies.get('name')
  $scope.ticketform = {}
  $scope.non_ticketform = {}
  $scope.ticketList = []
  $scope.ticketCategory = ""
  $scope.logout = function() {
    $http({
      url: '/logout',
      method: 'post',
      data: {"user": $cookies.get('dash_userid')}
    }).then(function(data){
      $cookies.remove('dash_userid')
      $cookies.remove('dash_group')
      $cookies.remove('dash_loggedin')
      $location.path('/login').replace();
    }, function(err){})
  }

  $scope.openAlert = function(val) {
    $scope.alertMessage = val;
    $scope.alertModal = true;
  }

  $scope.closeAlert = function() {
    $scope.alertModal = false;
    $scope.alertMessage = '';
  }


  $scope.post_non_ticketform = function() {
    if(FileSizeError.geterror())
    alert("Filesize too large! Keep within 2mb");
    else {
      $http({
        url: '/validateuser',
        method: 'post',
        data: {"userid": $scope.non_ticketform.appreciated_user}
      }).then(function(data){
        if(data.data.validation) {
          $scope.non_ticketform.filename = FileName.getname();
          $scope.non_ticketform.user=$scope.user;
          $scope.non_ticketform.date = $scope.datey + "-" + $scope.datem + "-" + $scope.dated;
          $scope.non_ticketform.status = 0;
          var temp = $scope.non_ticketform;
          uploadAPI.upload($scope.myFile).then(function(data) {
            temp.downloadlink = data.data.link;
            temp.edit = false;
            $http({
              url: '/post_non_ticketform_user',
              method: 'post',
              data: temp
            }).then(function(data) {
              socket.emit('newform', {type: 'nonticket', data: data.data});
              $scope.non_ticketform = {}
              $scope.messagent="APPRECIATION SENT FOR APPROVAL";
              //  $scope.openAlert("APPRECIATION SENT FOR APPROVAL")
            }, function(err) {
              $scope.messaget="";
              $scope.openAlert("APPRECIATION ALREADY EXISTS");
              $scope.non_ticketform = {}
            })
          }, function(err) {})
          $scope.non_ticketform = {}
        }
        else {
          alert("Invalid appreciated_user")
        }
      }, function(err){});
    }
  }

  $scope.post_ticketform = function() {
    var validate_ticketno = function(callback) {
      var list = $scope.tickets.filter(function(item) {
        return (item.client==$scope.ticketform.client && item.ticketno==$scope.ticketform.ticketno)
      })
      if(($scope.ticketform.ticketno.length==11 && $scope.ticketform.ticketno.substring(0,2)=="TS") || ( $scope.ticketform.ticketno.length==13 && $scope.ticketform.ticketno.substring(0,4)=="5377")) {
        return callback();
      }
      else {
        alert("Invalid ticket number for given client!")
        return;
      }
    }
    if(FileSizeError.geterror())
    alert("Filesize too large! Keep within 2mb");
    else if (!$scope.ticketform.state || (!$scope.ticketform.state.quickres && !$scope.ticketform.state.complexsol && !$scope.ticketform.state.other)) {
      alert("Select atleast one appreciation reason")
      return;
    }
    else {
      validate_ticketno(function() {
        $http({
          url: '/validateuser',
          method: 'post',
          data: {"userid": $scope.ticketform.appreciated_user}
        }).then(function(data){
          if(data.data.validation) {
            $scope.ticketform.filename = FileName.getname();
            $scope.ticketform.user=$scope.user;
            $scope.ticketform.date = $scope.datey + "-" + $scope.datem + "-" +  $scope.dated;
            $scope.ticketform.status = 0;
            var temp = $scope.ticketform;
            uploadAPI.upload($scope.myFile).then(function(data) {
              temp.downloadlink = data.data.link;
              temp.edit = false;
              $http({
                url: '/post_ticketform_user',
                method: 'post',
                data: temp
              }).then(function(data) {
                socket.emit('newform', {type: 'ticket', data: data.data});
                $scope.ticketform = {}
                $scope.messaget="APPRECIATION SENT FOR APPROVAL"
                //  $scope.openAlert("APPRECIATION SENT FOR APPROVAL")
              }, function(err) {
                $scope.messaget="";
                $scope.openAlert("APPRECIATION ALREADY EXISTS");
                $scope.ticketform = {}
              })
            }, function(err){});
            $scope.ticketform = {}
          }
          else {
            alert("Invalid appreciated_user")
          }
        }, function(err) {})
      })
    }
  }


  socket.on('statuschange_ticket', function(data) {
    $scope.$apply(function() {
      if($scope.user==data.data.user) {
        $scope.ticket_data.feed = $scope.ticket_data.feed.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.ticket_data.feed.push(data.data);
        $scope.ticket_data.zero = $scope.ticket_data.zero.filter(function(item) {
          return item._id != data.data._id;
        })
        if(data.data.status==1) {
          $scope.ticket_data.one.push(data.data);
        }
        else {
          $scope.ticket_data.one.push(data.data);
        }
      }
      if(data.data.status == 1) {
        $scope.ticket_data.allaccepted.push(data.data)
      }
      if(data.data.appreciated_user==$scope.user&&data.data.status==1) {
        $scope.ticket_data.myappreciated.push(data.data)
      }
    });
  });

  socket.on('statuschange_nonticket', function(data) {
    $scope.$apply(function() {
      if($scope.user==data.data.user) {
        $scope.nonticket_data.feed = $scope.nonticket_data.feed.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.nonticket_data.feed.push(data.data);
        $scope.nonticket_data.zero = $scope.nonticket_data.zero.filter(function(item) {
          return item._id != data.data._id;
        })
        if(data.data.status==1) {
          $scope.nonticket_data.one.push(data.data);
        }
        else {
          $scope.nonticket_data.one.push(data.data);
        }
      }
      if(data.data.status == 1) {
        $scope.nonticket_data.allaccepted.push(data.data)
      }
      if(data.data.appreciated_user==$scope.user&&data.data.status==1) {
        $scope.nonticket_data.myappreciated.push(data.data)
      }
    });
  });

  socket.on('statuschange_other', function(data) {
    $scope.$apply(function() {
      if($scope.user == data.data.user) {
        $scope.other_data.feed = $scope.other_data.feed.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.other_data.feed.push(data.data);
        $scope.other_data.zero = $scope.other_data.zero.filter(function(item) {
          return item._id != data.data._id;
        })
        if(data.data.status==1) {
          $scope.other_data.one.push(data.data);
        }
        else {
          $scope.other_data.one.push(data.data);
        }
      }
      if(data.data.status == 1) {
        $scope.other_data.allaccepted.push(data.data)
      }
      if(data.data.appreciated_user==$scope.user&&data.data.status==1) {
        $scope.other_data.myappreciated.push(data.data)
      }
    });
  });

  socket.on('notification', function(data) {
    if(data.data.user==$scope.user) {
      $scope.$apply(function() {
        if(data.type=='ticket') {
          $scope.ticket_data.feed.push(data.data);
          $scope.ticket_data.zero.push(data.data);
        }
        else if(data.type=='nonticket') {
          $scope.nonticket_data.feed.push(data.data);
          $scope.nonticket_data.zero.push(data.data);
        }
        else if(data.type=='other') {
          $scope.other_data.feed.push(data.data);
          $scope.other_data.zero.push(data.data);
        }
      });
    }
  });


  socket.on('notification_edit', function(data) {
    if(data.data.user==$scope.user) {
      $scope.$apply(function() {
        if(data.type=='ticket') {
          $scope.ticket_data.feed = $scope.ticket_data.feed.filter(function(item) {
            return item._id != data.data._id;
          })
          $scope.ticket_data.feed.push(data.data);
          $scope.ticket_data.zero = $scope.ticket_data.zero.filter(function(item) {
            return item._id != data.data._id;
          })
          $scope.ticket_data.zero.push(data.data)
        }
        else if(data.type=='nonticket') {
          $scope.nonticket_data.feed = $scope.nonticket_data.feed.filter(function(item) {
            return item._id != data.data._id;
          })
          $scope.nonticket_data.feed.push(data.data);
          $scope.nonticket_data.zero = $scope.nonticket_data.zero.filter(function(item) {
            return item._id != data.data._id;
          })
          $scope.nonticket_data.zero.push(data.data)
        }
        else if(data.type=='other') {
          $scope.other_data.feed = $scope.other_data.feed.filter(function(item) {
            return item._id != data.data._id;
          })
          $scope.other_data.feed.push(data.data);
          $scope.other_data.zero = $scope.other_data.zero.filter(function(item) {
            return item._id != data.data._id;
          })
          $scope.other_data.zero.push(data.data)
        }
        else {
          // cannot happen xD
        }

      });
    }
  });



  $scope.$watch('ticketform.client', function() {
    $scope.ticketList = $scope.tickets.filter(function(item) {
      return item.client==$scope.ticketform.client;
    });
  });
  $scope.$watch('modalitem.client', function() {
    $scope.ticketList = $scope.tickets.filter(function(item) {
      return item.client==$scope.modalitem.client;
    });
  });

  $scope.$watch('ticketform.ticketno', function() {
    var test = $scope.tickets.filter(function(item) {
      return item.ticketno==$scope.ticketform.ticketno;
    });
    if(test[0]) {
      $scope.ticketform.ticketCategory = test[0].category?test[0].category:"NONE";
      $scope.ticketform.severity = test[0].category?test[0].severity:'';
    }
  });

  $scope.$watch('modalitem.ticketno', function() {
    var test = $scope.tickets.filter(function(item) {
      return item.ticketno==$scope.modalitem.ticketno;
    });
    if(test[0]) {
      $scope.modalitem.ticketCategory = test[0].category?test[0].category:"NONE";
      $scope.modalitem.severity = test[0].category?test[0].severity:'';
    }
  });

  $scope.$watch('ticketform.severity', function() {
    if($scope.ticketform.ticketno) {
      var test = $scope.tickets.filter(function(item) {
        return item.ticketno==$scope.ticketform.ticketno;
      });
      if(test[0].severity && test[0].severity != $scope.ticketform.severity) {
        $scope.ticketform.severity = test[0].severity;
      }
    }
  })


  $scope.$watch('modalitem.severity', function() {
    if($scope.modalitem.ticketno) {
      var test = $scope.tickets.filter(function(item) {
        return item.ticketno==$scope.modalitem.ticketno;
      });
      if(test[0].severity && test[0].severity != $scope.modalitem.severity) {
        $scope.modalitem.severity = test[0].severity;
      }
    }
  })



  $scope.$watch('ticketform.ratingtype', function() {
    if($scope.ticketform.apprtype=='starrate')
    delete $scope.ticketform.apprtext;
    else
    delete $scope.ticketform.stars;
  });



  $scope.$watch('dated', function() {
    if($scope.datem==2&&$scope.dated>29)
    $scope.dated="28"
    else if($scope.datem==2&&$scope.dated==29&&$scope.datey&&$scope.datey%4 !=0)
    $scope.dated="28"
    else if($scope.dated>$scope.numdays[$scope.dated])
    $scope.dated="1"
    else {}
    if($scope.datey&&$scope.datey>$scope.today_year)
    $scope.datey = $scope.today_year.toString();
    if($scope.datey&&$scope.datem&&$scope.datey>=$scope.today_year&&$scope.datem>$scope.today_month)
    $scope.datem = $scope.today_month.toString();
    if($scope.datey&&$scope.datem&&$scope.dated&&$scope.datey>=$scope.today_year&&$scope.datem>=$scope.today_month&&$scope.dated>$scope.today_day)
    $scope.dated = $scope.today_day.toString();
    if($scope.dated.length==1) $scope.dated = "0" + $scope.dated;
    if($scope.datem.length==1) $scope.datem = "0" + $scope.datem;

  })

  $scope.$watch('datem', function() {
    if($scope.datem==2&&$scope.dated>29)
    $scope.dated="28"
    else if($scope.datem==2&&$scope.dated==29&&$scope.datey&&$scope.datey%4 !=0)
    $scope.dated="28"
    else if($scope.dated>$scope.numdays[$scope.datem])
    $scope.dated="1"
    else {}
    if($scope.datey&&$scope.datey>$scope.today_year)
    $scope.datey = $scope.today_year.toString();
    if($scope.datey&&$scope.datem&&$scope.datey>=$scope.today_year&&$scope.datem>$scope.today_month)
    $scope.datem = $scope.today_month.toString();
    if($scope.datey&&$scope.datem&&$scope.dated&&$scope.datey>=$scope.today_year&&$scope.datem>=$scope.today_month&&$scope.dated>$scope.today_day)
    $scope.dated = $scope.today_day.toString();
    if($scope.dated.length==1) $scope.dated = "0" + $scope.dated;
    if($scope.datem.length==1) $scope.datem = "0" + $scope.datem;

  })

  $scope.$watch('datey', function() {
    if($scope.datey&&$scope.datey>$scope.today_year)
    $scope.datey = $scope.today_year.toString();
    if($scope.datey&&$scope.datem&&$scope.datey>=$scope.today_year&&$scope.datem>$scope.today_month)
    $scope.datem = $scope.today_month.toString();
    if($scope.datey&&$scope.datem&&$scope.dated&&$scope.datey>=$scope.today_year&&$scope.datem>=$scope.today_month&&$scope.dated>$scope.today_day)
    $scope.dated = $scope.today_day.toString();
    if($scope.dated.length==1) $scope.dated = "0" + $scope.dated;
    if($scope.datem.length==1) $scope.datem = "0" + $scope.datem;

  })


  $scope.resubmit_non_ticketform = function(item, file) {
    if(FileSizeError.geterror())
    alert("Filesize too large! Keep within 2mb");
    else {
      $http({
        url: '/validateuser',
        method: 'post',
        data: {"userid": item.appreciated_user}
      }).then(function(data){
        if(data.data.validation) {
          if(file)
          item.filename = FileName.getname();
          item.date = $scope.testdate.year + "-" + $scope.testdate.month + "-" + $scope.testdate.day;
          item.status = 0;
          var temp = item;
          uploadAPI.upload(file).then(function(data) {
            if(file)
            temp.downloadlink = data.data.link;
            temp.edit = true;
            $http({
              url: '/post_non_ticketform_user',
              method: 'post',
              data: temp
            }).then(function(data) {
              data.data.edituser = $scope.user;
              socket.emit('newform_edit', {type: 'nonticket', data: data.data});
              $scope.openAlert("APPRECIATION UPDATED AND SENT FOR APPROVAL")
            }, function(err) {
              alert("Refresh to update the changes and then retry!");
            })
          }, function(err) {})
          $scope.non_ticketform = {}
        }
        else {
          alert("Invalid appreciated_user");
        }
      }, function(err){});
    }
  }



  $scope.resubmit_ticketform = function(item, file) {
    var validate_ticketno = function(callback) {
      var list = $scope.tickets.filter(function(thisitem) {
        return (thisitem.client==item.client && thisitem.ticketno==item.ticketno)
      })
      if(list.length==1) {
        return callback();
      }
      else {
        alert("Invalid ticket number for given client!")
        return;
      }
    }
    if(FileSizeError.geterror())
    alert("Filesize too large! Keep within 2mb");
    else if (!item.state || (!$scope.modalitem.state.quickres && !$scope.modalitem.state.complexsol && !$scope.modalitem.state.other)) {
      alert("Select atleast one appreciation reason")
      return;
    }
    else {
      validate_ticketno(function() {
        $http({
          url: '/validateuser',
          method: 'post',
          data: {userid: item.appreciated_user}
        }).then(function(data) {
          if(data.data.validation) {
            if(file)
            item.filename = FileName.getname();
            item.date = $scope.testdate.year + "-" + $scope.testdate.month + "-" + $scope.testdate.day;
            item.status = 0;
            var temp = item;
            uploadAPI.upload(file).then(function(data) {
              if(file)
              temp.downloadlink = data.data.link;
              temp.edit = true;
              $http({
                url: '/post_ticketform_user',
                method: 'post',
                data: temp
              }).then(function(data) {
                data.data.edituser = $scope.user;
                socket.emit('newform_edit', {type: 'ticket', data: data.data});
                $scope.openAlert("APPRECIATION UPDATED AND SENT FOR APPROVAL")
              }, function(err) {
                alert("Refresh to update the changes and then retry!");
              })
            }, function(err){});
          }
          else {
            alert("Invalid appreciated_user");
          }
        }, function(err) {})
      })
    }
  }


  // modalnomodal

  $scope.showTicketModalEdit = function(item) {
    $scope.testdate.year = item.date.split("-")[0]
    $scope.testdate.month = item.date.split("-")[1]
    $scope.testdate.day = item.date.split("-")[2]
    $scope.TicketModalEdit = true;
    $scope.modalitem = JSON.parse(JSON.stringify(item));
  }

  $scope.closeTicketModalEdit = function() {
    $scope.TicketModalEdit = false;
    $scope.modalitem = null;
  }


  $scope.showNonTicketModalEdit = function(item) {
    $scope.testdate.year = item.date.split("-")[0]
    $scope.testdate.month = item.date.split("-")[1]
    $scope.testdate.day = item.date.split("-")[2]
    $scope.NonTicketModalEdit = true;
    $scope.modalitem = JSON.parse(JSON.stringify(item));
  }

  $scope.closeNonTicketModalEdit = function() {
    $scope.NonTicketModalEdit = false;
    $scope.modalitem = null;
  }


  //Date stabilizer


  $scope.$watch('testdate.day', function() {
    if($scope.testdate.month==2&&$scope.testdate.day>29)
    $scope.testdate.day="28"
    else if($scope.testdate.month==2&&$scope.testdate.day==29&&$scope.testdate.year&&$scope.testdate.year%4 !=0)
    $scope.testdate.day="28"
    else if($scope.testdate.day>$scope.numdays[$scope.testdate.day])
    $scope.testdate.day="1"
    else {}
    if($scope.testdate.year&&$scope.testdate.year>$scope.today_year)
    $scope.testdate.year = $scope.today_year.toString();
    if($scope.testdate.year&&$scope.testdate.month&&$scope.testdate.year>=$scope.today_year&&$scope.testdate.month>$scope.today_month)
    $scope.testdate.month = $scope.today_month.toString();
    if($scope.testdate.year&&$scope.testdate.month&&$scope.testdate.day&&$scope.testdate.year>=$scope.today_year&&$scope.testdate.month>=$scope.today_month&&$scope.testdate.day>$scope.today_day)
    $scope.testdate.day = $scope.today_day.toString();
    if($scope.testdate.day.length==1) $scope.testdate.day = "0" + $scope.testdate.day;
    if($scope.testdate.month.length==1) $scope.testdate.month = "0" + $scope.testdate.month;

  })

  $scope.$watch('testdate.month', function() {
    if($scope.testdate.month==2&&$scope.testdate.day>29)
    $scope.testdate.day="28"
    else if($scope.testdate.month==2&&$scope.testdate.day==29&&$scope.testdate.year&&$scope.testdate.year%4 !=0)
    $scope.testdate.day="28"
    else if($scope.testdate.day>$scope.numdays[$scope.testdate.month])
    $scope.testdate.day="1"
    else {}
    if($scope.testdate.year&&$scope.testdate.year>$scope.today_year)
    $scope.testdate.year = $scope.today_year.toString();
    if($scope.testdate.year&&$scope.testdate.month&&$scope.testdate.year>=$scope.today_year&&$scope.testdate.month>$scope.today_month)
    $scope.testdate.month = $scope.today_month.toString();
    if($scope.testdate.year&&$scope.testdate.month&&$scope.testdate.day&&$scope.testdate.year>=$scope.today_year&&$scope.testdate.month>=$scope.today_month&&$scope.testdate.day>$scope.today_day)
    $scope.testdate.day = $scope.today_day.toString();
    if($scope.testdate.day.length==1) $scope.testdate.day = "0" + $scope.testdate.day;
    if($scope.testdate.month.length==1) $scope.testdate.month = "0" + $scope.testdate.month;

  })

  $scope.$watch('testdate.year', function() {
    if($scope.testdate.year&&$scope.testdate.year>$scope.today_year)
    $scope.testdate.year = $scope.today_year.toString();
    if($scope.testdate.year&&$scope.testdate.month&&$scope.testdate.year>=$scope.today_year&&$scope.testdate.month>$scope.today_month)
    $scope.testdate.month = $scope.today_month.toString();
    if($scope.testdate.year&&$scope.testdate.month&&$scope.testdate.day&&$scope.testdate.year>=$scope.today_year&&$scope.testdate.month>=$scope.today_month&&$scope.testdate.day>$scope.today_day)
    $scope.testdate.day = $scope.today_day.toString();
    if($scope.testdate.day.length==1) $scope.testdate.day = "0" + $scope.testdate.day;
    if($scope.testdate.month.length==1) $scope.testdate.month = "0" + $scope.testdate.month;

  })

  $scope.get_attach = function(id, name) {
    var win  = window.open();
    var data = {"id": id, "name": name}
    $http({
      url: '/downloadattach',
      method: 'post',
      data: data
    }).then(function(data){
      win.location = '/downloadattach/' + name;
    }, function(err){});
  }


  $scope.$watch('ticketform.client', function() {
    $scope.formticketList = $scope.tickets.filter(function(item) {
      return item.client==$scope.ticketform.client;
    });
  });
  $scope.$watch('ticketform.ticketno', function() {
    var test = $scope.tickets.filter(function(item) {
      return item.ticketno==$scope.ticketform.ticketno;
    });
    if(test[0])
    $scope.ticketform.ticketCategory = test[0].category?test[0].category:"NONE";
  });


   





  $scope.post_other = function() {
    $scope.other.user = $scope.user;
    $scope.other.status = 0;
    $scope.other.date = $scope.datey + "-" + $scope.datem + "-" + $scope.dated;
    $http({
      url: '/validateuser',
      method: 'post',
      data: {"userid": $scope.other.appreciated_user}
    }).then(function(data){
      if(data.data.validation) {
        $http({
          method: 'post',
          url: '/post_other_user',
          data: $scope.other
        }).then(function(data){
          socket.emit('newform', {type: 'other', data: data.data});
          $scope.other = {}
          $scope.messageo = "APPRECIATION SENT FOR APPROVAL";
          //$scope.openAlert("APPRECIATION SENT FOR APPROVAL")
        }, function(err){
          $scope.messageo = "";
          $scope.openAlert("APPRECIATION ALREADY EXISTS");
          $scope.other = {}
        })
      }
      else {
        $scope.openAlert("Invalid appreciated user")
      }
    }, function(err){})
  }

  $scope.resubmit_other = function(item, file) {
    item.date = $scope.testdate.year + "-" + $scope.testdate.month + "-" + $scope.testdate.day;
    item.status = 0;
    item.edit = true;
    $http({
      url: '/validateuser',
      method: 'post',
      data: {userid: item.appreciated_user}
    }).then(function(data){
      if(data.data.validation) {
        $http({
          method: 'post',
          url: '/post_other_user',
          data: item
        }).then(function(data){
          socket.emit('newform_edit', {type: 'other', data: data.data});
          $scope.openAlert("APPRECIATION UPDATED AND SENT FOR APPROVAL")
        }, function(err){
          $scope.openAlert("Refresh to update the changes and retry");
        })
      }
    }, function(err){})
  }

  $scope.showotherModalEdit = function(item) {
    $scope.testdate.year = item.date.split("-")[0]
    $scope.testdate.month = item.date.split("-")[1]
    $scope.testdate.day = item.date.split("-")[2]
    $scope.otherModalEdit = true;
    $scope.modalitem = JSON.parse(JSON.stringify(item));
  }

  $scope.closeotherModalEdit = function() {
    $scope.otherModalEdit = false;
    $scope.modalitem = null;
  }

  // How about playing blind?

  socket.on('delete_form', function(data) {
    $scope.$apply(function() {
      if(data.data.type=='nonticket') {
        $scope.nonticket_data.zero = $scope.nonticket_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.nonticket_data.one = $scope.nonticket_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.nonticket_data.minusone = $scope.nonticket_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.nonticket_data.allaccepted = $scope.nonticket_data.allaccepted.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.nonticket_data.myappreciated = $scope.nonticket_data.myappreciated.filter(function(item) {
          return item._id!=data.data.form._id;
        })
      }

      // ticket
      else if(data.data.type=='ticket') {
        $scope.ticket_data.zero = $scope.ticket_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.ticket_data.one = $scope.ticket_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.ticket_data.minusone = $scope.ticket_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.ticket_data.allaccepted = $scope.ticket_data.allaccepted.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.ticket_data.myappreciated = $scope.ticket_data.myappreciated.filter(function(item) {
          return item._id!=data.data.form._id;
        })
      }
      // Other
      else if(data.data.type=='nonticket') {
        $scope.other_data.zero = $scope.other_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.other_data.one = $scope.other_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.other_data.minusone = $scope.other_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.other_data.allaccepted = $scope.other_data.allaccepted.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.other_data.myappreciated = $scope.other_data.myappreciated.filter(function(item) {
          return item._id!=data.data.form._id;
        })
      }
      else {}
    })
  })

});
