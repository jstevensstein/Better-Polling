var pollsRepo = require('../dataAccess/pollsRepository.js')

class Poll{
    constructor(id, name, owner, closed){
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.closed = closed;
        this.options_ = undefined;
        this.ballots_ = undefined;
    }

    get options(){
        return pollsRepo.getPollOptions(this.id).bind(this)
        .then(function(options){
            this.options_ = options;
            return this.options_;
        });
    }

    get ballots(){
      return pollsRepo.getBallotsForPoll(this.id).bind(this)
      .then(function(ballots){
        this.ballots_ = ballots;
        return this.ballots_;
      });
    }


    toModel(){
      return this.options
      .then(function(){
        return this.ballots;
      })
      .then(function(){
        return {
          id: this.id,
          name: this.name,
          closed: this.closed,
          options: this.options_.map(c => c.name),
          ballots: this.ballots_.map(b => {
            return {email: b.email, complete: b.complete};
          })
        }
      });
    }
}

module.exports = Poll;
