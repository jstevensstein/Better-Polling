'use strict'


var sha3_512 = require('js-sha3').sha3_512;
var pollsRepo = require('./dataAccess/pollsRepository.js')
//var caritat = require('caritat');
var Mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

function PollsService(){
    var SenderAddress = process.env.MJ_SENDER_ADDRESS;
    var Secret = process.env.SECRET;

    this.validateBallotToken = function(ballotId, token){
        return token == generateBallotToken(ballotId);
    }

    function generateBallotToken(ballotId){
        return sha3_512(ballotId + Secret);
    }

    function generateBallotUrl(ballotId){
        return 'http://localhost:3000/ballot/' + ballotId +'?token=' + generateBallotToken(ballotId);
    }

    function sendEmailForBallot(ballotId, email){
        //use email as salt; this and the secret will provide enough security for our purposes
        
        let ballotUrl = generateBallotUrl(ballotId);
        var options = {
            'Recipients': [{ Email: email }],
            'FromEmail': SenderAddress,
            // Subject
            'Subject': 'You have been invited to participate in a Better Poll!',
            // Body
            'Text-part': 'Please vote at '  + ballotUrl,
            'Html-part': '<h3>Please vote <a href="' + ballotUrl +'">here</a></h3>'
        };

        var sendEmail = Mailjet.post('send');

        sendEmail.request(options)
            .then(function(response, body){
                //console.log(response);
            })
            .catch(function(reason){
                //console.log(reason);
            });

    }

    this.createPollAndBallotsAndSendEmails = function(choices, emails){
        return pollsRepo.createPoll('name', choices)
        .then(function(id){
            let pollId = id;
            let ballotPromises = [];
            emails.forEach(function(email){
                ballotPromises.push(
                    pollsRepo.addBallot(id, email)
                    .then(function(ballotId){
                        sendEmailForBallot(ballotId, email);
                    })
                );
            });
            return Promise.all(ballotPromises);
        });
    }

    this.determineWinnerAndSendEmailIfBallotsComplete = function(pollId){
        pollsRepo.allBallotsComplete(pollId)
        .then(function(complete){
            if (complete){
                console.log('Calculating the winner and sending results because all ballots are complete');
                //send emails
            }
            else{
                console.log('There are incomplete ballots!')
            }
        });
    }
}

module.exports = new PollsService();
