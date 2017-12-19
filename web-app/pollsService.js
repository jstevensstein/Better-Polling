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

    function generateBallotToken(id){
        return sha3_512(`ballot${id}${Secret}`);
    }

    function generateBallotUrl(id){
        return `${BaseUrl}/ballot/${id}?token=${generateBallotToken(id)}`;
    }

    this.validatePollToken = function(pollId, token){
        return token == generatePollToken(pollId);
    }

    function generatePollToken(id){
        return sha3_512(`poll${id}${Secret}`);
    }

    function generatePollUrl(id){
        return `${BaseUrl}/poll/${id}?token=${generatePollToken(id)}`;
    }

    function sendEmailForBallot(ballotId, pollName, email){
        let ballotUrl = generateBallotUrl(ballotId);
        var options = {
            'Recipients': [{ Email: email }],
            'FromEmail': SenderAddress,
            'Subject': pollName,
            // Body
            'Text-part':
              `You have been invited to participate in the poll \'${pollName}\'.

              Please vote at ${ballotUrl}`,

            'Html-part':
              `
              You have been invited to participate in the poll
              <b>${pollName}</b>.
              Please vote <a href="${ballotUrl}">here</a>.`
        };

        var sendEmail = Mailjet.post('send');
        return sendEmail.request(options);
    }

    function sendEmailForPoll(pollId, pollName, email){
        let pollUrl = generatePollUrl(pollId);
        var options = {
            'Recipients': [{ Email: email }],
            'FromEmail': SenderAddress,
            'Subject': `${pollName} management`,
            // Body
            'Text-part':
              `You have successfully created the poll \'${pollName}\'.\n
              You can manage your poll at ${pollUrl}`,

            'Html-part':
              `
              You have successfully created the poll
              <b>${pollName}</b>.
              You can manage your poll <a href="${pollUrl}">here</a>.`
        };

        var sendEmail = Mailjet.post('send');

        return sendEmail.request(options);
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
                        sendEmailForBallot(ballotId, name, email)
                        .catch(function(reason){
                            pollsRepo.updateBallot(ballotId, {delivered: false});
                        });
                    })
                );
            });
            sendEmailForPoll(id, name, owner);
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

        sendEmail.request(options);
    }

    function sendWinnerEmails(pollName, winnerName, emails){
        emails.forEach(function(email){
            sendWinnerEmail(pollName, winnerName, email);
        });
    }

    function tryClosePoll(poll, needAllBallots = false){
        if (poll.winner){
          return Promise.resolve(false);
        }
        var winnerId;
        var winnerOption;
        var ballots;
        return pollsRepo.getBallotsForPoll(poll.id)
        .then(function(b){
            ballots = b;
            if(!ballots.some(b => b.complete)){
                return Promise.reject({userMessage: "There are no complete ballots. The poll cannot be closed."});
            }
            if (needAllBallots && ballots.some(function(ballot){return !ballot.complete;})){
                return;
            }
            return Promise.all(ballots.filter(b => b.complete).map(b => b.choices))
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
                sendWinnerEmails(poll.name, winnerOption.name, ballots.map(function(b){return b.email;}));
                return winnerOption.name;
            });
        });
    }

    this.tryClosePollOfId = function(id, needAllBallots = false){
      return pollsRepo.getPollById(id)
      .then(function(poll){
        return tryClosePoll(poll, needAllBallots);
      });
    }
}

module.exports = new PollsService();
