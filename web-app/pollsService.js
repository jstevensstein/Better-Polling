var mysql = require('promise-mysql');
var sha3_512 = require('js-sha3').sha3_512;
var Mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

PollsService = function(){
    var SenderAddress = process.env.MJ_SENDER_ADDRESS;

    let connPromise = mysql.createConnection({
        host:       process.env.MYSQL_HOST,
        user:       process.env.MYSQL_USER,
        password:   process.env.MYSQL_PASSWORD,
        database:   'pollingdb'
    });


    this.createPoll = function(name, choices){

        return connPromise.then(function(conn){
            var connection = conn;
            var pollId;
            return connection.beginTransaction()
            .then(function(){
                return connection.query('INSERT INTO poll set ?', {name: name});
            }).then(function(results){
                let choicesPromises = [];
                pollId = results.insertId;
                choices.forEach(function(element, index){
                    choicesPromises.push(
                        connection.query('INSERT INTO poll_option set ?', {poll_id: pollId, id: index, name: element, })
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
        });
    }

    this.sendEmailsForPoll = function(pollId, emails){
        //use email as salt; this and the secret will provide enough security for our purposes
        var secret = process.env.SECRET;
        emails.forEach(function(email){
            let token = sha3_512(pollId + email);
            var options = {
                'Recipients': [{ Email: email }],
                'FromEmail': SenderAddress,
                // Subject
                'Subject': 'Hello World!',
                // Body
                'Text-part': 'Mailjet on Google App Engine with Node.js',
                'Html-part': '<h3>Mailjet on Google App Engine with Node.js</h3>'
            };

            var sendEmail = Mailjet.post('send');

            sendEmail.request(options)
                .then(function(response, body){
                    console.log(response);
                })
                .catch(function(reason){
                    console.log(reason);
                });

        })
    }

    this.getPollById = function(id){
        return null;
    }
}

module.exports = new PollsService();