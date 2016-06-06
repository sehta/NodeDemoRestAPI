var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./model/db');
var User = require('./model/user');
var bCrypt = require('bcrypt-nodejs');


var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var apiRoutes = express.Router(); 



/*POST LOGIN*/
apiRoutes.post('/api/login', function(req, res) {
  User.findOne({ 'email' :  req.body.username },function(err, user) {
                    // In case of any error, return using the done method
                   if (err) return res.json({message:err});
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        return res.json({message:'User Not Found with username '+req.body.username});
                      //  return done(null, false, {'title':'test'});
                    }
                    // User exists but wrong password, log the error 
                    if (!isValidPassword(user, req.body.password)){
                       return res.json({message:'Invalid Password'});
                     //   return done(null, false, {'title':'test'}); 
                        // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                   return res.json({'message':'User Found', 'user':user});
                }
            );
});

/*POST SIGNUP*/
apiRoutes.post('/api/signup', function(req, res) {
findOrCreateUser = function(){
                // find a user in Mongo with provided username
                User.findOne({ 'username' :  req.body.username }, function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in SignUp: '+err);
                        return res.json({message:err});
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with email: '+req.body.username);
                      //  return done(null, false, req.flash('message','User Already Exists'));
                         return res.json({message:'User already exists with email:'+req.body.username});
                    } else {
                        // if there is no user with that email
                        // create the user
                        var newUser = new User();
                        // set the user's local credentials
                        newUser.email = req.body.username;
                        newUser.password = createHash(req.body.password);
                        newUser.name = req.body.name;
                        newUser.roles.push('member');
                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);  
                                throw err;
                                 return res.json({message:err});
                            }
                            console.log('User Registration succesful');  
                           
                            
                         return res.json({message:'User Registration succesful',user:newUser});
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
});


/*GET USER LISTING*/
apiRoutes.get('/api/users', function(req, res) {
  User.find(function(err, users) {
                    // In case of any error, return using the done method
                   if (err) return res.json({message:err});
                    // Username does not exist, log the error and redirect back
                   return res.json({'message':'User List', 'users':users});
    });
});


// Check password
var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    }

 // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

app.use('/', apiRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
