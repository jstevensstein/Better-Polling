var pollsRepo = require('../dataAccess/pollsRepository.js')


class Ballot{
    constructor(id, pollId, complete, email){
        this.id = id;
        this.pollId = pollId;
        this.complete = complete;
        this.email = email;
        this.choices_ = undefined;
        this.options_ = undefined;
    }

    get options(){
        if (this.options_){
            Promise.resolve(this.options_)
        }
        return pollsRepo.getPollOptions(this.pollId).bind(this)
        .then(function(options){
            this.options_ = options;
            return this.options_;
        });
    }

    get choices(){
        if (this.choices_){
            return Promise.resolve(this.choices_);
        }
        if (!this.complete){
            return Promise.resolve(null);
        }
        if (this.complete){
            return pollsRepo.getBallotChoices(this.id).bind(this)
            .then(function(choices){
                this.choices_ = choices;
                return choices;
            })
        }
    }

    get optionsByChoiceOrRandom(){
        return this.options
        .then(function(){
            return this.choices;
        })
        .then(function(choices){
            if (this.choices_){
                this.options_.sort(function(a,b){return a.id - b.id});
                return this.choices_.map(c => this.options_[c]);
            }
            else{
                //todo: shuffle options
                return this.options_;
            }
        });
    }

    toModel(){
        return this.optionsByChoiceOrRandom.then(function(options){
            return {
                id: this.id,
                pollId: this.pollId,
                name: this.name,
                options: options
            }
        });
    }
}

module.exports = Ballot;