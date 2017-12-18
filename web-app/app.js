'use strict'

require('dotenv').config()

let googleCloud = process.env.GOOGLE_CLOUD;
if (googleCloud && (googleCloud.toLowerCase() === 'true')){
  require('@google-cloud/debug-agent').start();
}

var express = require('express');
var bodyParser = require('body-parser');
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
    let choices = req.body.options;
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

app.get('/poll/:id', function(req, res){
  var id = req.params.id;
  var token = req.query.token;
  if (!id || !token){
    writeGenericError(res);
    return;
  }
  if (PollsService.validatePollToken(id, token)){
    pollsRepo.getPollById(id).then(function(poll){
      return poll.toModel();
    })
    .then(function(pollModel){
      res.json({poll: pollModel});
    }, function(reason){
      writeGenericError(res);
    })
  }
  else{
    res.json({error: {message: "You are not authorized to view this poll."}});
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
      writeGenericError(res);
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
        PollsService.tryClosePollOfId(ballot.pollId, true);
      });
    }
  }, function(reason){
      writeGenericError(res);
  });
});

app.post('/closePoll/:id/', function(req, res){
  var id = req.params.id;
  var token = req.query.token;
  if (!id || !token){
    writeGenericError(res);
    return;
  }
  if (!PollsService.validatePollToken(id, token)){
    res.json({error: {message: "You are not authorized to close this poll."}});
    return;
  }
  PollsService.tryClosePollOfId(id)
  .then(function(winner){
    res.json({winner: winner});
  }, function(reason){
    if (reason.userMessage){
      res.json({error:{message: reason.userMessage}});
      return;
    }
    writeGenericError(res);
  });
});


app.listen(process.env.PORT || 8080);
