angular.module('app', [
  'auth0',
  'angular-storage',
  'angular-jwt',
  'ngRoute',
  'userAccountController',
  'loginController',
  'signUpController',
  'app.controllers',
  'app.factories',
  'angularPayments',
  'payment',
  'ui.bootstrap',
  'ui.bootstrap.modal',
  'ui.bootstrap.tpls'
])

 .config(function myAppConfig ($routeProvider, authProvider){
    authProvider.init({
      domain: 'mcpatte.auth0.com',
      clientID: 'ttkIeD4sPNAApCckJC2u8Q0cIHY2MJeh',
      loginUrl: 'login'
    });

    $routeProvider
    .when( '/', {
      controller: 'loginController',
      templateUrl: 'home/homeView.html',
      requiresLogin: true
    })
    .when( '/userAccount', {
      controller: 'loginController',
      templateUrl: 'userAccount/userAccount.html',
      requiresLogin: true
    })

    // .when('/payment', {
    //   controller: 'paymentController',
    //   templateUrl: 'payment/paymentView.html'
    // });

    .when('/login', {
      controller: 'loginController',
      templateUrl: 'login/login.html',
      requiresLogin: false
    })
    .when('/signUp', {
      controller: 'signUpController',
      templateUrl: 'signUp/signUp.html',
      requiresLogin: false
    })


    //Called when login is successful
    authProvider.on('loginSuccess', ['$location', 'profilePromise', 'idToken', 'store', function($location, profilePromise, idToken, store) {
      // Successfully log in
      // Access to user profile and token
      profilePromise.then(function(profile){
        // profile
            store.set('profile', profile);
            store.set('token', idToken);
            email = profile.email;

      });
      $location.url('/userAccount');
    }]);

    //Called when login fails
    authProvider.on('loginFailure', function($location) {
      // If anything goes wrong
        console.log("Login Failure foo!")
        $location.url('#/');
    });

    // initialize app with Stripe API key
    window.Stripe.setPublishableKey('pk_test_TDyvWZl9vHWZcycVkvfDyIud');

}) //end of config

.run(['$rootScope', 'auth', 'store', 'jwtHelper', '$location', function($rootScope, auth, store, jwtHelper, $location) {
  // Listen to a location change event
  $rootScope.$on('$locationChangeStart', function() {
    // Grab the user's token
    var token = store.get('token');
    // Check if token was actually stored
    if (token) {
      // Check if token is yet to expire
      if (!jwtHelper.isTokenExpired(token)) {
        // Check if the user is not authenticated
        if (!auth.isAuthenticated) {
          // Re-authenticate with the user's profile
          // Calls authProvider.on('authenticated')
          auth.authenticate(store.get('profile'), token);
        }
      } else {
        // Use the refresh token to get a new idToken
        auth.refreshIdToken(token);
      }
    }

  });
}]);