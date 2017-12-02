'use strict'

require('dotenv').config()

var express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors');

var PollsService = require('./pollsService.js');
var pollsRepo = require('./dataAccess/pollsRepository.js');

var app = express();

app.enable('trust proxy');

var helmet = require('helmet');
app.use(helmet());
app.disable('x-powered-by');

var whitelist = [process.env.ANGULAR_ORIGIN];
var corsOptions = {
  origin: whitelist,
  methods: "GET,POST,OPTIONS"
};

var myCors = cors(corsOptions);
app.use(myCors);

app.use(bodyParser.json());

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const GENERIC_ERROR_MESSAGE = 'An unexpected error occurred';

function writeGenericError(res){
  res.json({error: GENERIC_ERROR_MESSAGE});
}

function writeEmptyJson(res){
  res.json({});
}

app.post('/createpoll', function(req, res){
  try{
    let name = req.body.name;
    if (!name){
      writeGenericError(res);
      return;
    }
    let owner = req.body.owner;
    if (!owner || !owner.match(EMAIL_REGEX)){
      writeGenericError(res);
      return;
    }
    let emails = req.body.emails;
    let match = emails.map(e => e.match(EMAIL_REGEX));
    let validEmails = emails.filter(function(_, index){
      return match[index];
    });
    let invalidEmails = emails.filter(function(_, index){
      return !match[index];
    });
    let choices = req.body.choices;
    if (!choices || choices.length < 2){
      writeGenericError(res);
      return;
    }
    PollsService.createPollAndBallotsAndSendEmails(
      name, owner, choices, validEmails
    ).then(function(){
      if (invalidEmails.length){
        writeGenericError(res);
        return;
      }
      else{
        writeEmptyJson(res);
        return;
      }
    }, function(reason){
      console.log(reason);
      writeGenericError(res);
      return;
    });
  }
  catch(err){
    //log error;
    writeGenericError(res);
    return;
  }
});

app.get('/ballot/:id', function(req, res){
  var id = req.params.id;
  var token = req.query.token;
  if (!id || !token){
    writeGenericError(res);
    return;
  }
  if (PollsService.validateBallotToken(id, token)){
    pollsRepo.getBallotById(id).then(function(ballot){
      return ballot.toModel();
    })
    .then(function(ballotModel){
      res.json({ballot: ballotModel});
    },
    function(reason){
      res.json({error: {message: GENERIC_ERROR_MESSAGE}})
    });
  }
  else{
    res.json({error: {message: "You are not authorized to view this ballot."}});
  }
});

app.post('/ballot/:id/', function(req, res){
  var id = req.params.id;
  var token = req.query.token;
  var ballot;
  if (!id || !token){
    writeGenericError(res);
    return;
  }
  if (!PollsService.validateBallotToken(id, token)) {
    res.json({error: {message: "You are not authorized to submit this ballot."}});
    return;
  }
  pollsRepo.getBallotById(id)
  .then(function(b){
    ballot = b;
    return ballot.poll;
  })
  .then(function(poll){
    if (poll.closed){
      res.json({error: {message: "Voting on this poll is closed."}});
      return;
    }
    else {
      var order = req.body.order;

      return pollsRepo.submitBallot(id, order)
      .then(function(){
        res.json({});
        PollsService.determineWinnerAndSendEmailIfBallotsComplete(ballot.pollId);
      });
    }
  }, function(reason){
    res.json({error: {message: GENERIC_ERROR_MESSAGE}})
  });
});


app.listen(process.env.PORT || 8080);
