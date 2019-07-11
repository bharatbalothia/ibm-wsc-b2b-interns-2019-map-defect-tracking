var app = angular.module("userApp", ['ngResource', 'ngRoute', 'ngCookies' , 'ui.bootstrap.modal', 'ngIdle', 'angular-table']);

app.directive('fileModel', ['$parse', 'FileSizeError', 'FileName', function ($parse, FileSizeError, FileName) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      var model = $parse(attrs.fileModel);
      var modelSetter = model.assign;
      var maxsize = 2000000;
      element.bind('change', function(){
        scope.$apply(function(){
          FileName.setname(element[0].files[0].name);
          modelSetter(scope, element[0].files[0]);
          var filesize = element[0].files[0].size;
          if(filesize>maxsize)
          FileSizeError.seterror(true)
          else
          FileSizeError.seterror(false)
        });
      });
    }
  };
}]);

app.factory('FileName', function() {
  var file = {
    name: null
  }
  return {
    getname: function() {
      return file.name;
    },
    setname: function(val) {
      file.name = val
    }
  }
})


app.factory('FileSizeError', function() {
  var whatsup = {
    error: false
  }
  return {
    geterror: function() {
      return whatsup.error;
    },
    seterror: function(val) {
      whatsup.error = val;
    }
  }
});

app.service('uploadAPI', function($http) {
  return {
    upload: function(file) {
      if(file==null) {
        return $http({
          url: '/junk',
          method: 'post'
        });
      }
      var formData = new FormData();
      formData.append("file", file);
      return $http({
        url: '/addfile',
        data: formData,
        method: 'post',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });
    }
  }
});

app.service('importAPI', function($http, $cookies, LoginStatus, FileName) {
  return {
    uploadticketform: function(file) {
      var formData = new FormData();
      var today = new Date();
      var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      formData.append("file", file);
      formData.append("user", $cookies.get('dash_userid'));
      formData.append("filename", FileName.getname());
      formData.append("datetime", dateTime);
      return $http({
        url: '/importticketform',
        data: formData,
        method: 'post',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });
    },
    uploadnonticketform: function(file) {
      var formData = new FormData();
      var today = new Date();
      var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      formData.append("file", file);
      formData.append("user", $cookies.get('dash_userid'));
      formData.append("filename", FileName.getname());
      formData.append("datetime", dateTime);
      return $http({
        url: '/importnonticketform',
        data: formData,
        method: 'post',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });
    },
    uploadesc: function(file) {
      var formData = new FormData();
      var today = new Date();
      var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      formData.append("file", file);
      formData.append("user", $cookies.get('dash_userid'));
      formData.append("filename", FileName.getname());
      formData.append("datetime", dateTime);
      return $http({
        url: '/importesc',
        data: formData,
        method: 'post',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });
    },
    uploadother: function(file) {
      var formData = new FormData();
      var today = new Date();
      var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      formData.append("file", file);
      formData.append("user", $cookies.get('dash_userid'));
      formData.append("filename", FileName.getname());
      formData.append("datetime", dateTime);
      return $http({
        url: '/importother',
        data: formData,
        method: 'post',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });
    },
    uploadcrmm: function(file) {
      var formData = new FormData();
      formData.append("file", file);
      formData.append("user", $cookies.get('dash_userid'));
      return $http({
        url: '/uploadcrmm',
        data: formData,
        method: 'post',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });
    },
    uploadparachute: function(file) {
      var formData = new FormData();
      var today = new Date();
      var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      formData.append("file", file);
      formData.append("user", $cookies.get('dash_userid'));
      formData.append("filename", FileName.getname());
      formData.append("datetime", dateTime);
      return $http({
        url: '/importparachute',
        data: formData,
        method: 'post',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      });
    }
  }
});


app.factory('LoginStatus', function() {
  var user = {
    login: false,
    userid: null,
    group: null
  }
  return {
    setstatus: function(val, id, grp) {
      user.login = val;
      user.userid = id;
      user.group = grp;
    },
    getstatus: function() {
      return user.login;
    },
    getuserid: function() {
      return user.userid;
    },
    getgroup: function() {
      return user.group;
    }
  }
});


app.factory('socket', function($rootScope) {
  var socket = io.connect();
  return {
    on: function(eventName, callback){
      socket.on(eventName, callback);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
    }
  };
});


app.config(function($routeProvider) {
  $routeProvider
  .when('/login', {
    resolve: {
      "check": function($location, $cookies, LoginStatus) {
        if($cookies.get('dash_loggedin')) {
          $location.path('/dashboard_'+$cookies.get('dash_group'))  ;
        }
      }
    },
    templateUrl: '/user/views/login.html',
    controller: 'loginController'
  })
  .when('/dashboard_user', {
    resolve: {
      "check": function($location, $cookies, LoginStatus) {
        if(!$cookies.get('dash_loggedin')||$cookies.get('dash_group')!='user') {
          $location.path('/login');
        }
      }
    },
    templateUrl: '/user/views/dashboard_user.html',
    controller: 'userdashboardController'
  })
  .when('/dashboard_lead', {
    resolve: {
      "check": function($location, $cookies, LoginStatus) {
        if(!$cookies.get('dash_loggedin'|| ($cookies.get('dash_group')!='admin' && $cookies.get('dash_group')!='lead'))){
          $location.path('/login');
        }
      }
    },
    templateUrl: '/user/views/dashboard_lead.html',
    controller: 'leaddashboardController'
  })
  .when('/dashboard_admin', {
    resolve: {
      "check": function($location, $cookies, LoginStatus) {
        if(!$cookies.get('dash_loggedin')||$cookies.get('dash_group')!='admin'){
          $location.path('/login');
        }
      }
    },
    templateUrl: '/user/views/dashboard_admin.html',
    controller: 'admindashboardController'
  })
  .when('/dashboard_crmm', {
    resolve: {
      "check": function($location, $cookies, LoginStatus) {
        if(!$cookies.get('dash_group')||$cookies.get('dash_group')!='admin'){
          $location.path('/login');
        }
      }
    },
    templateUrl: '/user/views/dashboard_crmm.html',
    controller: 'crmmdashboardController'
  })
  .otherwise({
    redirectTo: '/login'
  })
});



app.controller("mainController", function($scope, $location, $cookies, Idle, $http, $route, $window) {
  $scope.cook = $cookies.get('dash_userid');
  $scope.events = [];

  $scope.$on('IdleStart', function() {
    // the user appears to have gone idle
  });

  $scope.$on('IdleWarn', function(e, countdown) {
    // follows after the IdleStart event, but includes a countdown until the user is considered timed out
    // the countdown arg is the number of seconds remaining until then.
    // you can change the title or display a warning dialog from here.
    // you can let them resume their session by calling Idle.watch()
  });

  $scope.$on('IdleTimeout', function() {
    // the user has timed out (meaning idleDuration + timeout has passed without any activity)
    // this is where you'd log them
    if($location.path() != '/login') {
      $http({
        url: '/logout',
        method: 'post',
        data: {"user": $cookies.get('dash_userid')}
      }).then(function(data){
        $cookies.remove('dash_userid')
        $cookies.remove('dash_group')
        $cookies.remove('dash_loggedin')
        alert("Logging out due to inactive session!")
        // $location.path('/login').replace();
        $window.location.reload();
      }, function(err){})
    }
  });

  $scope.$on('IdleEnd', function() {
    // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
  });

  $scope.$on('Keepalive', function() {
    // do something to keep the user's session alive
  });
})
.config(function(IdleProvider, KeepaliveProvider) {
  // configure Idle settings
  IdleProvider.idle(300); // in seconds
  IdleProvider.timeout(5); // in seconds
  KeepaliveProvider.interval(2); // in seconds
})
.run(function(Idle){
  // start watching when the app runs. also starts the Keepalive service by default.
  Idle.watch();
});
