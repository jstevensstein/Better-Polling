var mysql = require('mysql');

PollsService = function(){

  var connection = mysql.createConnection({
    host:       process.env.MYSQL_HOST,
    user:       process.env.MYSQL_USER,
    password:   process.env.MYSQL_PASSWORD,
    database:   'pollingdb'
  });

  connection.connect();

  this.createPoll = function(name, choices){
    var pollRecord = {name: 'name'};
    var query = connection.query('INSERT INTO poll set ?', pollRecord, function(error, results, fields ){
      //if (error) throw error;
      // choices.forEach(function(element, index){
      //   connection.query('INSERT')
      // })
      //console.log('insert successful');
      console.log(query.sql);
    });
  }

  this.getPollById = function(id){
    return null;
  }
}

module.exports = new PollsService();