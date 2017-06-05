var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);	//socket server which integrates with (mounts on) http server
var hbs = require('express-handlebars');
var handlebars = require('handlebars');
var helpers = require('handlebars-form-helpers').register(handlebars);

//app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));
var portnumber = process.env.PORT || 8080;

app.engine('hbs',hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname+'/views'}));//first argument is engine name which can be anything
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.get('/', function(req, res){
  res.render('index');
});

app.get('/:id/:playas',function(req,res){
  console.log(req.params);
  res.render('index', {id: req.params.id,
    playas: req.params.playas
  });
  //res.status(200).send(html);
})

var code_room = {};
var users = {};	//users list

io.on('connection', function(socket){
  console.log('a user connected');

  //when the client emits play, this listenes and executes
  socket.on('create',function(uniquekey){

  	socket.uniquekey = uniquekey;	//a unique key corresponding to this game

    code_room[uniquekey] = uniquekey;
  	socket.room = code_room[uniquekey];
    console.log(socket.room);

  	//send client to room game_room[uniquekey]
  	socket.join(code_room[uniquekey]);

  	//echo to client they have connected!
  	socket.emit('updatechat','SERVER','You have connected to room' + code_room[uniquekey]);

  	//echo to room1 that a person has connected to room1
  	socket.broadcast.to(code_room[uniquekey]).emit('updatechat','SERVER',"user_name" + 'has created this room');

  	//socket.emit('updaterooms',rooms,'room1');

  });



  //when the client emits join, this listenes and executes
  socket.on('join',function(uniquekey){

  	//stores the username in socket session for this client
  	console.log(uniquekey);
  //	socket.username = user_name;
  	//send client to room1
    socket.room = code_room[uniquekey];
  	socket.join(code_room[uniquekey]);
    console.log(socket.room);

  	//echo to client they have connected!
  	socket.emit('updatechat','SERVER','You have connected to '+ code_room[uniquekey]);

  	//echo to room1 that a person has connected to room1

  	socket.broadcast.to(code_room[uniquekey]).emit('updatechat','SERVER',"user_name" + 'has joined this room');

  //	socket.emit('updaterooms',rooms,'room1');

  });


  //when the client emits send move, this listenes and executes
  socket.on('sendcode',function(code, uniquekey){

  	//we tell the client to execute 'updateboard' with the parameters
  	console.log(code);
   // console.log(game_room[uniquekey]);
  	socket.broadcast.to(code_room[uniquekey]).emit('updatecode', code);

  });


  socket.on('whosechance',function(curruser, uniquekey){
    console.log('in whose chance');
    socket.broadcast.to(code_room[uniquekey]).emit('flipchance',curruser);
  })

  //when the user disonnects... perform this
  socket.on('disonnect',function(){
  	//echo globally that this client has left
  	socket.broadcast.emit('updatechat','SERVER', " disonnected");
  	socket.leave(socket.room);
  });


});

http.listen(portnumber, function(){
  console.log('listening on *:8080');
});