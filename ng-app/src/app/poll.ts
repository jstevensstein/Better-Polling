export class Poll{
  constructor(
    public name : string,
    public choices: string[],
    public emails: string[],
    public owner: string[]
  ){}
}
