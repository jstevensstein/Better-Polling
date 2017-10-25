'use strict'


function PollsRepository(){

    var Promise = require("bluebird");
    var mysql = require('promise-mysql');

    var pool  = mysql.createPool({
        host:       process.env.MYSQL_HOST,
        user:       process.env.MYSQL_USER,
        password:   process.env.MYSQL_PASSWORD,
        database:   'pollingdb'
    });

    function getConnection() {
        return pool.getConnection().disposer(function(connection) {
            pool.releaseConnection(connection);
        });
    }


    this.getPollById = function(id){
        return pool.query('select * from `poll` where `id` = ?', [id])
        .then(function(rows){
            let pollRow = rows[0];
            if (!pollRow){
                return Promise.reject('There is no such poll');
            }
            poll = new domain.Poll(pollRow.id, pollRow.name);
            return poll;
        });
    }

    this.getPollOptions = function(pollId){
        return pool.query('select * from `poll_option` where `poll_id` = ?', [pollId])
        .then(function(rows){
            let options = [];
            rows.forEach(function(row){
                options.push({id: row.id, name: row.name});
            });
            return options;
        });
    }


    this.createPoll = function(name, choices){
        return Promise.using(getConnection(), function(connection) {
            var pollId;
            return connection.beginTransaction()
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
            }).then(function(){
                return connection.commit();
            }).then(function(){
                return pollId;
            }, function(reason) {
                return connection.rollback()
                .then(function(){
                    return Promise.reject(reason);
                });
            });
        });
    }

    this.getBallotById = function(id){
        return pool.query('select * from `ballot` where `id` = ?', [id])
        .then(function(rows){
            let record = rows[0];
            return new domain.Ballot(id, record.poll_id, !!record.complete);
        });
    }

    function getBallotsForPoll(pollId){
        return pool.query('select * from `ballot` where `poll_id` = ?', [pollId])
        .then(function(rows){
            var ballots = [];
            rows.forEach(function(row){
                ballots.push(new domain.Ballot(row.id, row.poll_id, !!row.complete, row.email));
            });
            return ballots;
        });
    }

    this.allBallotsComplete = function(pollId){
        return getBallotsForPoll(pollId)
        .then(function(ballots){
            return !ballots.some(function(ballot){return !ballot.complete;});
        });
    }

    this.addBallot = function(pollId, email){
        return pool.query('INSERT INTO ballot SET ?', {poll_id: pollId, email: email})
        .then(function(results){
            return Promise.resolve(results.insertId);
        });
    }

    this.submitBallot = function(id, order){
        return Promise.using(getConnection(), function(connection) {
            return connection.beginTransaction()
            .then(function(){
                return upsertBallot(id, {complete: 1}, connection);
            })
            .then(function(){
                return upsertBallotChoices(id, order, connection);
            }).then(function(){
                return connection.commit();
            }).then(function(){
                Promise.resolve();
            }, function(reason){
                return connection.rollback()
                .then(function(){
                    return Promise.reject(reason);
                });
            });
        })
    }

    //TODO: same function w/out connection yet and commits?
    function upsertBallot(id, updates, connection){
        return connection.query('update ballot set ? where `id` = ?', [updates, id]);
    }

    //TODO: same function w/out connection yet and commits?
    function upsertBallotChoices(id, order, connection){
        return connection.query('delete from `ballot_choice` where `ballot_id` = ?', [id])
        .then(function(){
            let ballotPromises = [];
            order.forEach(function(element, index){
                ballotPromises.push(
                    connection.query('insert into `ballot_choice` set ?', {ballot_id: id, poll_option_id: element, priority: index })
                );
            });
            return Promise.all(ballotPromises);
        });
    }
}

module.exports = new PollsRepository();


var domain = require('../domain.js')(module.exports);