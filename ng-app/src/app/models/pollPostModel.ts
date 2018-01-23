export class PollPostModel {
  constructor(
    public name : string,
    public options: string[],
    public emails: string[],
    public owner: string
  ){}
}
