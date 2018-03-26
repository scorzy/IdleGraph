export class Achievement {

  done = false

  constructor(
    public id: number,
    public description = ""
  ) { }

  //#region Save Load
  getData(): any {
    return {
      i: this.id,
      d: this.done
    }
  }
  //#endregion
}
