var pollsRepo = require('../dataAccess/pollsRepository.js')

class Poll{
    constructor(id, name, owner, closed){
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.closed = closed;
        this.options_ = undefined;
    }

    get options(){
        return pollsRepo.getPollOptions(this.id).bind(this)
        .then(function(options){
            this.options_ = options;
            return this.options_;
        });
    }
}

module.exports = Poll;