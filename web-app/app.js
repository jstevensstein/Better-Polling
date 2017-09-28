require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');

var PollsService = require('./pollsService.js');

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/vendor", express.static(path.join(__dirname, "vendor")));


app.get('/', function(req, res) {
  res.render("index");
});

app.get('/vote/poll/:id/email/:email', function(req, res){
  var id = req.params.id;
  var email = req.params.email;
  var token = req.query.token;
  if (PollsService.validateBallotToken(id, email, token)){
    PollsService.getPollById(id).then(function(poll){
      res.render("vote", {poll: poll});
    },
    function(reason){
      res.status(500).send(reason);
    });
  }
  else{
    res.status(403).send(null);
  }
});

app.post('/createpoll', urlencodedParser, function(req, res){
  PollsService.createPoll('name', req.body.choices)
  .then(function(id){
    PollsService.sendEmailsForPoll(id, req.body.emails);
    res.status(200).json(null);
  }, function(reason){
    res.status(500).send(null);
  });
});

app.listen(3000);