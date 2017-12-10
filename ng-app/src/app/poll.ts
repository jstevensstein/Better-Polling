export class Poll{
  constructor(
    public name : string,
    public options: string[],
    public emails: string[],
    public owner: string,
    public id : number = undefined,
    public ballots: {email: string, complete: boolean}[] = undefined
  ){}
}
