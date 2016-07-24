// app/routes.js


// import schema for user, comment and message
var User       		= require('../app/models/user'); 
var Comment         = require('../app/models/comment');
var Message         = require('../app/models/message');

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {  
            res.render("home.ejs",{
                user: null
                }); 
	}); 
	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});
    
    

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/home', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
    
    
    
    // =====================================
	// Facebook login ======================
	// =====================================
	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
	app.get('/BeMaster/facebook', passport.authenticate('facebook', { scope : 'email' }));

	// handle the callback after facebook has authenticated the user
	app.get('/BeMaster/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/home',
			failureRedirect : '/login'
		}));

    
	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs');
	});
		
	//sign up for student
	app.get('/studentsignup', function(req, res){
		res.render('studentsignup.ejs', { message: req.flash('signupMessage') });
	});
	
	app.get('/coachsignup', function(req, res){
		res.render('coachsignup.ejs', { message: req.flash('signupMessage') });
	});
	
	// process the studentsignup form
	app.post('/studentsignup', passport.authenticate('local-signup-student', {
		successRedirect : '/home', // redirect to the secure profile section
		failureRedirect : '/studentsignup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
	
	// process the studentsignup form
	app.post('/coachsignup', passport.authenticate('local-signup-coach', {
		successRedirect : '/home', // redirect to the secure profile section
		failureRedirect : '/coachsignup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	
    
    
    // =====================================
	// Game pages =====================
	// =====================================
    app.get('/games/*', function(req, res){
        var url = req.url;
        var game = url.substring(7);
        var Game;

        if (game=='lol') {
                Game='League of Legends'
        }
        if (game=='dota2') {
                Game='Dota2'
        
        }
        if (game=='csgo') {
                Game='CS:GO'

        }
        
        if (game=='overwatch') {
                Game='Overwatch'
         
        }
        if (req.isAuthenticated()){
                User.find({'local.occupation':'coach', 'local.game': Game,
                   'local.email': {$ne: req.user.local.email } },function(err, coaches){
                       
                        res.render('game.ejs',{
                        coaches: coaches,
                        user: req.user,
                        gameName: game,
                        coachtype: null,
                        cost : null
                        });
                   });
        }
        else{   
                User.find({'local.occupation':'coach', 'local.game': Game},function(err, coaches){
                        console.log(coaches);
                res.render('game.ejs', {   
                        coaches: coaches,
                        user: null,
                        gameName: game,
                        coachtype: null,
                        cost : null
                        });
                });
        }
    });
    
    
    
    
    
    // =====================================
	// SEARCH COACHES ======================
	// =====================================	   
	// process the search form
	app.post('/search', function(req, res){
		var gameName = req.param('gamename');
        var Game;
		var cost = req.param('cost');
        var coachtype =req.param('coachtype');
		var lowlimit;
		var highlimit;
        
		if (gameName=='lol') {
                Game='League of Legends';
        }
        if (gameName=='dota2') {
                 Game='Dota2';
        
        }
        if (gameName=='csgo') {
                Game='CS:GO';

        }
        
        if (gameName=='overwatch') {
                Game='Overwatch';  
        }
        
		switch(true){
  			case cost == 'Free':
				lowlimit = -1;
				highlimit = 1;
				break;
			case cost == '$1-$10':
				lowlimit = 0;
				highlimit = 11;
				break;
			case cost == '$11-$20':
				lowlimit = 10;
				highlimit = 21;
				break;
			case cost == '$21-$30':
				lowlimit = 20;
				highlimit = 31;
				break;
			case cost == '>$30':
				lowlimit = 30;
				highlimit = 100;
				break;
			case cost == 'All':
				lowlimit = -1;
				highlimit = 100;    
		}
        
        if (req.isAuthenticated()){
                User.find({'local.game' : Game,
				   'local.occupation':'coach',
				   'local.cost': { $gt: lowlimit, $lt: highlimit},
                   'local.email': {$ne: req.user.local.email} }, function(err, coaches) {
                  
                        if (err){       
                         console.log("some error");
                        }    
                        else {
                               res.render('game.ejs', {
                                coaches: coaches,
                                user: req.user,
                                //search part
                                gameName: gameName,
                                coachtype: coachtype,
                                cost : cost
                                });
                        }
                   })
         }
         else{
                User.find({'local.game' : Game,
				   'local.occupation':'coach',
				   'local.cost': { $gt: lowlimit, $lt: highlimit}}, function(err, coaches) {
                        if (err){       
                         console.log("some error");
                        }
                        else{
                                res.render('game.ejs', {
                                coaches: coaches,
                                user: null,
                                //search part
                                gameName: gameName,
                                coachtype: coachtype,
                                cost : cost
                                });
                        }
                   });
                }
     
        });
    
    

    
    
    
    
	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res){
        
		//handle student  
		if (req.user.local.occupation == "student") {
                res.render('studentprofile.ejs', {
                           user : req.user
                           });
         
        }
        
		//handle coach
		else{
            // Coach can view comments to him on profile
            // get comments from database
            Comment.find({'coachid': req.user._id}, function(err, comments){
                	res.render('coachprofile.ejs', {
                        user : req.user,
                        comments : comments 
                    });	
            }); 
		}	
	});
		
    
	// Returned to homepage
	app.get('/home', isLoggedIn, function(req, res) {
            res.render("home.ejs", {
                user: req.user
            });
	});
	
	
	
    
	// =====================================
	// EDIT PROFILE=========================
	// =====================================
	//
	//show the student edit form
	app.get('/editstudent', isLoggedIn,  function(req, res){
		res.render('editstudent.ejs' ,{
			user: req.user
		});
	});
	
	
	// process the studentedit form
	app.post('/editstudent', function(req, res){
		var email = req.user.local.email;
		
		//update database
		User.findOne({ 'local.email' :  email }, function(err, user) {

            if (err) {
                return next(err);
                //code
            }
            if (req.param('password') != '') {
                user.local.password = user.generateHash(req.param('password'));     
            }
            if (req.param('location') != '') {
                user.local.location = req.param('location');
            }
            if ( req.param('nickname') != '') {
                user.local.nickname = req.param('nickname');
            }
            if ( req.param('game') != '') {
                user.local.game = req.param('game');
            }

			user.save();
			//update session
			req.login(user, function(err) {
				if (err) return next(err)
				else{
					res.redirect('/profile');
				}
			});
		});														
	});
	
	
	
	//show the coach edit form
	app.get('/editcoach', isLoggedIn,  function(req, res){
		res.render('editcoach.ejs' ,{
			user: req.user
		});
	});
	
    
	// process coach edit form
	app.post('/editcoach', function(req, res){
		var email = req.user.local.email;
		//update database
		User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err) {
                return next(err);
                //code
            }
            
			if (req.param('password') != '') {
                user.local.password = user.generateHash(req.param('password'));     
            }
            
            if (req.param('location') != '') {
                user.local.location = req.param('location');
            }
            if ( req.param('nickname') != '') {
                user.local.nickname = req.param('nickname');
            }
            if ( req.param('game') != '' ) {
                user.local.game = req.param('game');
            }
            if (req.param('cost') != '' ) {
                user.local.cost = req.param('cost');
            }
            
            if ( req.param('coachtype') != '') {
                user.local.coachtype = req.param('coachtype');
            }
			user.save();
			//update session
			req.login(user, function(err) {
				if (err) return next(err)
				else{
					res.redirect('/profile');
                }
			});
		});														
	});


	
    
	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
        });

    
    
    
    
    
    // =====================================
	// view user information===============
	// =====================================
    // including coach and student
    app.get('/users/*', checkLogin, function(req, res) {
        var url = req.url;
        var id = url.substring(7);
        if (id == req.user._id) {
                res.redirect('/profile');
        }
        else{
        //find this user from database    
        User.findOne({ '_id' :  id }, function(err, user) {
                 if (err) {
                        console.log(err);
                        }     
                //this user is a student      
                if (user.local.occupation =="student") {
                        res.render('viewstudent.ejs', {
                                student : user,
                                user : req.user
                        });
                        
                } 
                //this user is a coach
                else{
                        //find all comments about this coach
                        Comment.find({'coachid': id}, function(err, comments){
                                if (err) {
                                        console.log(err);
                                        }
                                res.render('viewcoach.ejs',{
                                        user: req.user,
                                        coach:user,
                                        comments: comments
                                });
                        });
                }
        });
        }
    });



	

    
         
	// =====================================
	// Comment and rating system ======================
	// =====================================
    
    // users add comments to coach
	app.post('/comments/*', isLoggedIn, function(req, res){
        //get the id of coach to be commented
        var url = req.url;
        var coachid = url.substring(10);
        var content = req.param("comment");
        var newComment  = new Comment();
        var date = new Date();
        newComment.coachid = coachid;
        newComment.comment.studentid = req.user._id;
        newComment.comment.nickname = req.user.local.nickname;
        newComment.comment.content = content;
        newComment.comment.date = date;
        newComment.save();
        res.redirect('/users/'+coachid);
    });
    
    
    
    // =====================================
	// Follow system ======================
	// =====================================  
    //student follows a coach
    app.get('/follow/*', isLoggedIn, function(req, res){
        var url = req.url;
        var coachid = url.substring(8);
        User.findOne({'_id': req.user._id }, function(err, user){
            if (err) {
                //code
            }
            user.local.follow.push(coachid);
            user.save();
        });
    });
    
    //student view follow list 
    app.get('/viewfollow',isLoggedIn, function(req, res){
        User.find({'_id': req.user._id}, function(err, coaches){
            //TODO
            //TODO
        });   
    });
    
    
    
    
    
    // =====================================
	// Message system ======================
	// =====================================
    
    
    

    //send a message to a user
    app.post('/message/*', isLoggedIn, function(req,res){
        var url = req.url;
        var receiverid = url.substring(9);
        var date = new Date();
        var newMessage = new Message();
        newMessage.sender.id = req.user._id;
        newMessage.receiver.id = receiverid;
        newMessage.sender.content = req.param("content");
        newMessage.receiver.content = req.param("content");
        newMessage.receiver.status=0;
        newMessage.date = date;
        newMessage.save();
        res.redirect('/users/'+receiverid);
    });
    
    
    //repley in a conservation
    app.post('/repley/*', isLoggedIn, function(req,res){
        var url = req.url;
        var receiverid = url.substring(8);
        var date = new Date();
        var newMessage = new Message();
        newMessage.sender.id = req.user._id;
        newMessage.receiver.id = receiverid;
        newMessage.sender.content = req.param("repley");
        newMessage.receiver.content = req.param("repley");
        newMessage.receiver.status=0;
        newMessage.date = date;
        newMessage.save();
        
        res.redirect('/viewmessage/'+receiverid);
    });
    
    
    
    //user view contacter list
    app.get('/messaging', isLoggedIn, function(req, res){
         Message.find({'sender.id': req.user._id}).distinct('receiver.id').exec(function(err, receivers){
            Message.find({'receiver.id': req.user._id}).distinct('sender.id').exec(function(err, senders){
                for(i=0; i<senders.length; i++){
                    if (receivers.indexOf(senders[i]) == -1) {
                        receivers.push(senders[i]);
                        }
                }
                
                User.find({ '_id': { $in: receivers } }, function(err, users){
                        
                        res.render('message.ejs', {
                                targetid: null,
                                contacters: users,
                                user: req.user,
                                conservations: null
                                });
                        });
            });
        });
    });
    
    
    //user view conservations with one contacter
    app.get('/viewmessage/*', isLoggedIn, function(req, res){
         var url = req.url;
         var contactid = url.substring(13);
         Message.find({ $or: [{$and: [ { 'sender.id': req.user._id }, { 'receiver.id': contactid} ] },
                             {$and: [ { 'sender.id': contactid }, { 'receiver.id': req.user._id} ] }]
                      }).sort({'date': 1}).exec(function(err, conservations){
                console.log(conservations);
            res.render('message.ejs',{
                targetid:  contactid,
                conservations:conservations,
                user: req.user,
                contacters :null
            });
        });    
    });
    
    
    
    
    // =====================================
	// ADMIN LOGIN =========================
	// =====================================
	// show the admin-login form
	app.get('/admin', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('adminlogin.ejs', { message: req.flash('loginMessage') });
	});


	// process the login form
	app.post('/admin', passport.authenticate('admin-login', {
		successRedirect : '/adminpage', // redirect to the secure admin page
		failureRedirect : '/admin', // redirect back to the admin-login page if there is an error
		failureFlash : true // allow flash messages 
	}));
    
    // show admin page
	app.get('/adminpage', isLoggedIn, function(req, res) {
		// render the adminpage and pass in any flash data if it exists
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('adminpage.ejs', { message: req.flash('loginMessage') });
        } else {
            res.render('adminlogin.ejs', { message: req.flash('loginMessage')});
        } 
	});
    
    //show the change password form
	app.get('/changepassword', isLoggedIn,  function(req, res){
		res.render('changepassword.ejs' ,{
			user: req.user
		});
	});
    
    
    // process the change password form
	app.post('/changepassword', function(req, res){
		var email = req.user.local.email;
		//update database
		User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err) {
                return next(err);
            } else {
                user.local.password = user.generateHash(req.param('newpassword'));
                user.save();
                res.render('changepasswordsuccess.ejs');
            }
		});													
	});
	
    
    //show the add user form
	app.get('/adduser', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('adduser.ejs');
        } else {
            res.render('adminlogin.ejs', { message: req.flash('loginMessage')});
        };
	});
    
    //show the add stuent form
	app.get('/addstudent', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('addstudent.ejs', { message: req.flash('signupMessage')});
        } else {
            res.render('adminlogin.ejs', { message: req.flash('loginMessage')});
        };
	});
    
    // process the add student form
    app.post('/addstudent', function(req, res) {
        var email = req.param('email');
        
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return next(err)
            // check to see if theres already a user with that email
            if (user) {
                res.render('addstudent.ejs', {message: ('signupMessage', 'That email is already taken.')});
            } else {
                // if there is no user with that email
                // create the user
                var newUser  = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(req.param('password')); // use the generateHash function in our user model
                // parse the url
                newUser.local.location = req.param('location');
                newUser.local.nickname = req.param('nickname');
                newUser.local.game = req.param('game');
                newUser.local.occupation = 'student';
                // save the user
                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    } else {
                        res.render('addstudentsuccess.ejs');
                    }
                });
            }
        })
    });
    
    //show the add coach form
	app.get('/addcoach', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('addcoach.ejs', { message: req.flash('signupMessage')});
        } else {
            res.render('adminlogin.ejs', { message: req.flash('loginMessage')});
        };
	});
    
    // process the add coach form
    app.post('/addcoach', function(req, res) {
        var email = req.param('email');
        
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return next(err)
            // check to see if theres already a user with that email
            if (user) {
                res.render('addcoach.ejs', {message: ('signupMessage', 'That email is already taken.')});
            } else {
                // if there is no user with that email
                // create the user
                var newUser  = new User();
                
                 // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(req.param('password'));
                newUser.local.nickname = req.param('nickname');
                newUser.local.location = req.param('location');
                newUser.local.occupation = 'coach';
                newUser.local.game = req.param('game');
                newUser.local.cost = req.param('cost');
                newUser.local.rate.grade = 0;
                newUser.local.rate.list= [];
                newUser.local.coachtype = req.param("coachtype");
                // save the user
                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    } else {
                        res.render('addcoachsuccess.ejs');
                    }
                });
            };
        });
    })
        
        
    
    
    
    
}


// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();// if they aren't redirect them to the home page
	res.redirect('/');
}


function checkLogin(req, res, next) {
   if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}