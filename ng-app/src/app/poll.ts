export class Poll {
  constructor(
    public name : string,
    public options: string[],
    public id : number = undefined,
    public closed : boolean = false,
    public ballots: {email: string, complete: boolean}[] = undefined,
    public winnerId : number = undefined,
    public owner: string = undefined,
  ){}

  getWinner() : string {
    return this.options[this.winnerId];
  }
}
