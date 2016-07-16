angular.module('mainCtrl', [])

.controller('mainController', function($rootScope, $location, Auth) {
	
	var vm = this;
	
	// get info if a person is logged in
	vm.loggedIn = Auth.isLoggedIn();
	
	// check to see if a user is logged in on every request
	$rootScope.$on('$routeChangeStart', function() {
		vm.loggedIn = Auth.isLoggedIn();
		
		// get user information on route change
		Auth.getUser()
		.then(function(success) {
			vm.user = success.data;
		});
	});
	
	// function to handle login form
	vm.doLogin = function() {
		vm.processing = true;
		
		 // clear the error
		 vm.error = '';
		
		// call the Auth.login() function
		Auth.login(vm.loginData.username, vm.loginData.password)
		.then(function(success) {
			vm.processing = false;
			
			// if a user successfully logs in, redirect to users page
			if (success.data.success)
				$location.path('/users');
			else
				vm.error = success.data.message;
		});
	};
	
	// function to handle logging out
	vm.doLogout = function() {
		Auth.logout();
		// reset all user info
		vm.user = {};
		$location.path('/login');
	};
	
	// function to handle register form
	vm.doRegister = function() {
		vm.processing = true;
		
		vm.error = '';
		
		if (vm.registerData.password !== vm.registerData.password2) {
			vm.error = 'Passwords must match to continue.';
			vm.processing = false;
			return;
		}
		
		// call the Auth.register() function
		Auth.register(vm.registerData.name, vm.registerData.username, vm.registerData.password)
		.then(function(success) {
			vm.processing = false;
			
			// if a user successfully registers
			if(success.data.success) 
				$location.path('/login');
			else
				vm.error = success.data.message;
		});
	};
});