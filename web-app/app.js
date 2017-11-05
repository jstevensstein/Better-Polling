'use strict'

require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');

var PollsService = require('./pollsService.js');
var pollsRepo = require('./dataAccess/pollsRepository.js');

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/vendor", express.static(path.join(__dirname, "vendor")));


app.get('/', function(req, res) {
  res.render("index");
});

app.post('/createpoll', urlencodedParser, function(req, res){
  PollsService.createPollAndBallotsAndSendEmails(
    req.body.name, req.body.owner, req.body.choices, req.body.emails
  ).then(function(){
    res.status(200).end();
  }, function(reason){
    console.log(reason);
    res.status(500).json({error: "There was an error creating your poll."});
  });
});

app.get('/ballot/:id', function(req, res){
  var id = req.params.id;
  var email = req.params.email;
  var token = req.query.token;
  if (PollsService.validateBallotToken(id, token)){
    pollsRepo.getBallotById(id).then(function(ballot){
      return ballot.toModel();
    })
    .then(function(ballotModel){
      res.render("vote", {ballot: ballotModel});
    },
    function(reason){
      //TODO: unauthorized view
      res.status(500).end();
    });
  }
  else{
    //TODO: unexpected error view
    res.status(403).json({status:"error", message: "You are not authorized to view this poll."});
  }
});

app.post('/ballot/:id/', urlencodedParser, function(req, res){
  var id = req.params.id;
  var token = req.query.token;
  if (PollsService.validateBallotToken(id, token)) {
    var order = req.body.order;
    pollsRepo.submitBallot(id, order)
    .then(function(){
      res.status(200).end();
      pollsRepo.getBallotById(id)
      .then(function(ballot){
        PollsService.determineWinnerAndSendEmailIfBallotsComplete(ballot.pollId);
      })
    }, function(reason){
      console.log(reason);
      res.status(500).end();
    })
  }
  else{
    res.status(403).json({status:"error", message: "You are not authorized to submit this ballot."});
  }
});


app.listen(3000);