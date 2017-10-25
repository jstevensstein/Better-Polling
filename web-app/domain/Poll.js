var PollsService = require('../pollsService.js');

class Poll{
    costructor(id, name){
        this.id = id;
        this.name = name;
        this.options_ = undefined;
    }

    get options(){
        return PollsService.getPollOptions(this.id)
        .then(function(options){
            this.options_ = options;
            return this.options_;
        });
    }
}

module.exports = Poll;