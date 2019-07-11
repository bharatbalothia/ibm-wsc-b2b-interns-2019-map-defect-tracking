var app = angular.module("userApp");


app.controller("admindashboardController", function($rootScope, $interval, $window, $scope, $location, $resource, $route, $http, $window, $cookies, socket, uploadAPI, LoginStatus, importAPI) {
  showCheckboxes('normalcheck');

  $scope.config = {
    itemsPerPage: 5,
    fillLastPage: "yes"
  }

  $scope.alertMessage = ''
  $scope.feedticket = []
  $scope.feednonticket = []
  $scope.feed_defect =[]
  $scope.feedescalation = []
  $scope.feeddefect =[]
  $scope.feedother = []
  $scope.fusers = []
  $scope.fuserlist = []
  $scope.master = []
  $scope.invalidticket = []
  $scope.invalidnonticket = []
  $scope.invalidesc = []
  $scope.functionalteams = []
  $scope.assignment = "";
  $scope.delegationmessage="";
  $scope.showImportModal = false;
  var FUsers = $resource('/getfusers')
  var Feed = $resource('/adminfeed')
  var Feedparature = $resource('/adminparature')
  var Master = $resource('/api/getclients')
  var Invalid = $resource('/api/invalid')
  var Missing = $resource('/api/missing')
  var PastImport = $resource('/whathappened')
  var ListDelegates = $resource('/listdelegates')
  var FunctionalTeams = $resource('/get_functionalteams');


  Feedparature.query(function(result) {
    $scope.paraturefeed = JSON.parse(result[0]);
  });

  Invalid.query(function(result) {
    $scope.invalidticket = JSON.parse(result[0]);
    $scope.invalidnonticket = JSON.parse(result[1]);
    $scope.invalidother = JSON.parse(result[2]);
    $scope.invalidesc = JSON.parse(result[3]);
    $scope.invalidparachute = JSON.parse(result[4]);
  });

  Missing.query({"user": $cookies.get('dash_userid')}, function(result) {
    $scope.missingticket = JSON.parse(result[0]);
    $scope.missingnonticket = JSON.parse(result[1]);
    $scope.missingother = JSON.parse(result[2]);
    $scope.missingesc = JSON.parse(result[3]);
    $scope.missingparachute = JSON.parse(result[4]);
  });


  Feed.query(function(result) {
    $scope.feedticket = JSON.parse(result[0]);
    $scope.feednonticket = JSON.parse(result[1]);
    $scope.feedescalation = JSON.parse(result[2]);
    $scope.feedother = JSON.parse(result[3]);
  });

  FUsers.query(function(result) {
    $scope.fusers = result;
    for(var i=0;i<result.length;i++)
    $scope.fuserlist.push(result[i].userid);
  });

  Master.query(function(result) {
    for(var i=0;i<result.length;i++) {
      if($scope.master.indexOf(result[i])==-1) $scope.master.push(result[i]);
    }
  })

  PastImport.query({"user": $cookies.get('dash_userid')}, function(result) {
    $scope.tntimports = (parseInt(result[0])>0?parseInt(result[0]):0);
    $scope.escimports = (parseInt(result[1])>0?parseInt(result[1]):0);
    $scope.otherimports = (parseInt(result[2])>0?parseInt(result[2]):0);
    $scope.failedtntimports = (parseInt(result[3])>0?parseInt(result[3]):0);
    $scope.failedescimports = (parseInt(result[4])>0?parseInt(result[4]):0);
    $scope.failedotherimports = (parseInt(result[5])>0?parseInt(result[5]):0);
    $scope.importstat = (parseInt(result[6])>0?parseInt(result[6]):0);
    $scope.import_datetime = result[7];
    $scope.import_filename = result[8];
    $scope.parachuteimports = (parseInt(result[9])>0?parseInt(result[9]):0);
    $scope.failedparachuteimports = (parseInt(result[10])>0?parseInt(result[10]):0);
    $scope.duptntform = (parseInt(result[11])>0?parseInt(result[11]):0);
    $scope.dupescform = (parseInt(result[12])>0?parseInt(result[12]):0);
    $scope.dupother = (parseInt(result[13])>0?parseInt(result[13]):0);
    $scope.dupparature = (parseInt(result[14])>0?parseInt(result[14]):0);
    if($scope.tntimports||$scope.escimports||$scope.failedescimports||$scope.failedtntimports||$scope.otherimports||$scope.failedotherimports||$scope.parachuteimports||$scope.failedparachuteimports)
    $scope.open();
    else if($scope.importstat==1){
      $scope.open();
      alert("Success");
    }
    else {}
  })

  ListDelegates.query(function(result) {
    $scope.delegate_managers = result.filter(function(item) {
      return item.status=="manager";
    });;
    $scope.delegate_users = result.filter(function(item) {
      return item.status=="user";
    });
  })

  FunctionalTeams.query(function(result) {
    $scope.functionalteams = result;
  })

  $scope.cancel = function() {
    $scope.showImportModal = false;
  };

  $scope.open = function() {
    $scope.showImportModal = true;
  };

  $scope.openAlert = function(val) {
    $scope.alertMessage = val;
    $scope.alertModal = true;
  }

  $scope.closeAlert = function() {
    $scope.alertModal = false;
    $scope.alertMessage = '';
  }


  $scope.reportmsg = ""
  $scope.login_status = $cookies.get('dash_loggedin')
  $scope.user = $cookies.get('dash_userid')
  $scope.loginname = $cookies.get('name')


  



  socket.on('notification', function(data) {
    $scope.$apply(function() {
      if(data.data.ticketno&&data.data.status==1)
      $scope.feedticket.push(data.data);
      else if(data.data.status==1)
      $scope.feednonticket.push(data.data);
      else {}
    });
  });

  socket.on('notification_esc', function(data) {
    $scope.$apply(function() {
      $scope.feedescalation.push(data.data);
    });
  })

  $scope.logout = function() {
    $http({
      url: '/logout',
      method: 'post',
      data: {"user": $scope.user}
    }).then(function(data){
      $cookies.remove('dash_userid')
      $cookies.remove('dash_group')
      $cookies.remove('dash_loggedin')
      $location.path('/login').replace();
    }, function(err){})
  }




socket.on('defectlog', function(data) {
      $scope.feed_defect.push(data.defectlogs);
    
    });
  });


  $scope.nonticket = function() {
    $http({
      url: '/export_nonticket',
      method: 'get'
    }).then(function(data) {
      window.location = '/exportfile.xlsx'
    }, function(err){});
  }

  $scope.ticket = function() {
    $http({
      url: '/export_ticket',
      method: 'get'
    }).then(function(data) {
      window.location = '/exportfile.xlsx'
    }, function(err){});
  }

  $scope.other = function() {
    $http({
      url: '/export_other',
      method: 'get'
    }).then(function(data) {
      window.location = '/exportfile.xlsx'
    }, function(err){});
  }


  $scope.escalation = function() {
    $http({
      url: '/export_escalation',
      method: 'get'
    }).then(function(data) {
      window.location = '/exportfile.xlsx'
    }, function(err){});
  }

  $scope.paratureexport = function() {
    $http({
      url: '/export_parature',
      method: 'get'
    }).then(function(data) {
      window.location = '/exportfile.xlsx'
    }, function(err){});
  }

  $scope.importticketform = function() {
    importAPI.uploadticketform($scope.myFile).then(function(data) {
      socket.emit('duderefresh', null);
      $route.reload()
    }, function(data) {});
  }


  $scope.importnonticketform = function() {
    importAPI.uploadnonticketform($scope.myFile).then(function(data) {
      socket.emit('duderefresh', null);
      $route.reload()
    }, function(data) {});
  }


  $scope.importesc = function() {
    importAPI.uploadesc($scope.myFile).then(function(data) {
      socket.emit('duderefresh', null);
      $route.reload()
    }, function(err) {})
  }

  $scope.importother = function() {
    importAPI.uploadother($scope.myFile).then(function(data) {
      socket.emit('duderefresh', null);
      $route.reload()
    }, function(err) {})
  }

  $scope.importparachute = function() {
    importAPI.uploadparachute($scope.myFile).then(function(data) {
      socket.emit('duderefresh', null);
      $route.reload()
    }, function(err) {})
  }


  $scope.gettemplate_ticket = function() {
    window.location = '/templates/import_client_request.xlsx'
  }


  $scope.gettemplate_nonticket = function() {
    window.location = '/templates/import_project.xlsx'
  }


  $scope.gettemplate_esc = function() {
    window.location = '/templates/import_escalation.xlsx'
  }

  $scope.gettemplate_other = function() {
    window.location = '/templates/import_other.xlsx'
  }

  $scope.gettemplate_parachute = function() {
    window.location = '/templates/import_parature.xlsx'
  }

  $scope.forbiduser = function(fuid) {
    if($scope.fuserlist.indexOf(fuid)==-1) {
      $http({
        url: '/forbiduser',
        data: {"userid": fuid},
        method: 'post'
      }).then(function(data) {
        $scope.fuserlist.push(data.data.userid);
        $scope.fusers.push(data.data);
      }, function(err) {});
    }
  }

  $scope.openAlert = function(val) {
    $scope.alertMessage = val;
    $scope.alertModal = true;
  }

  $scope.closeAlert = function() {
    $scope.alertModal = false;
    $scope.alertMessage = '';
  }

  $scope.post_parature = function(parature) {
    $http({
      url: '/validateuser',
      method: 'post',
      data: {"userid": $scope.parature.intranet_id}
    }).then(function(data){
      if(data.data.validation) {
        $http({
          url: '/add_parature',
          method: 'post',
          data: parature
        }).then(function(data) {
          $scope.paraturefeed.push(data.data)
          $scope.parature = {}
          $scope.message = "Added Successfully";
          //socket.emit('addition_parature', data);

        }, function(err){
          $scope.message = "";
          $scope.parature = {};
          $scope.openAlert("PARATURE NAME ALREADY EXISTS");
        });
      }
      else {
        alert("INVALID IBM INTRANET ID");
      }
    },function(err){});
  }




  $scope.deleteparature = function(item) {
    $http({
      url: '/delete_paratureitem',
      method: 'post',
      data: item
    }).then(function(data){
      socket.emit('delete_parature', data.data);

    }, function(err){});
  }

  $scope.deleteinvalid = function(item) {
      $http({
        url: '/delete_invalid',
        method: 'post',
        data: item
      }).then(function(data){
        socket.emit('delete_invalid', data.data);

      }, function(err){});
    }

  $scope.activateuser = function(fuser) {
    $http({
      url: '/activateuser',
      data: fuser,
      method: 'post'
    }).then(function(data) {
      $scope.fusers = $scope.fusers.filter(function(item) {
        return item.userid != fuser.userid;
      })
    }, function(err) {});
  }

  $scope.gotocrmm = function() {
    if($cookies.get('dash_group')=='admin') {
      $location.path('/dashboard_crmm').replace();
    }
    else {
      alert("You don't have access!")
    }
  }

  $scope.updateclient = function(item, form) {
    var updated_id = item._id;
    var item = JSON.parse(JSON.stringify(item))
    if(item.newclient) {
      item.form.client = item.newclient;
      if(item)
      $http({
        url:  '/update' + form,
        method: 'post',
        data: item
      }).then(function(data){
        $scope.reportmsg = 'Refresh page to see new changes!'
        if(form=='ticket') {
          $scope.invalidticket = $scope.invalidticket.filter(function(newitem) {
            return newitem._id != updated_id;
          });
          socket.emit('newform', {type: 'ticket', data: data.data});
        }
        else if (form=='nonticket') {
          $scope.invalidnonticket = $scope.invalidnonticket.filter(function(newitem){
            return newitem._id != updated_id;
          });
          socket.emit('newform', {type: 'nonticket', data: data.data});
        }
        else {
          $scope.invalidesc = $scope.invalidesc.filter(function(newitem){
            return newitem._id != updated_id;
          });
          socket.emit('newform', {type: 'escalation', data: data.data});
        }
      }, function(err){
        alert("DUPLICATE ENTRY!")
      })
    }
  }

  socket.on('duderefresh', function(data) {
  })

  $scope.gotolead = function() {
    $location.path('/dashboard_lead').replace();
  }

  $scope.delegate_team = function(assignee, delegated_set) {
    var rootassigned = []
    var assigned = []
    $scope.functionalteams.forEach(function(item) {
      if(!!item.selected)
        assigned.push(item.name);
      item.selected = false;
      rootassigned.push(item.name) // root assigned
    });
    if(!assigned.length) {
      alert("Delegate atleast one team!")
      return;
    }
    $http({
      method: 'post',
      data: {"assignee": assignee, "assigned": assigned, "status": "manager", "delegatedusers": [], "rootoptions": rootassigned},
      url: '/delegate'
    }).then(function(data){
      $scope.assignment = "ASSIGNED SUCCESSFULLY";
      $scope.currentSelection = {}
      $scope.assignee = ''
      socket.emit('new_delegate', data.data);
    }, function(err){
      $scope.assignment = "";
      alert(err.data.message)
    });
  }

  socket.on('new_delegate', function(data) {
    if(data.data.status=="user")
    $scope.delegate_users.push(data.data);
    else
    $scope.delegate_managers.push(data.data);
  })



  socket.on('update_delegate', function(data) {
    if(data.data.status=="user") {
      $scope.delegate_users = $scope.delegate_users.filter(function(item) {
        return item._id != data.data._id;
      })
      $scope.delegate_users.push(data.data);
    }
    else {
      $scope.delegate_managers = $scope.delegate_managers.filter(function(item) {
        return item._id != data.data._id;
      })
      $scope.delegate_managers.push(data.data);
    }
  })


  $scope.openEditDelegateModal = function(obj) {
    $scope.functionalteams_modal = JSON.parse(JSON.stringify($scope.functionalteams))
    if(obj.status=='manager') {
      obj.rootoptions = [];
      $scope.functionalteams.forEach(function(item) {
        obj.rootoptions.push(item.name)
      })
    }
    $scope.functionalteams_modal.forEach(function(item) {
      if(obj.assigned.indexOf(item.name)!=-1)
        item.selected = true;
      else
      item.selected = false;
    });
    $scope.editDelegate = obj
    $scope.showEditDelegateModal = true;
  }


  $scope.closeEditDelegateModal = function() {
    $scope.showEditDelegateModal = false;
    $scope.editDelegate = {}
    $scope.functionalteams_modal.forEach(function(item) {
      item.selected = false;
    });
  }

  $scope.openuserDelegateModal = function(obj) {
    $scope.functionalteams_modal = JSON.parse(JSON.stringify($scope.functionalteams))
    $scope.referDelegate = obj
    $scope.userDelegate = {}
    $scope.showuserDelegateModal = true;
  }


  $scope.closeuserDelegateModal = function() {
    $scope.showuserDelegateModal = false;
    $scope.referDelegate = {}
    $scope.userDelegate = {}
    $scope.functionalteams_modal.forEach(function(item) {
      item.selected = false;
    });
  }


  $scope.delegate_subassign = function(assignee, delegated_set, root) {
    var rootid = root.assignee;
    var assigned = []
    $scope.functionalteams_modal.forEach(function(item) {
      if(!!item.selected)
        assigned.push(item.name);
      item.selected = false;
    });
    if(!assigned.length) {
      alert("Delegate atleast one team!")
      return;
    }
    $http({
      method: 'post',
      data: {"assignee": assignee, "assigned": assigned, "manager": rootid, status: "user", "rootoptions": root.assigned},
      url: '/delegate'
    }).then(function(data){
      $http({
        url: '/delegate_subassign',
        method: 'post',
        data: {user: rootid, sub: assignee}
      }).then(function(data){
        socket.emit('update_delegate', data.data)
        $scope.openAlert("DELEGATED USER SUCCCESSFULLY");
      }, function(err){})
      socket.emit('new_delegate', data.data);
    }, function(err){
      $scope.delegationmessage="";
      $scope.assignee = ''
      alert(err.data.message)
    });
  }

  $scope.delegate_edit = function(assignee, delegated_set) {
    var assigned = []
    $scope.functionalteams_modal.forEach(function(item) {
      if(!!item.selected)
        assigned.push(item.name);
      item.selected = false;
    });
    if(!assigned.length) {
      alert("Delegate atleast one team!")
      return;
    }
    $http({
      method: 'post',
      data: {"assignee": assignee, "assigned": assigned},
      url: '/delegate_edit'
    }).then(function(data){
      socket.emit('update_delegate', data.data)
    }, function(err){
      alert(err.data.message)
    });
  }

  $scope.delegate_delete = function(item) {
    $http({
      method: 'post',
      url: '/delegate_delete',
      data: item
    }).then(function(data){
      socket.emit('delete_delegate', item);
      if(item.status=="user") {
        $http({
          url: '/delegate_detach',
          method: 'post',
          data: {manager: item.manager, delegateduser: item.assignee}
        }).then(function(data){
          socket.emit('update_delegate', data.data);
        }, function(err){})
      }
    }, function(err){});
  }

  socket.on('delete_delegate', function(data) {
    if(data.data.status=="manager")
    {
      $scope.delegate_managers = $scope.delegate_managers.filter(function(item) {
        return item._id != data.data._id;
      })
    }
    else if(data.data.status == "user")
    {
      $scope.delegate_users = $scope.delegate_users.filter(function(item) {
        return item._id != data.data._id;
      })
    }
  })

  socket.on('delete_parature', function(data){
    $scope.paraturefeed = $scope.paraturefeed.filter(function(item) {
      return item._id != data.data._id;
    })

  })

  //socket.on('addition_parature', function(data) {
  //  $scope.paraturefeed = $scope.paraturefeed.filter(function(item) {
  //  return item._id != data.data._id;
  //  })
  //})

  $scope.showDeleteModal = function(item, type) {
    $scope.DeleteModal = true;
    $scope.tempdelete = {type: type, item: item}
  }

  $scope.closeDeleteModal = function(item, type) {
    $scope.DeleteModal = false;
  }


  $scope.delete_form = function(form, type) {
    var data = {
      "type": type,
      "form": form
    }
    $http({
      url: '/delete_form',
      method: 'post',
      data: data
    }).then(function(data) {
      $scope.openAlert("Deleted Successfully");
      socket.emit('delete_form', data.data);
    }, function(err) {
      alert("Failed to delete");
    });
  }

  socket.on('delete_form', function(data) {
    $scope.$apply(function() {
      if(data.data.type=='ticket') {
        $scope.feedticket = $scope.feedticket.filter(function(item) {
          return item._id != data.data.form._id;
        })
      }
      else if(data.data.type=='nonticket') {
        $scope.feednonticket = $scope.feednonticket.filter(function(item) {
          return item._id != data.data.form._id;
        })
      }
      else if(data.data.type=='escalation') {
        $scope.feedescalation = $scope.feedescalation.filter(function(item) {
          return item._id != data.data.form._id;
        })
      }
      else if(data.data.type=='other') {
        $scope.feedother = $scope.feedother.filter(function(item) {
          return item._id != data.data.form._id;
        })
      }
      else {}
    });
  })

  socket.on('notification_edit', function(data) {
    $scope.$apply(function() {
      if(data.type=='ticket') {
        $scope.feedticket = $scope.feedticket.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.feedticket.push(data.data);
      }
      else if(data.type=='nonticket') {
        $scope.feednonticket = $scope.feednonticket.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.feednonticket.push(data.data);
      }
      else if(data.type=='escalation') {
        $scope.feedescalation = $scope.feedescalation.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.feedescalation.push(data.data);
      }
      else {
        $scope.feedother = $scope.feedother.filter(function(item) {
          return item._id != data.data._id;
        })
        $scope.feedother.push(data.data);
      }
    })
  })

  socket.on('notification', function(data) {
    $scope.$apply(function() {
      if(data.type=='ticket') {
        $scope.feedticket.push(data.data);
      }
      else if(data.type=='nonticket') {
        $scope.feednonticket.push(data.data);
      }
      else if(data.type=='escalation') {
        $scope.feedescalation.push(data.data);
      }
      else {
        $scope.feedother.push(data.data);
      }
    })
  })

  socket.on('statuschange_ticket', function(data) {
    $scope.$apply(function(){
      $scope.feedticket = $scope.feedticket.filter(function(item) {
        return item._id != data.data._id;
      })
      $scope.feedticket.push(data.data);
    })
  })

  socket.on('statuschange_nonticket', function(data) {
    $scope.$apply(function(){
      $scope.feednonticket = $scope.feednonticket.filter(function(item) {
        return item._id != data.data._id;
      })
      $scope.feednonticket.push(data.data);
    })
  })

  socket.on('statuschange_other', function(data) {
    $scope.$apply(function(){
      $scope.feedother = $scope.feedother.filter(function(item) {
        return item._id != data.data._id;
      })
      $scope.feedother.push(data.data);
    })
  })
   $scope.fteamsuccess="";
  $scope.add_functionalteam = function(data) {
    data._id = data.name
    $http({
      url: '/add_functionalteam',
      method: 'post',
      data: data
    }).then(function(data) {
      $scope.fteamsuccess="FUNCTIONAL TEAM ADDED SUCCESSFULLY";
      $scope.newteam = {}
      socket.emit('new_team', data.data);
    }, function(err) {
      $scope.fteamsuccess="";
      $scope.openAlert("FUNCTIONAL TEAM ALREADY EXISTS")
    })
  }

  $scope.delete_functionalteam = function(data) {
    $http({
      url: '/delete_functionalteam',
      method: 'post',
      data: data
    }).then(function(data) {
      $scope.openAlert("DELETED SUCCESSFULLY")
      socket.emit('delete_team', data.data);
    }, function(err) {
      $scope.openAlert("FAILED TO DELETE")
    })
  }

  socket.on('new_team', function(data) {
    $scope.$apply(function() {
      $scope.functionalteams.push(data.data);
    })
  })

  socket.on('delete_team', function(data) {
    $scope.$apply(function() {
      $scope.functionalteams = $scope.functionalteams.filter(function(item) {
        return item._id != data.data._id;
      })
    })
  })

  socket.on('delete_invalid', function(data) {
    $scope.$apply(function() {
      $scope.invalidticket = $scope.invalidticket.filter(function(newitem) {
        return newitem._id != data.data._id;
      });
      $scope.invalidnonticket = $scope.invalidnonticket.filter(function(newitem){
        return newitem._id != data.data._id;
      });
      $scope.invalidesc = $scope.invalidesc.filter(function(newitem){
        return newitem._id != data.data._id;
      });

      })
    })

});
