export class Skill {

  color = noColor
  setColor = this.setColorF

  constructor(
    public id: number,
    public type: Type,
    public label: string = "",
    public owned = false,
    public avaiable = false
  ) {
    if (this.id === 0)
      this.avaiable = true
    if (this.label === "")
      this.label = labels[this.type]

    this.setColor()
  }

  public setColorF() {
    this.color = this.owned ? ownedColor : (this.avaiable ? aviableColor : noColor)
  }
}

const aviableColor = "#7BE141"
const ownedColor = "#FEFF73"
const noColor = "#c0c0c0"

export enum Type {
  TICK_SPEED
}

export const labels = [
  "+10%\ntick speed"
]
