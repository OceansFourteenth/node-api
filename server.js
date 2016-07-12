// server.js

// BASE SETUP
// ====================================

var User = require('./models/user');

// CALL THE PACKAGES ------------------
var express 	= require('express'); // call express
var app 		= express(); // define our app using express
var bodyParser 	= require('body-parser'); // get body-parser
var morgan 		= require('morgan'); // used to see requests
var mongoose	= require('mongoose'); // for working w/ our database
var port		= process.env.PORT || 8080; // set the port for our app

// connect to our database (hosted on modulus.io)
mongoose.connect('mongodb://user:default@jello.modulusmongo.net:27017/ug7yzEso');
// uncomment below and comment above to use localhost instead
// mongoose.connect('mongodb://localhost:27017/node-api');

// APP CONFIGURATION ------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
	next();
});

// log all requests to the console
app.use(morgan('dev'));

// ROUTES FOR OUR API
// =====================================

var apiRouter = express.Router(); // get an instance of the express router

// middleware to use for all requests
apiRouter.use(function(req, res, next) {
	// do logging
	console.log('Somebody just came to our app!');
	
	// we'll add more to the middleware in CHapter 10
	// this is where we'll authenticate users
	
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /users
// -------------------------------------

apiRouter.route('/users')
	
	// create a user (accessed at POST http://localhost:8080/api/users)
	.post(function(req, res) {
		
		// create a new instance of the User model
		var user = new User();
		
		// set the usere information (comes from the request)
		user.name = req.body.name;
		user.username = req.body.username;
		user.password = req.body.password;
		
		// save the user and check for errors
		user.save(function(err) {
			if (err) {
				// duplicate entry
				if (err.code == 11000)
					return res.json({ success: false, message: 'A user with that\
 username already exists.' });
				 else
					 return res.send(err);
			}
			
			res.json({ message: 'User created!' });
		});
	})
	
	// get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err) res.send(err);
			
			// return the users
			res.json(users);
		});
	});
	
// on routes that end in /users/:user_id
// -------------------------------------
apiRouter.route('/users/:user_id')

	// get the user with that id
	// (accessed at GET http://localhost:8080/api/users/:user_id)
	.get(function(req, res) {
		User.findById(req.params.user_id, function(err, user) {
			if (err) res.send(err);
			
			// return that user
			res.json(user);
		});
	})
	
	// update the user with this id
	// (accessed at PUT http://localhost:8080/api/users/:user_id)
	.put(function(req, res) {
		
		// use our user model to find the user we want
		User.findById(req.params.user_id, function(err, user) {
			
			if(err) res.send(err);
			
			// update the users info only if its new
			if (req.body.name)
				user.name = req.body.name;
			if (req.body.username)
				user.username = req.body.username;
			if (req.body.password)
				user.password = req.body.password;
			
			// save the user
			user.save(function(err) {
				if (err) res.send(err);
				
				// return a message
				res.json({ message: 'User updated!' });
			});
		});
	})
	
	// delete the user with this id
	// (accessed at DELETE http://localhost:8080/api/users/:user_id)
	.delete(function(req, res) {
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err) return res.send(err);
			
			res.json({ message: 'Successfully deleted' });
		});
	});

// REGISTER OUR ROUTES -----------------
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);

// START THE SERVER
// =======================================
app.listen(port);
console.log('Magic happens on port ' + port);