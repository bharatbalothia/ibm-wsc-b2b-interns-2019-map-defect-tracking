var app = angular.module("userApp");
app.controller("leaddashboardController", function($rootScope, $interval, $window, $scope, $route, $location, $http, $resource, $cookies, socket, FileName, LoginStatus, uploadAPI, FileSizeError) {

  $scope.config = {
    itemsPerPage: 5,
    fillLastPage: "yes"
  }

  $scope.TicketModalEdit = false;
  $scope.NonTicketModalEdit = false;
  $scope.user = $cookies.get('dash_userid')
  $scope.loginname = $cookies.get('name')
  $scope.clientList = []
  $scope.tickets = []
  $scope.numdays = ['who cares', 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  $scope.ticket_data = {
    zero: [],
    one: [],
    minusone: [],
    mine: [],
    myappreciated: []
  }
  $scope.nonticket_data = {
    zero: [],
    one: [],
    minusone: [],
    mine: [],
    myappreciated: []
  }
  $scope.other_data = {
    zero: [],
    one: [],
    minusone: [],
    mine: [],
    myappreciated: []
  }
  $scope.escalation_data = {
    zero: [],
    one: [],
    minusone: [],
    mine: [],
    myappreciated: []
  }

  var Ticket = $resource('/api/ticketlist');
  var ClientList = $resource('/api/getclients');
  var Feed = $resource('/api/leadfeed');
  var Teams = $resource('/api/myteams');
  var Subunits = $resource('/api/mysubunits');
  var FunctionalTeams = $resource('/get_functionalteams');

  FunctionalTeams.query(function(result) {
    $scope.functionalteams = result;
  })

  Ticket.query(function(result) {
    $scope.tickets = result;
  });

  Teams.query({userid: $scope.user}, function(result) {
    $scope.mydelegations = result[0];
    $scope.myteams = $scope.mydelegations.assigned;
    if($scope.mydelegations.status=='manager') {
      Subunits.query({userid: $scope.user}, function(result) {
        $scope.mysubunits = result;
      })
    }
    Feed.query({teams: $scope.myteams, user: $scope.user}, function(result) {
      $scope.nonticket_data.feed = JSON.parse(result[0]);
      $scope.ticket_data.feed = JSON.parse(result[1]);
      $scope.other_data.feed = JSON.parse(result[2]);
      $scope.escalation_data.feed = JSON.parse(result[3]);
      myforms = JSON.parse(result[4]);
      myappreciated = JSON.parse(result[5]);

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
      $scope.nonticket_data.mine = myforms.nonticket;
      $scope.nonticket_data.myappreciated = myappreciated.nonticket.filter(function(item){
        return item.status == 1;
      });


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
      $scope.ticket_data.mine = myforms.ticket;
      $scope.ticket_data.myappreciated = myappreciated.ticket.filter(function(item){
        return item.status == 1;
      });;

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
      $scope.other_data.mine = myforms.other
      $scope.other_data.myappreciated = myappreciated.other.filter(function(item){
        return item.status == 1;
      });

      // escalation
      $scope.escalation_data.mine = myforms.escalation;
      $scope.escalation_data.myappreciated = myappreciated.escalation;

      $scope.ticket_dashboard = $scope.ticket_data.myappreciated.concat($scope.ticket_data.one)
      $scope.nonticket_dashboard = $scope.nonticket_data.myappreciated.concat($scope.nonticket_data.one)
      $scope.other_dashboard = $scope.other_data.myappreciated.concat($scope.other_data.one)
      $scope.escalation_dashboard = $scope.escalation_data.myappreciated.concat($scope.escalation_data.feed)

    })
  })

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
  $scope.datedwhat = $scope.today_day.toString();
  $scope.datemwhat = $scope.today_month.toString();
  $scope.dateywhat = $scope.today_year.toString();
  $scope.testdate = {
    day: $scope.dated,
    month: $scope.datem,
    year: $scope.datey
  }
  $scope.approval = null;
  $scope.approvaltext = null;
  $scope.page = "Dashboard"
  $scope.login_status = $cookies.get('dash_loggedin')
  $scope.userlevel = $cookies.get('dash_group')
  $scope.ticketform = {}
  $scope.non_ticketform = {}
  $scope.escalationform = {}
  $scope.approval_reason = ''
  $scope.escticketList = []
  $scope.formticketList = []
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
          $scope.non_ticketform.filename=FileName.getname();
          $scope.non_ticketform.user=$scope.user;
          $scope.non_ticketform.date = $scope.datey + "-" + $scope.datem + "-" + $scope.dated;
          $scope.non_ticketform.status = 0;
          var temp = $scope.non_ticketform;
          var tempScope = $scope.openAlert;
          uploadAPI.upload($scope.myFile).then(function(data) {
            //socket.emit('newform', data.data);
            temp.downloadlink = data.data.link;
            temp.edit = false;
            $http({
              url: '/post_non_ticketform_user',
              method: 'post',
              data: temp
            }).then(function(data) {
              socket.emit('newform', {type: 'nonticket', data: data.data});
              $scope.non_ticketform = {}
              //$scope.openAlert("APPRECIATION SENT FOR APPROVAL");
              $scope.messagent= "APPRECIATION SENT FOR APPROVAL";
            }, function(err) {
              $scope.messagent = "";
              $scope.non_ticketform = {};
              $scope.openAlert("APPRECIATION ALREADY EXISTS");
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
          data: {userid: $scope.ticketform.appreciated_user}
        }).then(function(data) {
          if(data.data.validation) {
            $scope.ticketform.filename=FileName.getname();
            $scope.ticketform.user=$scope.user;
            $scope.ticketform.date = $scope.datey + "-" + $scope.datem + "-" + $scope.dated;
            $scope.ticketform.status = 0;
            var temp = $scope.ticketform;
            uploadAPI.upload($scope.myFile).then(function(data) {
              //socket.emit('newform', data.data);
              temp.downloadlink = data.data.link;
              temp.edit = false;
              $http({
                url: '/post_ticketform_user',
                method: 'post',
                data: temp
              }).then(function(data) {
                socket.emit('newform', {type: 'ticket', data: data.data});
                $scope.ticketform = {}
                //$scope.openAlert("APPRECIATION SENT FOR APPROVAL")
                $scope.messaget= "APPRECIATION SENT FOR APPROVAL";
              }, function(err) {
                $scope.messaget = "";
                $scope.ticketform = {}
                $scope.openAlert("APPRECIATION ALREADY EXISTS");
              })
            }, function(err) {})
            $scope.ticketform = {}
          }
          else {
            alert("Invalid appreciated_user");
          }
        }, function(err) {})
      })
    }
  }

  $scope.post_escalationform = function() {
    var validate_ticketno = function(callback) {
      var list = $scope.tickets.filter(function(item) {
        return (item.client==$scope.escalationform.client && item.ticketno==$scope.escalationform.ticketno)
      })
      if(($scope.escalationform.ticketno.length==11 && $scope.escalationform.ticketno.substring(0,2)=="TS") || ( $scope.escalationform.ticketno.length==13 && $scope.escalationform.ticketno.substring(0,4)=="5377")) {//!$scope.escalationform.ticketno || list.length==1) {
        return callback();
      }
      else {
        alert("Invalid ticket number for given client!2")
        return;
      }
    }
    if(FileSizeError.geterror())
    alert("Filesize too large! Keep within 2mb");
    else if((+$scope.datedwhat < +$scope.dated && +$scope.datemwhat<= +$scope.datem && +$scope.dateywhat <= +$scope.datey)||(+$scope.datemwhat< +$scope.datem && +$scope.dateywhat <= +$scope.datey)||(+$scope.dateywhat<+$scope.datey)) {
      alert("Date of resolution must be greater than or equal to date of escalation reported")
    }
    else {
      validate_ticketno(function() {
        $http({
          url: '/validateuser',
          method: 'post',
          data: {userid: $scope.escalationform.appreciated_user}
        }).then(function(data) {
          if(data.data.validation) {
            $scope.escalationform.filename=FileName.getname();
            $scope.escalationform.user=$scope.user;
            $scope.escalationform.date = $scope.datey + "-" + $scope.datem + "-" + $scope.dated;
            $scope.escalationform.dateissue = $scope.dateywhat + "-" + $scope.datemwhat + "-" + $scope.datedwhat;
            var temp = $scope.escalationform;
            uploadAPI.upload($scope.myFile).then(function(data) {
              temp.downloadlink = data.data.link;
              $http({
                url: '/post_escalationform_lead',
                method: 'post',
                data: temp
              }).then(function(data) {
                socket.emit('newform', {type: 'escalation', data: data.data});
                $scope.escalationform = {}
                $scope.messagee = "ESCALATION ADDED SUCCESSFULLY";
                //$scope.openAlert("ESCALATION ADDED SUCCESSFULLY")
              }, function(err) {
                $scope.messagee = "";
                $scope.openAlert("ESCALATION ALREADY EXISTS");
              })
            }, function(err) {})
            $scope.escalationform = {}
          }
          else {
            alert("Invalid escalated user")
          }
        }, function(err){});
      })
    }
  }

  $scope.setformstatus = function(item, type) {
    $http({
      url: '/update_formstatus_' + type,
      method: 'post',
      data: item
    }).then(function(data) {
      socket.emit('statuschange_'+type, data.data);
    }, function(err) {});
  }

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


  socket.on('notification_edit', function(data) {
    if($scope.myteams.indexOf(data.data.team)!=-1) {
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
        else if(data.type=='escalation') {
          $scope.escalation_data.feed = $scope.escalation_data.feed.filter(function(item) {
            return item._id != data.data._id;
          })
          $scope.escalation_data.feed.push(data.data);
        }
        else {
          // cannot happen xD
        }
      });
    }
    if(data.data.user==$scope.user) {
      $scope.$apply(function() {
        var current = {}
        if(data.type=='ticket') {
          current = $scope.ticket_data;
        }
        else if (data.type=='nonticket') {
          current = $scope.nonticket_data;
        }
        else if (data.type=='other') {
          current = $scope.other_data;
        }
        else {
          current = $scope.escalation_data;
        }
        current.mine = current.mine.filter(function(item) {
          return item._id != data.data._id;
        })
        current.mine.push(data.data);
      })
    }
  });


  socket.on('notification', function(data) {
    if($scope.myteams.indexOf(data.data.team)!=-1) {
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
        else if(data.type=='escalation') {
          $scope.escalation_data.feed.push(data.data);
        }
      });
    }
    if(data.data.user==$scope.user) {
      $scope.$apply(function() {
        var current = {}
        if(data.type=='ticket') {
          current = $scope.ticket_data;
        }
        else if (data.type=='nonticket') {
          current = $scope.nonticket_data;
        }
        else if (data.type=='other') {
          current = $scope.other_data;
        }
        else {
          current = $scope.escalation_data;
        }
        current.mine = current.mine.filter(function(item) {
          return item._id != data.data._id;
        })
        current.mine.push(data.data);
      })
    }
  });


  socket.on('statuschange_ticket', function(data) {
    $scope.$apply(function() {
      if($scope.myteams.indexOf(data.data.team)!=-1) {
        $scope.ticket_data.feed = $scope.ticket_data.feed.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.ticket_data.feed.push(data.data);
        $scope.ticket_data.zero = $scope.ticket_data.zero.filter(function(item) {
          return item._id != data.data._id;
        })
        if(data.data.status==1) {
          $scope.ticket_data.one.push(data.data);
          $scope.ticket_dashboard.push(data.data);
        }
        else {
          $scope.ticket_data.one.push(data.data);
        }
      }
      if(data.data.user==$scope.user) {
        $scope.ticket_data.mine = $scope.ticket_data.mine.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.ticket_data.mine.push(data.data)
      }
      if(data.data.appreciated_user==$scope.user  && item.status==1 && ($scope.myteams.indexOf(data.data.team)==-1)) {
        $scope.ticket_data.myappreciated.push(data.data);
      }
    });
  });

  socket.on('statuschange_nonticket', function(data) {
    $scope.$apply(function() {
      if($scope.myteams.indexOf(data.data.team)!=-1) {
        $scope.nonticket_data.feed = $scope.nonticket_data.feed.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.nonticket_data.feed.push(data.data);
        $scope.nonticket_data.zero = $scope.nonticket_data.zero.filter(function(item) {
          return item._id != data.data._id;
        })
        if(data.data.status==1) {
          $scope.nonticket_data.one.push(data.data);
          $scope.nonticket_dashboard.push(data.data);
        }
        else {
          $scope.nonticket_data.one.push(data.data);
        }
      }
      if(data.data.user==$scope.user) {
        $scope.nonticket_data.mine = $scope.nonticket_data.mine.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.nonticket_data.mine.push(data.data)
      }
      if(data.data.appreciated_user==$scope.user  && item.status==1 && ($scope.myteams.indexOf(data.data.team)==-1)) {
        $scope.nonticket_data.myappreciated.push(data.data);
      }
    });
  });

  socket.on('statuschange_other', function(data) {
    $scope.$apply(function() {
      if($scope.myteams.indexOf(data.data.team)!=-1) {
        $scope.other_data.feed = $scope.other_data.feed.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.other_data.feed.push(data.data);
        $scope.other_data.zero = $scope.other_data.zero.filter(function(item) {
          return item._id != data.data._id;
        })
        if(data.data.status==1) {
          $scope.other_data.one.push(data.data);
          $scope.other_dashboard.push(data.data);
        }
        else {
          $scope.other_data.one.push(data.data);
        }
      }
      if(data.data.user==$scope.user) {
        $scope.other_data.mine = $scope.other_data.mine.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.other_data.mine.push(data.data)
      }
      if(data.data.appreciated_user==$scope.user  && item.status==1 && ($scope.myteams.indexOf(data.data.team)==-1)) {
        $scope.other_data.myappreciated.push(data.data);
      }
    });
  });


  $scope.$watch('ticketform.client', function() {
    $scope.formticketList = $scope.tickets.filter(function(item) {
      return item.client==$scope.ticketform.client;
    });
  });
  $scope.$watch('modalitem.client', function() {
    $scope.formticketList = $scope.tickets.filter(function(item) {
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
    else {
      $scope.modalitem.ticketCategory = null;
      $scope.modalitem.severity = null;
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
    if($scope.modalitem && $scope.modalitem.ticketno) {
      var test = $scope.tickets.filter(function(item) {
        return item.ticketno==$scope.modalitem.ticketno;
      });
      if(test[0].severity && test[0].severity != $scope.modalitem.severity) {
        $scope.modalitem.severity = test[0].severity;
      }
    }
  })



  $scope.$watch('escalationform.client', function() {
    $scope.escticketList = $scope.tickets.filter(function(item) {
      return item.client==$scope.escalationform.client;
    });
  });
  $scope.$watch('escalationform.ticketno', function() {
    var test = $scope.tickets.filter(function(item) {
      return item.ticketno==$scope.escalationform.ticketno;
    });
    if(test[0]) {
      $scope.escalationform.ticketCategory = test[0].category?test[0].category:"NONE";
      $scope.escalationform.severity = test[0].category?test[0].severity:'';
    }
    else {
      $scope.escalationform.ticketCategory = null;
      $scope.escalationform.severity = null;
    }
  });

  $scope.$watch('escalationform.severity', function() {
    if($scope.escalationform.ticketno) {
      var test = $scope.tickets.filter(function(item) {
        return item.ticketno==$scope.escalationform.ticketno;
      });
      if(test[0].severity && test[0].severity != $scope.escalationform.severity) {
        $scope.escalationform.severity = test[0].severity;
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

    if((+$scope.datedwhat < +$scope.dated && +$scope.datemwhat<= +$scope.datem && +$scope.dateywhat <= +$scope.datey)||(+$scope.datemwhat< +$scope.datem && +$scope.dateywhat <= +$scope.datey)||(+$scope.dateywhat<+$scope.datey)) {
      $scope.datedwhat = $scope.dated;
      $scope.datemwhat = $scope.datem;
      $scope.dateywhat = $scope.datey;
    }
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

    if((+$scope.datedwhat < +$scope.dated && +$scope.datemwhat<= +$scope.datem && +$scope.dateywhat <= +$scope.datey)||(+$scope.datemwhat< +$scope.datem && +$scope.dateywhat <= +$scope.datey)||(+$scope.dateywhat<+$scope.datey)) {
      $scope.datedwhat = $scope.dated;
      $scope.datemwhat = $scope.datem;
      $scope.dateywhat = $scope.datey;
    }
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


    if((+$scope.datedwhat < +$scope.dated && +$scope.datemwhat<= +$scope.datem && +$scope.dateywhat <= +$scope.datey)||(+$scope.datemwhat< +$scope.datem && +$scope.dateywhat <= +$scope.datey)||(+$scope.dateywhat<+$scope.datey)) {
      $scope.datedwhat = $scope.dated;
      $scope.datemwhat = $scope.datem;
      $scope.dateywhat = $scope.datey;
    }
  })

  /*change and get busted*/

  $scope.$watch('datedwhat', function() {
    if($scope.datemwhat==2&&$scope.datedwhat>29)
    $scope.datedwhat="28"
    else if($scope.datemwhat==2&&$scope.datedwhat==29&&$scope.dateywhat&&$scope.dateywhat%4 !=0)
    $scope.datedwhat="28"
    else if($scope.datedwhat>$scope.numdays[$scope.datedwhat])
    $scope.datedwhat="1"
    else {}
    if($scope.dateywhat&&$scope.dateywhat>$scope.today_year)
    $scope.dateywhat = $scope.today_year.toString();
    if($scope.dateywhat&&$scope.datemwhat&&$scope.dateywhat>=$scope.today_year&&$scope.datemwhat>$scope.today_month)
    $scope.datemwhat = $scope.today_month.toString();
    if($scope.dateywhat&&$scope.datemwhat&&$scope.datedwhat&&$scope.dateywhat>=$scope.today_year&&$scope.datemwhat>=$scope.today_month&&$scope.datedwhat>$scope.today_day)
    $scope.datedwhat = $scope.today_day.toString();
    if($scope.datedwhat.length==1) $scope.datedwhat = "0" + $scope.datedwhat;
    if($scope.datemwhat.length==1) $scope.datemwhat = "0" + $scope.datemwhat;
  })

  $scope.$watch('datemwhat', function() {
    if($scope.datemwhat==2&&$scope.datedwhat>29)
    $scope.datedwhat="28"
    else if($scope.datemwhat==2&&$scope.datedwhat==29&&$scope.dateywhat&&$scope.dateywhat%4 !=0)
    $scope.datedwhat="28"
    else if($scope.datedwhat>$scope.numdays[$scope.datemwhat])
    $scope.datedwhat="1"
    else {}
    if($scope.dateywhat&&$scope.dateywhat>$scope.today_year)
    $scope.dateywhat = $scope.today_year.toString();
    if($scope.dateywhat&&$scope.datemwhat&&$scope.dateywhat>=$scope.today_year&&$scope.datemwhat>$scope.today_month)
    $scope.datemwhat = $scope.today_month.toString();
    if($scope.dateywhat&&$scope.datemwhat&&$scope.datedwhat&&$scope.dateywhat>=$scope.today_year&&$scope.datemwhat>=$scope.today_month&&$scope.datedwhat>$scope.today_day)
    $scope.datedwhat = $scope.today_day.toString();
    if($scope.datedwhat.length==1) $scope.datedwhat = "0" + $scope.datedwhat;
    if($scope.datemwhat.length==1) $scope.datemwhat = "0" + $scope.datemwhat;
  })

  $scope.$watch('dateywhat', function() {
    if($scope.dateywhat&&$scope.dateywhat>$scope.today_year)
    $scope.dateywhat = $scope.today_year.toString();
    if($scope.dateywhat&&$scope.datemwhat&&$scope.dateywhat>=$scope.today_year&&$scope.datemwhat>$scope.today_month)
    $scope.datemwhat = $scope.today_month.toString();
    if($scope.dateywhat&&$scope.datemwhat&&$scope.datedwhat&&$scope.dateywhat>=$scope.today_year&&$scope.datemwhat>=$scope.today_month&&$scope.datedwhat>$scope.today_day)
    $scope.datedwhat = $scope.today_day.toString();
    if($scope.datedwhat.length==1) $scope.datedwhat = "0" + $scope.datedwhat;
    if($scope.datemwhat.length==1) $scope.datemwhat = "0" + $scope.datemwhat;

  })

  /*change and get busted! end*/


  socket.on('duderefresh', function(data) {
    $scope.$apply(function() {
      $scope.refresh = "Refresh page to get new updates!"
    })
  })

  $scope.gotoadmin = function() {
    if($scope.userlevel=='admin') {
      $location.path('/dashboard_admin').replace();
    }
    else {
      alert("You don't have access!")
    }
  }


  //resubmit

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
            //socket.emit('newform', data.data);
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
              $scope.openAlert("APPRECIATION UPDATED")
            }, function(err) {
              alert("APPRECIATION ALREADY EXISTS!!");
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
        alert("Invalid ticket number for given client!3")
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
                $scope.openAlert("APPRECIATION UPDATED")
              }, function(err) {
                alert("APPRECIATION ALREADY EXISTS!");
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
          socket.emit('newform', {type: 'other', data: data.data})
          $scope.other = {}
          //$scope.openAlert("APPRECIATION SENT FOR APPROVAL")
          $scope.messageo = "APPRECIATION SENT FOR APPROVAL";
        }, function(err){
          $scope.messageo = "";
          $scope.other = {};
          $scope.openAlert("APPRECIATION ALREADY EXISTS");
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
          $scope.openAlert("APPRECIATION UPDATED")
        }, function(err){
          $scope.openAlert("Refresh to update the changes and retry");
        })
      }
    }, function(err){})
  }

  //date stabilizer
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

  //date stabilizer
  $scope.$watch('testdate.day_res', function() {
    if($scope.testdate.month_res==2&&$scope.testdate.day_res>29)
    $scope.testdate.day_res="28"
    else if($scope.testdate.month_res==2&&$scope.testdate.day_res==29&&$scope.testdate.year_res&&$scope.testdate.year_res%4 !=0)
    $scope.testdate.day_res="28"
    else if($scope.testdate.day_res>$scope.numdays[$scope.testdate.day_res])
    $scope.testdate.day_res="1"
    else {}
    if($scope.testdate.year_res&&$scope.testdate.year_res>$scope.today_year)
    $scope.testdate.year_res = $scope.today_year.toString();
    if($scope.testdate.year_res&&$scope.testdate.month_res&&$scope.testdate.year_res>=$scope.today_year&&$scope.testdate.month_res>$scope.today_month)
    $scope.testdate.month_res = $scope.today_month.toString();
    if($scope.testdate.year_res&&$scope.testdate.month_res&&$scope.testdate.day_res&&$scope.testdate.year_res>=$scope.today_year&&$scope.testdate.month_res>=$scope.today_month&&$scope.testdate.day_res>$scope.today_day)
    $scope.testdate.day_res = $scope.today_day.toString();
    if($scope.testdate.day_res.length==1) $scope.testdate.day_res = "0" + $scope.testdate.day_res;
    if($scope.testdate.month_res.length==1) $scope.testdate.month_res = "0" + $scope.testdate.month_res;

  })

  $scope.$watch('testdate.month_res', function() {
    if($scope.testdate.month_res==2&&$scope.testdate.day_res>29)
    $scope.testdate.day_res="28"
    else if($scope.testdate.month_res==2&&$scope.testdate.day_res==29&&$scope.testdate.year_res&&$scope.testdate.year_res%4 !=0)
    $scope.testdate.day_res="28"
    else if($scope.testdate.day_res>$scope.numdays[$scope.testdate.month_res])
    $scope.testdate.day_res="1"
    else {}
    if($scope.testdate.year_res&&$scope.testdate.year_res>$scope.today_year)
    $scope.testdate.year_res = $scope.today_year.toString();
    if($scope.testdate.year_res&&$scope.testdate.month_res&&$scope.testdate.year_res>=$scope.today_year&&$scope.testdate.month_res>$scope.today_month)
    $scope.testdate.month_res = $scope.today_month.toString();
    if($scope.testdate.year_res&&$scope.testdate.month_res&&$scope.testdate.day_res&&$scope.testdate.year_res>=$scope.today_year&&$scope.testdate.month_res>=$scope.today_month&&$scope.testdate.day_res>$scope.today_day)
    $scope.testdate.day_res = $scope.today_day.toString();
    if($scope.testdate.day_res.length==1) $scope.testdate.day_res = "0" + $scope.testdate.day_res;
    if($scope.testdate.month_res.length==1) $scope.testdate.month_res = "0" + $scope.testdate.month_res;

  })

  $scope.$watch('testdate.year_res', function() {
    if($scope.testdate.year_res&&$scope.testdate.year_res>$scope.today_year)
    $scope.testdate.year_res = $scope.today_year.toString();
    if($scope.testdate.year_res&&$scope.testdate.month_res&&$scope.testdate.year_res>=$scope.today_year&&$scope.testdate.month_res>$scope.today_month)
    $scope.testdate.month_res = $scope.today_month.toString();
    if($scope.testdate.year_res&&$scope.testdate.month_res&&$scope.testdate.day_res&&$scope.testdate.year_res>=$scope.today_year&&$scope.testdate.month_res>=$scope.today_month&&$scope.testdate.day_res>$scope.today_day)
    $scope.testdate.day_res = $scope.today_day.toString();
    if($scope.testdate.day_res.length==1) $scope.testdate.day_res = "0" + $scope.testdate.day_res;
    if($scope.testdate.month_res.length==1) $scope.testdate.month_res = "0" + $scope.testdate.month_res;

  })


  // escalation edit
  $scope.showescalationModalEdit = function(item) {
    $scope.testdate.year = item.date.split("-")[0]
    $scope.testdate.month = item.date.split("-")[1]
    $scope.testdate.day = item.date.split("-")[2]

    $scope.testdate.year_res = item.dateissue.split("-")[0]
    $scope.testdate.month_res = item.dateissue.split("-")[1]
    $scope.testdate.day_res = item.dateissue.split("-")[2]

    $scope.escalationModalEdit = true;
    $scope.modalitem = JSON.parse(JSON.stringify(item));
  }

  $scope.closeescalationModalEdit = function() {
    $scope.escalationModalEdit = false;
    $scope.modalitem = null;
  }

  $scope.resubmit_escalation = function(item, file) {
    var validate_ticketno = function(callback) {
      var list = $scope.tickets.filter(function(thisitem) {
        return (thisitem.client==item.client && thisitem.ticketno==item.ticketno)
      })
      if(!item.ticketno || list.length==1) {
        return callback();
      }
      else {
        alert("Invalid ticket number for given client!4")
        return;
      }
    }
    if((+$scope.testdate.day_res < +$scope.testdate.day && +$scope.testdate.month_res<= +$scope.testdate.month && +$scope.testdate.year_res <= +$scope.testdate.year)||(+$scope.testdate.month_res< +$scope.testdate.month && +$scope.testdate.year_res <= +$scope.testdate.year)||(+$scope.testdate.year_res<+$scope.testdate.year)) {
      alert("Date of resolution must be greater than or equal to date of escalation reported")
    }
    else {
      validate_ticketno(function() {
        $http({
          url: '/validateuser',
          method: 'post',
          data: {userid: item.appreciated_user}
        }).then(function(data) {
          if(data.data.validation) {
            $scope.escalationform.user=$scope.user;
            item.date =  $scope.testdate.year + "-" + $scope.testdate.month + "-" + $scope.testdate.day;
            item.dateissue = $scope.testdate.year_res + "-" + $scope.testdate.month_res + "-" + $scope.testdate.day_res;
            var temp = item;
            temp.edit = true;
            $http({
              url: '/post_escalationform_lead',
              method: 'post',
              data: temp
            }).then(function(data) {
              socket.emit('newform_edit', {type: 'escalation', data: data.data});
              $scope.openAlert("ESCALATION UPDATED")
            }, function(err) {
              $scope.openAlert("ESCALATION ALREADY EXISTS");
            })
            item = {}
          }
          else {
            alert("Invalid escalated user")
          }
        }, function(err){});
      });
    }
  }

  socket.on('update_delegate', function(data) {
    if(data.data.assignee==$scope.user) {
      $scope.$apply(function() {
        $scope.mydelegations = data.data;
        $scope.myteams = data.data.assigned;
        Subunits.query({userid: $scope.user}, function(result) {
          $scope.mysubunits = result;
        })
      })
    }
  })

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
        $scope.nonticket_data.mine = $scope.nonticket_data.mine.filter(function(item) {
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
        $scope.ticket_data.mine = $scope.ticket_data.mine.filter(function(item) {
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
        $scope.other_data.mine = $scope.other_data.mine.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.other_data.myappreciated = $scope.other_data.myappreciated.filter(function(item) {
          return item._id!=data.data.form._id;
        })
      }
      else if(data.data.type=='escalation') {
        $scope.escalation_data.zero = $scope.escalation_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.escalation_data.one = $scope.escalation_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.escalation_data.minusone = $scope.escalation_data.feed.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.escalation_data.mine = $scope.escalation_data.mine.filter(function(item) {
          return item._id!=data.data.form._id;
        })
        $scope.escalation_data.myappreciated = $scope.escalation_data.myappreciated.filter(function(item) {
          return item._id!=data.data.form._id;
        })
      }
      else {}
    })
  })


});
