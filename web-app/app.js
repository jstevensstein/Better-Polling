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

app.post('/createpoll', urlencodedParser, function(req, res){
  PollsService.createPollAndBallotsAndSendEmails(req.body.choices, req.body.emails)
  .then(function(){
    res.status(200).json(null);
  }, function(reason){
    console.log(reason);
    res.status(500).send(null);
  });
});

app.get('/ballot/:id', function(req, res){
  var id = req.params.id;
  var email = req.params.email;
  var token = req.query.token;
  if (PollsService.validateBallotToken(id, token)){
    PollsService.getBallotById(id).then(function(ballot){
      res.render("vote", {ballot: ballot});
    },
    function(reason){
      res.status(500).send(reason);
    });
  }
  else{
    res.status(403).send(null);
  }
});

app.post('/ballot/:id/', urlencodedParser, function(req, res){
  var id = req.params.id;
  var token = req.query.token;
  if (PollsService.validateBallotToken(id, token)) {
    var order = req.body.order;
    PollsService.upsertBallotChoices(id, order)
    .then(function(){
      res.status(200).json(null);
      PollsService.getBallotById(id)
      .then(function(ballot){
        debugger;
        PollsService.determineWinnerAndSendEmailIfBallotsComplete(ballot.pollId);
      })
    }, function(reason){
      console.log(reason);
      res.status(500).send(null);
    })
  }
  else{
    res.status(403).send(null);
  }
});


app.listen(3000);