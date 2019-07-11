var app = angular.module("userApp");
app.controller("loginController", function($scope, $location, $rootScope, $resource, $cookies, $http, $window, LoginStatus) {
  $scope.fusers = []
  var FUsers = $resource('/getfusers');

  FUsers.query(function(result) {
    for(var i=0;i<result.length;i++)
      $scope.fusers.push(result[i].userid);
  })

  $scope.page = "Login";
  $scope.login_status = $cookies.get('dash_loggedin')
  $scope.validate = function() {
    $http({
      url: '/login',
      method: 'post',
      data: {"userid": $scope.userid, "pass": $scope.password}
    }).then(function(data){
      var now = new $window.Date(),
      exp = new $window.Date(now.getFullYear(), now.getMonth()+6, now.getDate());

    if(data.data.group=='admin'){
      $cookies.put('name', data.data.userinfo.name, {
        expires: exp
      });
      $cookies.put('dash_loggedin', true, {
        expires: exp
      });
      $cookies.put('dash_userid', $scope.userid, {
        expires: exp
      });
      $cookies.put('dash_group', 'admin', {
        expires: exp
      });
      $location.path('/dashboard_lead').replace();
    }
    else if (data.data.group=='lead' && $scope.fusers.indexOf($scope.userid)==-1) {
      $cookies.put('name', data.data.userinfo.name, {
        expires: exp
      });
      $cookies.put('dash_loggedin', true, {
        expires: exp
      });
      $cookies.put('dash_userid', $scope.userid, {
        expires: exp
      });
      $cookies.put('dash_group', 'lead', {
        expires: exp
      });
      $location.path('/dashboard_lead').replace();
    }
    else if (data.data.group=='user' && $scope.fusers.indexOf($scope.userid)==-1) {
      $cookies.put('name', data.data.userinfo.name, {
        expires: exp
      });
      $cookies.put('dash_loggedin', true, {
        expires: exp
      });
      $cookies.put('dash_userid', $scope.userid, {
        expires: exp
      });
      $cookies.put('dash_group', 'user', {
        expires: exp
      });
      $location.path('/dashboard_user').replace();
    }
      else
    $scope.errmessage += ' Invalid!'
  }, function(err){})
  }


  $scope.$watch('userid', function() {
    if($scope.fusers.indexOf($scope.userid)!=-1)
      $scope.errmessage = 'Your login is forbidden by the admin!'
    else
      $scope.errmessage = ''
  })
});
