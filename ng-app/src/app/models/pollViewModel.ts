export class PollViewModel {
  constructor(
    public id : number,
    public name : string,
    public closed: boolean,
    public winnerId: number,
    public options: string[],
    public ballots : {email: string, complete: boolean}[]
  ){}
}
