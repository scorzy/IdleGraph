export class Achievement {

  done = false

  constructor(
    public id: number,
    public title: string,
    public description: string,
    public reward = "",
    public reloadFun: (Model) => {} = null
  ) { }
}
