'use strict'

var sha3_512 = require('js-sha3').sha3_512;
var pollsRepo = require('./dataAccess/pollsRepository.js')
var caritat = require('caritat');

var Mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

function PollsService(){
    var SenderAddress = process.env.MJ_SENDER_ADDRESS;
    var Secret = process.env.SECRET;
    var BaseUrl = process.env.ANGULAR_BASE_URL;

    this.validateBallotToken = function(ballotId, token){
        return token == generateBallotToken(ballotId);
    }

    function generateBallotToken(ballotId){
        return sha3_512(ballotId + Secret);
    }

    function generateBallotUrl(ballotId){
        return `${BaseUrl}/ballot/${ballotId}?token=${generateBallotToken(ballotId)}`;
    }

    function sendEmailForBallot(ballotId, pollName, email){
        let ballotUrl = generateBallotUrl(ballotId);
        var options = {
            'Recipients': [{ Email: email }],
            'FromEmail': SenderAddress,
            'Subject': pollName,
            // Body
            'Text-part':
              `You have been invited to participate in the poll \'${pollName}\'.\n
              Please vote at ${ballotUrl}`,

            'Html-part':
              `
              You have been invited to participate in the poll
              <b>${pollName}</b>.
              Please vote <a href="${ballotUrl}">here</a>.`
        };

        var sendEmail = Mailjet.post('send');

        sendEmail.request(options)
            .then(function(response, body){

            })
            .catch(function(reason){

            });

    }

    this.createPollAndBallotsAndSendEmails = function(name, owner, choices, emails){
        return pollsRepo.createPoll(name, owner, choices)
        .then(function(id){
            let pollId = id;
            let ballotPromises = [];
            emails.forEach(function(email){
                ballotPromises.push(
                    pollsRepo.addBallot(pollId, email)
                    .then(function(ballotId){
                        sendEmailForBallot(ballotId, name, email);
                    })
                );
            });
            return Promise.all(ballotPromises);
        });
    }

    function sendWinnerEmail(pollName, winnerName, email){
        var options = {
            'Recipients': [{ Email: email }],
            'FromEmail': SenderAddress,
            'Subject': `${pollName} Results`,
            // Body
            'Text-part': `The winner of the poll is ${winnerName}.`
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

    function sendWinnerEmails(pollName, winnerName, emails){
        emails.forEach(function(email){
            sendWinnerEmail(pollName, winnerName, email);
        });
    }

    this.determineWinnerAndSendEmailIfBallotsComplete = function(pollId){
        var poll;
        var winnerId;
        var winnerOption;
        var ballots;
        return pollsRepo.getPollById(pollId).then(function(p){
            poll = p;
            return pollsRepo.getBallotsForPoll(pollId)
        }).then(function(b){
            ballots = b;
            if (ballots.some(function(ballot){return !ballot.complete;})){
                console.log('There are incomplete ballots!')
                return;
            }
            console.log('Calculating the winner and sending results because all ballots are complete');
            return Promise.all(ballots.map(b => b.choices))
            .then(function(ballotsChoices){
                let candidates = [];
                for (let i = 0; i<ballotsChoices[0].length; i++){
                    candidates.push(i.toString());
                }
                let election = new caritat.Election({
                  candidates: candidates
                });
                ballotsChoices.forEach(function(choices){
                    election.addBallot(choices.map(c => c.toString()));
                });
                let winner = caritat.condorcet.winner(election);
                if (winner){
                    winnerId = parseInt(winner);
                }
                else{
                    winnerId = parseInt(caritat.irv(election));
                }
                return pollsRepo.updatePoll(poll.id, {closed: 1, winner: winnerId});
            }).then(function(){
                return poll.options;
            }).then(function(options){
                winnerOption = options.find(function(elt){return elt.id == winnerId});
                console.log('The winner is ' + winnerOption.name);
                sendWinnerEmails(poll.name, winnerOption.name, ballots.map(function(b){return b.email;}));
            });
        });
    }
}

module.exports = new PollsService();
