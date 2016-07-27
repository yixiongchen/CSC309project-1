// app/routes.js


// import schema for user, comment and message
var User       		= require('../app/models/user'); 
var Comment         = require('../app/models/comment');
var Message         = require('../app/models/message');
var fs     = require('fs');
var path     = require('path');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {  
            res.render("home.ejs",{
                user: null,
                message: null
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

                   'local.email': {$ne: req.user.local.email } }).
                sort({'local.rate.grade': -1}).limit(4).exec(function(err, coaches){
					   var limitedCoachInfo = [];
                        for (var i=0; i<coaches.length; i++){
							var limitedCoach = new Object();
							limitedCoach.profile = coaches[i]._id;
							limitedCoach.email = coaches[i].local.email;
							limitedCoach.game = coaches[i].local.game;
							limitedCoach.cost = coaches[i].local.cost;
							limitedCoach.lng = coaches[i].local.coordinate.lng;
							limitedCoach.lat = coaches[i].local.coordinate.lat;
							limitedCoach.name = coaches[i].local.nickname;
							limitedCoachInfo.push(limitedCoach);
                        }
                        res.render('game.ejs',{
						gameCoachInfo: limitedCoachInfo,
                        coaches: coaches,
                        user: req.user,
                        gameName: game,
                        coachtype: null,
                        cost : null
                        });
                   });
        }
        
        else{   

                User.find({'local.occupation':'coach', 'local.game': Game}).
				sort({'local.rate.grade': -1}).limit(4).exec(function(err, coaches){
					var limitedCoachInfo = [];
					for (var i=0; i<coaches.length; i++){
						var limitedCoach = new Object();
						limitedCoach.profile = coaches[i]._id;
						limitedCoach.email = coaches[i].local.email;
						limitedCoach.game = coaches[i].local.game;
						limitedCoach.cost = coaches[i].local.cost;
						limitedCoach.lng = coaches[i].local.coordinate.lng;
						limitedCoach.lat = coaches[i].local.coordinate.lat;
						limitedCoach.name = coaches[i].local.nickname;
						limitedCoachInfo.push(limitedCoach);
					}
					console.log(limitedCoachInfo);
					res.render('game.ejs', {   
						coaches: coaches,
						gameCoachInfo: limitedCoachInfo,
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
        var flag;
        if (coachtype === 'Both'){
        	flag=0;
        } else{
        	flag=1;
        }
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
			case cost == '$30+':
				lowlimit = 31;
				highlimit = 100;
				break;
			case cost == 'All':
				lowlimit = -1;
				highlimit = 100;    
		}
        
        if (req.isAuthenticated()){
				console.log("cost is:" + cost);
                User.find({'local.game' : Game,
				   'local.occupation':'coach',
                   'local.coachtype': { $in : [coachtype, 'Both']},
				   'local.cost': { $gt: lowlimit, $lt: highlimit},
                   'local.email': {$ne: req.user.local.email} }, function(err, coaches) {
                        if (err){       
                         console.log("some error");
                        }    
                        else {
						
							var limitedCoachInfo = [];
							for (var i=0; i<coaches.length; i++){
								var limitedCoach = new Object();
								limitedCoach.email = coaches[i].local.email;
								limitedCoach.profile = coaches[i]._id;
								limitedCoach.game = coaches[i].local.game;
								limitedCoach.cost = coaches[i].local.cost;
								limitedCoach.lng = coaches[i].local.coordinate.lng;
								limitedCoach.lat = coaches[i].local.coordinate.lat;
								limitedCoach.name = coaches[i].local.nickname;
								limitedCoachInfo.push(limitedCoach);
							}
						    res.render('game.ejs', {
								gameCoachInfo: limitedCoachInfo,
								coaches: coaches,
								user: req.user,
								//search part
								gameName: gameName,
								coachtype: coachtype,
								cost : cost
							});
                        }
                   });
         }
         else{
                User.find({
					'local.game' : Game,
				   'local.occupation':'coach',
                    'local.coachtype': coachtype,
				   'local.cost': { $gt: lowlimit, $lt: highlimit}}, function(err, coaches) {
                        if (err){       
                         console.log("some error");
                        }
                        else{
					
							var limitedCoachInfo = [];
							for (var i=0; i<coaches.length; i++){
								var limitedCoach = new Object();
								limitedCoach.email = coaches[i].local.email;
								limitedCoach.profile = coaches[i]._id;
								limitedCoach.game = coaches[i].local.game;
								limitedCoach.cost = coaches[i].local.cost;
								limitedCoach.lng = coaches[i].local.coordinate.lng;
								limitedCoach.lat = coaches[i].local.coordinate.lat;
								limitedCoach.name = coaches[i].local.nickname;
								limitedCoachInfo.push(limitedCoach);
							}
							res.render('game.ejs', {
								gameCoachInfo: limitedCoachInfo,
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
                User.find({'local.occupation':'coach', 'local.game':req.user.local.game}).sort({'rate': -1}).
                limit(4).exec(function(err, coaches){
                        res.render('studentprofile.ejs', {
                           user : req.user,
                           coaches: coaches
                           });
                        })
        }
        
		//handle coach
		else{
            // Coach can view comments to him on profile
            // get comments from database
            Comment.find({'coachid': req.user._id}, function(err, comments){
                	res.render('coachprofile.ejs', {
                        user : req.user,
                        comments : comments,
                        coachtype: req.user.local.coachtype
                    });	
            }); 
		}	
	});
		
    
	// Returned to homepage
	app.get('/home', isLoggedIn, function(req, res) {
            res.render("home.ejs", {
                user: req.user,
                message: null
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
                console.log("error");
                //code
            }
        
            if (req.param('password') != '') {
                user.local.password = user.generateHash(req.param('password'));     
            }
            if ( req.param('nickname') != '') {
                user.local.nickname = req.param('nickname');
            }
            if ( req.param('game') != '') {
                user.local.game = req.param('game');
            }
            
         
            
            
            if(req.files.photo.name != ''){  
                //read new image file
                fs.readFile(req.files.photo.path, function(err, data){
                var imageName = req.files.photo.name;
                       if(!imageName){
                            console.log("There was an error");
                        }else{
                            var newPath =  path.join(__dirname, '../public/tmp', req.user.local.email+imageName);
                        
                            fs.writeFile(newPath, data, function(err){
                                if (err) {
                                    console.log("err");
                                    }
                                });
                            }
                });
                
                
                if ( user.local.photo != '') {
                        //delete old images
                        var oldPath = path.join(__dirname, '../public', user.local.photo);
                        fs.unlinkSync(oldPath);
                }      
                //save the url to user photo field
                user.local.photo = '/tmp/'+ req.user.local.email+req.files.photo.name;     
            }
			user.save();
			//update session
			req.login(user, function(err) {
				if (err) console.log(err)
				else{
					res.redirect('/profile');
				}
			});
		});														
	});
	
	
	
	//show the coach edit form
	app.get('/editcoach', isLoggedIn,  function(req, res){
		res.render('editcoach.ejs' ,{
			user: req.user,
		});
	});
	
    
	// process coach edit form
	app.post('/editcoach', function(req, res){
		var email = req.user.local.email;
		//update database
		User.findOne({ 'local.email' :  email }, function(err, user , done) {
            if (err) {
                return next(err);
                //code
            }
            
			if (req.param('password') != '') {
                user.local.password = user.generateHash(req.param('password'));     
            }
            
            if (req.param("coachtype") == "Offline" || req.param("coachtype") == "Both"){
                    if (req.param('streetAddress').length == 0 ||
                        req.param('city').length == 0 ||
                        req.param('province').length == 0){
                           return;
                    }
                    else{
                    // obtain coordinates of address.
                    var urlAPIKey = "&key=AIzaSyA1IGuTcLPxARLu0f8zLHV5dyDx-6CbSa8";
                    var urlBeginning = "https://maps.googleapis.com/maps/api/geocode/json?address=";
                    var url = urlBeginning + req.param('streetAddress') + "+" + req.param('city') + "+"
                                           + req.param('province') + urlAPIKey; 
                    var jsonHTTP = new XMLHttpRequest();
                    jsonHTTP.open("GET", url, false);
                    jsonHTTP.send(null);
                    var result = JSON.parse(jsonHTTP.responseText);
                    if (result["status"] == "ZERO_RESULTS"){
                        return done(null, false, req.flash('signupMessage', 'Cannot find address'));
                    }
                    else {
                        user.local.coordinate.lat = result.results[0]["geometry"]["location"]["lat"];
                        user.local.coordinate.lng = result.results[0]["geometry"]["location"]["lng"];

                    }
                    user.local.address.street = req.param('streetAddress');
                    user.local.address.city = req.param('city');
                    user.local.address.province = req.param('province');
                    user.local.coachtype = req.param("coachtype");
                    }
            
                }
                

                // use the generateHash function in our user model
	            // parse the url
               
           
            if(req.param('coachtype') == 'Online'){
                user.local.coachtype = req.param('coachtype');
                
            }
            
            if ( req.param('nickname') != '') {
                user.local.nickname = req.param('nickname');
            }
            if ( req.param('game') != '' ) {
                user.local.game = req.param('game');
            }
            if ( req.param('cost') != '' ) {
                user.local.cost = req.param('cost');
            }
            
            if( req.files.photo.name != ''){  
                //read new image file
                fs.readFile(req.files.photo.path, function(err, data){
                var imageName = req.files.photo.name;
                       if(!imageName){
                            console.log("There was an error");
                        }else{
                            var newPath =  path.join(__dirname, '../public/tmp', req.user.local.email+imageName);
                            console.log(newPath);
                            fs.writeFile(newPath, data, function(err){
                                if (err) {
                                    console.log("err");
                                    }
                                });
                            }
                    });
                
                if ( user.local.photo != '') {
                  
                //delete old images
                var oldPath = path.join(__dirname, '../public', user.local.photo);
                fs.unlinkSync(oldPath);
                }
                
                //save the url to user photo field
                user.local.photo = '/tmp/'+ req.user.local.email+req.files.photo.name;
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
        var has_followed = 0;
        for(var i = 0; i < req.user.local.follow.length; i++){
            if (req.user.local.follow[i] == id){
                has_followed = 1;
            }
        }
 
        User.findOne({ '_id' :  id }, function(err, user) {
                 if (!user) {
                        res.redirect('/') 
                 }
                 
                 else{
                        
                 if (err) {
                        res.redirect('/')
                             
                }
                
                if (user.local.occupation =="student") {
                        res.render('viewstudent.ejs', {
                                student : user,
                                user : req.user,
                                friend_list :  req.user.local.follow,
                                has_followed : has_followed
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
                                        comments: comments,
                                        friend_list : req.user.local.follow,
                                        has_followed :  has_followed
                                });
                        });
                }
         }
        });
        }
        
    });

    app.get('/follow/*', checkLogin, function(req, res){
        var url = req.url;
        var id = url.substring(8);

        var email = req.user.local.email;
  
        User.findOne({ 'local.email' :  email }, function(err, user){
            user.local.follow.push(id);
            user.save();
            req.login(user, function(err) {
                if (err) return next(err)
                else{
                    res.redirect('/users/'+id);
                   
                }
            });
        
        });
    });
    app.get('/unfollow/*', checkLogin, function(req, res){
        var url = req.url;
        var id = url.substring(10);
        var email = req.user.local.email;
        var index;
        User.findOne({ 'local.email' :  email }, function(err, user){
            for (var i = 0; i < user.local.follow.length; i++){
                if (id == user.local.follow[i]){
                    index = i;
                }
            }
            user.local.follow.splice(index, 1);
          
            user.save();
            req.login(user, function(err) {
                if (err) return next(err)
                else{
                    res.redirect('/friend');
                   
                }
            });
        
        });
    });

    app.get('/friend', isLoggedIn, function(req, res){
 
            var friend_list = req.user.local.follow;
            User.find({'_id' : { $in: friend_list}}, function(err,coaches){
            res.render('friend.ejs', {
                coaches: coaches,
                user: req.user
            });
        });
})    


	

    
         
	// =====================================
	// Comment and rating system ======================
	// =====================================
  
    // users add comments to coach
	app.post('/comments/*', isLoggedIn, function(req, res){
        //get the id of coach to be commented
        var url = req.url;
        var coachid = url.substring(10);
        var content = req.param("comment");
        var rate = req.param('rate');
        var newComment  = new Comment();
        var date = new Date();
        newComment.coachid = coachid;
        newComment.comment.studentid = req.user._id;
        newComment.comment.nickname = req.user.local.nickname;
        newComment.comment.content = content;
        newComment.comment.date = date;
        newComment.save();
        
        // handle rate(each coach has to get at least 3 times rate in order to get grade)
        User.findOne({'_id': coachid}).exec(function(err, coach){
                if (!coach) {
                     res.direct('/')
           
                 }
                 else{
                if (coach.local.rate.studentlist.indexOf(req.user._id) == -1) {  
                        coach.local.rate.list.push(rate);
                        if (coach.local.rate.list.length >= 3) {
                                var total = 0;
                                for(var i = 0; i < coach.local.rate.list.length; i++) {
                                    total += coach.local.rate.list[i];
                                    }
                                var avg = (total / coach.local.rate.list.length).toFixed(2);
                                coach.local.rate.grade = avg;
                                }
                                
                                //add student to studentlist
                                coach.local.rate.studentlist.push(req.user._id);      
                        }
                coach.save();
                res.redirect('/users/'+coachid);
                 }
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
        newMessage.receiver.status= 0;
        newMessage.date = date;
        newMessage.save();
        
        res.redirect('/viewmessage/'+receiverid);
    });
    
    
    
    
    //user view contact list

    app.get('/messaging', isLoggedIn, function(req, res){

        //get contact list from database
         Message.find({'sender.id': req.user._id}).distinct('receiver.id').exec(function(err, receivers){
                     console.log(receivers);
            Message.find({'receiver.id': req.user._id}).distinct('sender.id').exec(function(err, senders){
                console.log(senders);
                for(i=0; i<senders.length; i++){
                    if (receivers.indexOf(senders[i]) == -1) {
                        receivers.push(senders[i]);
                        }
                } 
                Message.find({'receiver.id': req.user._id, 'receiver.status' : 0}).

                             distinct('sender.id').exec(function(err, unread){
                             
                                    User.find({ '_id': { $in: receivers } }, function(err, users){
                                   

                                        res.render('message.ejs', {   
                                                unreads : unread,
                                                targetid: null,
                                                contacters: users,
                                                user: req.user,
                                                conservations: null
                                                });
                                        });
                                });
                        });
            });
    });
    
    
    
    //user view all messages with one contact
    app.get('/viewmessage/*', isLoggedIn, function(req, res){
         var url = req.url;
         var contactid = url.substring(13);
         // get the contact list
      
        //find all messages between user and one contact
        Message.find({ $or: [{$and: [ { 'sender.id': req.user._id }, { 'receiver.id': contactid} ] },
                             {$and: [ { 'sender.id': contactid }, { 'receiver.id': req.user._id} ] }]
                     }).sort({'date': 1}).exec(function(err, conservations){
                //update message status
                Message.update({'sender.id': contactid, 'receiver.status':0}, {'receiver.status': 1},
                               {multi: true}, function(err){
                                Message.find({'sender.id': req.user._id}).distinct('receiver.id').exec(function(err, receivers){
                                        Message.find({'receiver.id': req.user._id}).distinct('sender.id').exec(function(err, senders){
                                                for(i=0; i<senders.length; i++){
                                                        if (receivers.indexOf(senders[i]) == -1) {
                                                                receivers.push(senders[i]);
                                                                }
                                                }
                                                //get the contact list from database
                                                Message.find({'receiver.id': req.user._id,
                                                             'receiver.status' : 0}).distinct('sender.id').exec(function(err, unread){
                                                        User.find({ '_id': { $in: receivers } }, function(err, users){
                                                                User.findOne({'_id': contactid}, function(err, targetuser){
                                                                        res.render('message.ejs',{
                                                                                unreads : unread,
                                                                                targetid:  contactid,
                                                                                conservations:conservations,
                                                                                user: req.user,
                                                                                contacters :users,
                                                                                targetuser: targetuser
                                                                                });
                                                                        });
                                                                });
                                                        });
                                                });
                                });
                        });
        });
    });


                                                         
    
    
    
    
    // =====================================
	// ADMIN LOGIN =========================
	// =====================================
	// show the admin-login form
	app.get('/admin', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('admin/adminlogin.ejs', { message: req.flash('loginMessage') });
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
            res.render('admin/admin.ejs', { message: req.flash('loginMessage') });
        } else {
            res.render('admin/adminlogin.ejs', { message: req.flash('loginMessage')});
        } 
	});
    
    //show the change password form
	app.get('/changepassword', isLoggedIn,  function(req, res){
		res.render('admin/changepassword.ejs' ,{
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

				var messageInfo = 'Success: you password has been changed.'
                res.render('admin/info.ejs', {
					message: messageInfo
					});
            }
		});													
	});
	
    
    //show the add user form
	app.get('/adduser', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/adduser.ejs');
        } else {
            res.render('admin/adminlogin.ejs', { message: req.flash('loginMessage')});
        };
	});
    
    //show the add stuent form
	app.get('/addstudent', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/addstudent.ejs', { message: req.flash('signupMessage')});
        } else {
            res.render('admin/adminlogin.ejs', { message: req.flash('loginMessage')});
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
                res.render('admin/addstudent.ejs', {message: ('signupMessage', 'That email is already taken.')});
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
				var messageInfo = 'Success: new user ' + newUser.local.email + ' has been added.';
                // save the user
                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    } else {
                        res.render('admin/info.ejs', {
						message: messageInfo
						});
                    }
                });
            }
        })
    });
    
    
    
    //show the add coach form
	app.get('/addcoach', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/addcoach.ejs', { message: req.flash('signupMessage')});
        } else {
            res.render('admin/adminlogin.ejs', { message: req.flash('loginMessage')});
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
                res.render('admin/addcoach.ejs', {message: ('signupMessage', 'That email is already taken.')});
            } else {
				// if there is no user with that email
                // create the user
                var newUser  = new User();

				// There are missing fields.
                if (req.param("coachtype") == "Offline" || req.param("coachtype") == "Both"){
                    if (req.param('streetAddress').length == 0 ||
                        req.param('city').length == 0 ||
                        req.param('province').length == 0){
                            return done(null, false, req.flash('signupMessage', 'Must enter all location fields if offline coach.'));
                    }
                    // obtain coordinates of address.
                    var urlAPIKey = "&key=AIzaSyA1IGuTcLPxARLu0f8zLHV5dyDx-6CbSa8";
                    var urlBeginning = "https://maps.googleapis.com/maps/api/geocode/json?address=";
                    var url = urlBeginning + req.param('streetAddress') + "+" + req.param('city') + "+"
                                           + req.param('province') + urlAPIKey; 
                    var jsonHTTP = new XMLHttpRequest();
                    jsonHTTP.open("GET", url, false);
                    jsonHTTP.send(null);
                    var result = JSON.parse(jsonHTTP.responseText);
                    if (result["status"] == "ZERO_RESULTS"){
                        return done(null, false, req.flash('signupMessage', 'Cannot find address'));
                    }
                    else {
                        newUser.local.coordinate.lat = result.results[0]["geometry"]["location"]["lat"];
                        newUser.local.coordinate.lng = result.results[0]["geometry"]["location"]["lng"];

                    }
                    //console.log(jsonHTTP.responseText); 
                    

                }
                

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(req.param('password')); // use the generateHash function in our user model
	            // parse the url
                newUser.local.nickname = req.param('nickname');
                newUser.local.occupation = 'coach';
                newUser.local.game = req.param('game');
                newUser.local.cost = req.param('cost');
                newUser.local.rate.grade = 0;
                newUser.local.rate.list = [];
                newUser.local.rate.studentlist=[];
                newUser.local.coachtype = req.param("coachtype");
                newUser.local.address.street = req.param('streetAddress');
                newUser.local.address.city = req.param('city');
                newUser.local.address.province = req.param('province');

                //read image file
                fs.readFile(req.files.photo.path, function(err, data){
                    var imageName = req.files.photo.name;
                    if(!imageName){
                        console.log("There was an error");
                    }else{
                        var newPath =  path.join(__dirname, '../public/tmp', imageName);
                        console.log(newPath);
                        fs.writeFile(newPath, data, function(err){
                            if (err) {
                                console.log("err");
                                }
                            });
                        }
                });
                
                //save the url to user photo field
                newUser.local.photo = '/tmp/'+ req.files.photo.name;
                  
                if (req.files.photo.name == '') {
                    newUser.local.photo = '';
                }
                
                else{   
                    //read image file
                    fs.readFile(req.files.photo.path, function(err, data){
                        var imageName = req.files.photo.name;
                        if(!imageName){
                            console.log("There was an error");
                        }else{
                            var newPath =  path.join(__dirname, '../public/tmp', email+imageName);
                            console.log(newPath);
                            fs.writeFile(newPath, data, function(err){
                                if (err) {
                                    console.log("err");
                                    }
                                });
                            }
                    });
                    //save the url to user photo field
                    newUser.local.photo = '/tmp/'+ email+req.files.photo.name;
                }
                

                // save the user
			    var messageInfo = 'Success: new user ' + newUser.local.email + ' has been added.';
				
                newUser.save(function(err) {
					if (err) {
						console.log('err');
                        throw err;
                    } else {
						console.log("message");
                        res.render('admin/info.ejs', {
						message: messageInfo
						});
                    }
                });
			};
        });
    })
	
	
	//dispaly all users
	app.get('/userslist', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
			User.find().
			sort('local.email').
			select('local.email local.nickname local.occupation').
			exec(function(err, users) {
				if (err) {
                    throw err
                }
				if (!users) {
                    res.render('admin/usersList.ejs', {
						message: "No user",
						users: null
					})
                } else {
					res.render('admin/usersList.ejs', {
						message: 'All users list',
						users: users
					})
				}
			})
        } else {
            res.render('admin/adminLogin.ejs', { message: req.flash('loginMessage')});
        }
	});
	
	
	//show the update user form
	app.get('/updateuser', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/selectUser.ejs', {message: req.flash('selectMessage')});
        } else {
            res.render('admin/adminLogin.ejs', { message: req.flash('loginMessage')});
        };
	});
	
	// process the select user form
    app.post('/selectuser', function(req, res) {
        var email = req.param('email');
        
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return next(err)
            // check to see if theres is a user with that email
            if (!user) {
                res.render('admin/selectUser.ejs', {message: ('selectMessage', 'This user does not exist')});
            } else {
                // user exists, go to update the user's info
                if (user.local.occupation == 'student') {
                    res.render('admin/updateStudent.ejs', {
						user: user
						})
                };
				if (user.local.occupation == 'coach') {
                    res.render('admin/updateCoach.ejs', {
						user: user
						})
                };
			};
		});
	})
	
	// process the updatestudent form
	app.post('/updatestudent', function(req, res){
		var email = req.param('email');
		
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
			res.render('studentprofile.ejs', {
				user: user
			})
		});														
	});
	
	// process coach update form
	app.post('/updatecoach', function(req, res){
		var email = req.param('email');
		//update database
		User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err) {
                return next(err);
                //code
            }
            
			if (req.param('password') != '') {
                user.local.password = user.generateHash(req.param('password'));     
            }
            
            if (req.param('streetAddress') != '') {
                user.local.address.street = req.param('streetAddress');
            }
			if (req.param('city') != '') {
                user.local.address.city = req.param('city');
            }
			if (req.param('province') != '') {
                user.local.address.province = req.param('province');
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
			res.render('coachprofile.ejs', {
				user: user,
				comments: null
			});
		});														
	});
	
    
	//show the delete user form
	app.get('/deleteuser', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/deleteUser.ejs', {message: req.flash('deleteMessage')});
        } else {
            res.render('admin/adminLogin.ejs', { message: req.flash('loginMessage')});
        };
	});
    
	
	// process the delete user form
    app.post('/deleteuser', function(req, res) {
        var email = req.param('email');
        
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return next(err)
            // check to see if theres is a user with that email
            if (!user) {
                res.render('admin/deleteUser.ejs', {message: ('deleteMessage', 'This user does not exist')});
            } else {
                // user exists, delete the user
				user.remove();
				var messageInfo = 'Success: user ' + user.local.email + ' has been deleted.'
				res.render('admin/info', {
					message: messageInfo
					});
				
			};
		});
	})
	
	//show the delete comment form
	app.get('/deletecomment', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/deleteComment.ejs', {message: req.flash('deleteCommentMessage')});
        } else {
            res.render('admin/adminLogin.ejs', { message: req.flash('loginMessage')});
        };
	});
	
	// process the delete comment form
    app.post('/deletecomment', function(req, res) {
        var commentId = req.param('commentId');
        
        Comment.findOne({ '_id' :  commentId }, function(err, comment) {
            // if there are any errors, return the error
            if (err)
                throw err
            // check to see if theres is a comment with that id
            if (!comment) {
                res.render('admin/deleteComment.ejs', {
					message: ('deleteCommentMessage', 'This comment does not exist')
					});
            } else {
                // comment exists, delete the comment
				comment.remove();
				var messageInfo = 'Success: comment with id ' + commentId + ' has been deleted';
				res.render('admin/info', {
					message: messageInfo
					});
				
			};
		});
	})
	
	//dispaly all comments
	app.get('/commentslist', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
			Comment.find().
			//sort('comment.date').
			//select('_id comment.nickname comment.date comment.content').
			exec(function(err, comments) {
				if (err) {
                    throw err
                }
				if (!comments) {
                    res.render('admin/commentsList.ejs', {
						message: "No comment",
						comments: null
					})
                } else {
					res.render('admin/commentsList.ejs', {
						message: 'All comments list',
						comments: comments
					})
				}
			})
        } else {
            res.render('admin/adminLogin.ejs', { message: req.flash('loginMessage')});
        }
	});
	
	//dispaly all messages
	app.get('/messageslist', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
			Message.find().
			sort('-date').
			//select('_id date receiver.id sender.id sender.content').
			exec(function(err, messages) {
				if (err) {
                    throw err
                }
				if (messages == null) {
                    res.render('admin/messageslist.ejs', {
						message: "No message",
						messages: null
					})
                } else {
					res.render('admin/messageslist.ejs', {
						message: 'All messages list',
						messages: messages
					})
				}
			})
        } else {
            res.render('admin/adminLogin.ejs', { message: req.flash('loginMessage')});
        }
	});
	
	//show the delete message form
	app.get('/deletemessage', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/deleteMessage.ejs', {message: req.flash('deleteMessage')});
        } else {
            res.render('admin/adminLogin.ejs', { message: req.flash('loginMessage')});
        };
	});
	
	// process the delete message form
    app.post('/deletemessage', function(req, res) {
        var messageId = req.param('messageId');
        
        Message.findOne({ '_id' :  messageId }, function(err, message) {
            // if there are any errors, return the error
            if (err)
                throw err
            // check to see if theres is a message with that id
            if (!message) {
                res.render('admin/deleteMessage.ejs', {
					message: ('deleteMessage', 'This message does not exist')
					});
            } else {
                // comment exists, delete the comment
				message.remove();
				var messageinfo = 'Success: message with id ' + messageId + ' has been deleted';
				res.render('admin/info', {
					message: messageinfo
					});
			};
		});
	})
	
	
	//show the delete all messages form
	app.get('/deleteallmessages', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/deleteallmessages.ejs', {message: req.flash('deleteMessages')});
        } else {
            res.render('admin/adminlogin.ejs', { message: req.flash('loginMessage')});
        };
	});
	
	// process the delete all messages form
    app.post('/deleteallmessages', function(req, res) {
        Message.remove(function(err) {
            // if there are any errors, return the error
            if (err) {
                throw err
            } else {
				var messageinfo = 'Success: all messages have been deleted';
				res.render('admin/info', {
					message: messageinfo
					});
			};
		});
	})
	
	//show the delete all comments form
	app.get('/deleteallcomments', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/deleteallcomments.ejs', {message: req.flash('deleteComments')});
        } else {
            res.render('admin/adminlogin.ejs', { message: req.flash('loginMessage')});
        };
	});
	
	// process the delete all messages form
    app.post('/deleteallcomments', function(req, res) {
        Comment.remove(function(err) {
            // if there are any errors, return the error
            if (err) {
                throw err
            } else {
				var messageinfo = 'Success: all comments have been deleted';
				res.render('admin/info', {
					message: messageinfo
					});
			};
		});
	})
	
	//show the delete all users form
	app.get('/deleteallusers', isLoggedIn,  function(req, res){
        if (req.user.local.email == 'admin@bemaster.com') {
            res.render('admin/deleteallusers.ejs', {message: req.flash('deleteComments')});
        } else {
            res.render('admin/adminlogin.ejs', { message: req.flash('loginMessage')});
        };
	});
	
	// process the delete all users form
    app.post('/deleteallusers', function(req, res) {
        User.remove(function(err) {
            // if there are any errors, return the error
            if (err) {
                throw err
            } else {
				var admin = new User();
                admin.local.email = "admin@bemaster.com"
                admin.local.password = admin.generateHash('admin');
                admin.local.nickname = "TeamCSC309";
				admin.local.occupation = "administrator"
                admin.save();
				
				req.login(admin, function(err) {
				    if (err) console.log(err)
			        });
				
				var messageinfo = 'Success: all users have been deleted';
				res.render('admin/info', {
					message: messageinfo
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
