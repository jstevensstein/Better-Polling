'use strict'

module.exports = function(PollsService){
    var exports = {};
    exports.Poll = require('./domain/Poll.js');
    exports.Ballot = require('./domain/Ballot.js');
    return exports;
}
