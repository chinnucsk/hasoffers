'use strict';
/* App Module */
angular.module('hasoffers', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/users', {templateUrl: 'partials/user-list.html',   controller: UserListController}).
      otherwise({redirectTo: '/users'});
}]);