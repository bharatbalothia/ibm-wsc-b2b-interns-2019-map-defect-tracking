var app = angular.module("userApp");

app.controller("crmmdashboardController", function($scope, $resource, $http, $window, $location, $timeout, $cookies, $route, LoginStatus, importAPI){

  $scope.user = $cookies.get('dash_userid')
  $scope.new_item = {}
  $scope.new_item.validity = false;
  $scope.master = [];
  $scope.searchString="";
  $scope.new_master="";
  $scope.account=[];
  $scope.region_dict={};
  $scope.by_l=1;
  $scope.by_a=1;
  $scope.by_m=1;
  $scope.logged_in = true;


  var Tasks = $resource('/api/list');
  var List = $resource('/api/list');
  var Transaction = $resource('/api/transaction');

  Transaction.query(function(result) {
    $scope.transaction = result;
  });

  Tasks.query(function(result) {
    $scope.list = result;
  });

  List.query(function(result) {
    $scope.list = result;
    $scope.master = [];
    for(var i=0; i<result.length; i++) {
      $scope.master.push(result[i].ACCOUNT);
      $scope.account.push(result[i].PACCOUNT);
      $scope.region_dict[result[i].ACCOUNT]=result[i].REGION;
    }
    $scope.master=$scope.master.sort();
    for(var i=1;i<$scope.master.length;i++) {
      if($scope.master[i]==$scope.master[i-1]) {
        $scope.master.splice(i, 1);
        i--;
      }
    }
  });


  $scope.update = function() {
    Tasks.query(function(result) {
      $scope.list = result;
    });
    Transaction.query(function(result) {
      $scope.transaction = result;
    });
  }


  $scope.add_item = function() {
  if($scope.account.indexOf($scope.new_item.PACCOUNT)!=-1)
  window.alert("Account name exists!");
  else {
    if(!$scope.new_item.ACCOUNT)
    $scope.new_item.ACCOUNT=$scope.searchString;

    if($scope.new_item.validity==true)
    $scope.new_item.ACCOUNT=$scope.new_item.PACCOUNT;
    delete $scope.new_item.validity;
    $scope.new_item.user = $scope.user
    $http({
      url: '/new_item',
      method: 'POST',
      data: $scope.new_item
    }).then(function(data){
      $scope.new_item={};
      $scope.ACCOUNT="";
      $scope.searchString="";
      $scope.master=$scope.master.filter(function(item) {
        return item != data.data.ACCOUNT;
      })
      $scope.account=$scope.account.filter(function(item) {
        return item != data.data.PACCOUNT;
      })
      $scope.account.push(data.data.PACCOUNT);
      $scope.master.push(data.data.ACCOUNT);
      $scope.region_dict[data.data.ACCOUNT]=data.data.REGION;
      $scope.update();
    }, function(data){});

  }

}


  $scope.delete = function(item) {
    item.user = $scope.user
    $http({
      url: '/delete_item',
      method: 'POST',
      data: item
    }).then(function(data){
      $scope.update();
    }, function(err){});
  }

  $scope.export = function() {
    $http({
      url: '/download',
      method: 'get',
    }).then(function(data){}, function(data){});
  }

  $scope.by_region = function() {
    $scope.by_l= -$scope.by_l;
    $http({
      url: '/by_region',
      method: 'post',
      data: {order: $scope.by_l}
    }).then(function(data){
      $scope.list = data.data;
    }, function(data){});
  }


  $scope.by_acc_name = function(x) {
  $scope.by_a= -$scope.by_a;
    $http({
      url: '/by_acc_name',
      method: 'post',
      data: {order: $scope.by_a}
    }).then(function(data){
      $scope.list = data.data;
    }, function(data){});
  }


    $scope.by_master = function(x) {
    $scope.by_m= -$scope.by_m;
      $http({
        url: '/by_master',
        method: 'post',
        data: {order: $scope.by_m}
      }).then(function(data){
        $scope.list = data.data;
      }, function(data){});
    }

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

    $scope.save_export = function() {
      $http({
        url: '/export',
        method: 'post',
        data: {user: $scope.user}
      }).then(function(data){
        window.location = '/';
      }, function(data){});
    }

  $scope.importcrmm = function() {
    importAPI.uploadcrmm($scope.myFile).then(function(data) {
      $scope.export();
      $route.reload();
    }, function(err) {});
  }

  $scope.exportfile = function() {
    var win = window.open();
    $http({
      url: '/download',
      method: 'get',
    }).then(function(data){
      win.location = '/file.csv'
    }, function(data){});
  }

  $scope.gettemplate = function() {
    window.location = '/crmmtemplate.csv'
  }


  $scope.$watch('new_item.ACCOUNT', function(){
    $scope.searchString = $scope.new_item.ACCOUNT;
    $scope.new_item.REGION = $scope.region_dict[$scope.new_item.ACCOUNT];
  });

  $scope.$watch('new_item.validity', function(){
    $scope.searchString = $scope.new_item.PACCOUNT;
  });

  $scope.$watch('new_item.REGION', function(){
    if($scope.new_item.ACCOUNT && $scope.new_item.ACCOUNT==$scope.searchString && $scope.region_dict[$scope.new_item.ACCOUNT]!=$scope.new_item.REGION) {
      window.alert("Your master account name doesnot associate with given region!\nChoose "+$scope.region_dict[$scope.new_item.ACCOUNT]);
      $scope.new_item.REGION = $scope.region_dict[$scope.new_item.ACCOUNT];
    }

    if($scope.searchString && $scope.new_item.ACCOUNT!=$scope.searchString && $scope.region_dict[$scope.searchString] && $scope.region_dict[$scope.searchString]!=$scope.new_item.REGION) {
      window.alert("Your master account name doesnot associate with given region!\nChoose "+$scope.region_dict[$scope.searchString]);
      $scope.new_item.REGION = $scope.region_dict[$scope.searchString];
    }

  });

  $scope.$watch('master', function(){
    $scope.update();
  });

});

app.filter('searchFor', function(){
  return function(arr, searchString){
    if(!searchString){
      return arr;
    }
    var result = [];
    searchString = searchString.toLowerCase();
    angular.forEach(arr, function(item){
      if(item.toLowerCase().indexOf(searchString) !== -1){
        result.push(item);
      }
    });
    return result;
  };
});
