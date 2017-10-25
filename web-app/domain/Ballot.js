var pollsRepo = require('../dataAccess/pollsRepository.js')


class Ballot{
    constructor(id, pollId, complete, email){
        this.id = id;
        this.pollId = pollId;
        this.complete = complete;
        this.email = email;
        this.choices_ = undefined;
    }

    get choices(){
        if (this.choices_){
            return Promise.resolve(choices_)
        }
        if (this.complete){
            //get choices in order
        }
        // else{
        return pollsRepo.getPollOptions(this.pollId).bind(this).then(function(options){
            this.choices_ = options;
            return this.choices_;
        });
        // }
    }

    toModel(){
        return this.choices.then(function(){
            return {
                id: this.id,
                pollId: this.pollId,
                name: this.name,
                choices: this.choices_
            }
        });
    }
}

module.exports = Ballot;