var mysql = require('promise-mysql');
var sha3_512 = require('js-sha3').sha3_512;
var Mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

PollsService = function(){
    var SenderAddress = process.env.MJ_SENDER_ADDRESS;
    var Secret = process.env.SECRET;

    let connPromise = mysql.createConnection({
        host:       process.env.MYSQL_HOST,
        user:       process.env.MYSQL_USER,
        password:   process.env.MYSQL_PASSWORD,
        database:   'pollingdb'
    });

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

    function getPollById(id){
        var poll;
        var connection;
        return connPromise.then(function(conn){
            connection = conn;
            return connection.query('select * from `poll` where `id` = ?', [id]);
        })
        .then(function(rows){
            poll = rows[0];
            if (poll){
                return connection.query('select * from `poll_option` where `poll_id` = ?', [id]);
            }
            return Promise.reject('There is no such poll');
        })
        .then(function(rows){
            if (rows){
                options = [];
                rows.forEach(function(element){
                    options.push({id: element.id, name: element.name});
                });
                poll.options = options;
                return poll;
            }
            return Promise.reject('There are no options for this poll')
        });
    }

    this.getPollById = getPollById;


    function createPoll(name, choices){
        var connection;
        return connPromise.then(function(conn){
            connection = conn;
            var pollId;
            return connection.beginTransaction();
        })
        .then(function(){
            return connection.query('insert into poll set ?', {name: name});
        }).then(function(results){
            let choicesPromises = [];
            pollId = results.insertId;
            choices.forEach(function(element, index){
                choicesPromises.push(
                    connection.query('insert into poll_option set ?', {poll_id: pollId, id: index, name: element, })
                );
            });
            return Promise.all(choicesPromises);
        }).then(values => {
            return connection.commit();
        }).then(values =>{
            return Promise.resolve(pollId);
        }, reason =>{
            return connection.rollback()
            .then(function(){
                return Promise.reject(reason);
            });
        });
    }



    this.getBallotById = function(id){
        var connection;
        var ballot = {
            complete: false
        };
        return connPromise.then(function(conn){
            connection = conn;
            return connection.beginTransaction();
        }).then(function(){
            return connection.query('select * from `ballot` where `id` = ?', [id]);
        }).then(function(rows){
            let record = rows[0];
            ballot.complete = !!record.complete;
            if (ballot.complete){
                
            }
            else{
                return getPollById(record.poll_id).then(function(poll){
                    ballot.options = poll.options;
                    return ballot;
                })

            }
        });
        
    }

    this.upsertBallot = function(id, order){
        var poll;
        var connection;
        return connPromise.then(function(conn){
            connection = conn;
            return connection.beginTransaction();
        }).then(function(){
            return connection.query('delete from `ballot_choice` where `ballot_id` = ?', [id]);
        }).then(function(){
            let ballotPromises = [];
            order.forEach(function(element, index){
                ballotPromises.push(
                    connection.query('insert into `ballot_choice` set ?', {ballot_id: id, poll_option_id: element, priority: index })
                );
            });
            return Promise.all(ballotPromises);
        }).then(function(){
            return connection.commit();
        }).then(function(){
            return Promise.resolve();
        }, function(reason){
            return connection.rollback()
            .then(function(){
                return Promise.reject(reason);
            });
        });
    }

    this.createPollAndBallotsAndSendEmails = function(choices, emails){
        return createPoll('name', choices)
        .then(function(id){
            pollId = id;
            var ballotPromises = [];
            emails.forEach(function(email){
                ballotPromises.push(
                    upsertBallot(id, email)
                    .then(function(ballotId){
                        sendEmailForBallot(ballotId, email);
                    })
                );
            });
            return Promise.all(ballotPromises);
        });
    }
}

module.exports = new PollsService();