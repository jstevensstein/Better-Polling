'use strict'

require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var cors = require('cors');

var PollsService = require('./pollsService.js');
var pollsRepo = require('./dataAccess/pollsRepository.js');

var app = express();

var whitelist = [process.env.ANGULAR_ORIGIN];
var corsOptions = {
  origin: whitelist,
  methods: "GET,POST,OPTIONS"
};

var myCors = cors(corsOptions);
app.use(myCors);

app.use(bodyParser.json());

var genericErrorMessage = 'An unexpected error occurred';

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/vendor", express.static(path.join(__dirname, "vendor")));

app.get('/', function(req, res) {
  res.render("index");
});

app.post('/createpoll', function(req, res){
  PollsService.createPollAndBallotsAndSendEmails(
    req.body.name, req.body.owner, req.body.choices, req.body.emails
  ).then(function(){
    res.json({});
  }, function(reason){
    console.log(reason);
    res.json({error: genericErrorMessage});
  });
});

app.get('/ballot/:id', function(req, res){
  var id = req.params.id;
  var token = req.query.token;
  if (PollsService.validateBallotToken(id, token)){
    pollsRepo.getBallotById(id).then(function(ballot){
      return ballot.toModel();
    })
    .then(function(ballotModel){
      res.json({ballot: ballotModel});
    },
    function(reason){
      //TODO: unexpected error view
      res.json({error: {message: genericErrorMessage}})
    });
  }
  else{
    //TODO: unauthorized view
    res.json({error: {message: "You are not authorized to view this ballot."}});
  }
});

app.post('/ballot/:id/', function(req, res){
  var id = req.params.id;
  var token = req.query.token;
  if (PollsService.validateBallotToken(id, token)) {
    var order = req.body.order;
    pollsRepo.submitBallot(id, order)
    .then(function(){
      res.end();
      pollsRepo.getBallotById(id)
      .then(function(ballot){
        PollsService.determineWinnerAndSendEmailIfBallotsComplete(ballot.pollId);
      })
    }, function(reason){
      console.log(reason);
      res.json({error: {message: genericErrorMessage}})
    })
  }
  else{
    res.json({error: {message: "You are not authorized to submit this ballot."}});
  }
});


app.listen(3000);
