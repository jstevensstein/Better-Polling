export class Ballot{
  constructor(
    public id : number,
    public pollId: number,
    public pollName: string,
    public options: {name: string, id: number}[],
    public closed: boolean
  ){}
}
