var r = require('rethinkdb');
var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);	//socket server which integrates with (mounts on) http server
var hbs = require('express-handlebars');

app.use(express.static(__dirname + '/public'));
var portnumber = process.env.PORT || 8080;

app.engine('hbs',hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname+'/views'}));//first argument is engine name which can be anything
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//setting up a rethinkdb database
r.connect({host:'localhost',port:28015}, function(err, conn){
  if(err)
    throw err;
  r.db('test').tableList().run(conn, function(err, response){
    if(response.indexOf('edit') > -1){
      //do nothing..... table is already created
      console.log('Table exists,... Skipping create');
      console.log('Tables-' + response);
    }
    else
    {
      //create table....
      console.log('Table does not exist... creating');
      r.db('test').tableCreate('edit').run(conn);
    }
  });
});

//socket.io stuff here
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log(' a user disconnected');
  })
});















app.get('/', function(req, res){
  var id = Math.random().toString(36).slice(2);
  console.log('here');
  res.redirect('/'+id);
});

app.get('/:id',function(req,res){
  console.log(req.params);
  res.render('index', {id: req.params.id
  });
  //res.status(200).send(html);
})



http.listen(portnumber,process.env.IP, function(){
  console.log('listening on *:' + '172.16.170.72' + ":" + portnumber);
});