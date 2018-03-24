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
  TICK_SPEED,
  TICK_SPEED_ADD,
  MAX_NODE_ADD,
  MAX_NODE_MULTI,
  SACRIFY_MULTI,
  SACRIFY_SPECIAL,
  TIME_PER_SEC,
  TIME_BANK_1H,
  MAX_AUTO_BUY,
  MAX_ALL_INTERVAL,
  MAX_TIME_INTERVAL,
  BUY_NODE_INTERVAL,
  BUY_PRODUCER_INTERVAL,
  BUY_TICKSPEED_INTERVAL,
  BUY_LEAF_PROD_INTERVAL
}

export const labels = [
  "+10%\ntick speed",
  "+1 tick /s",
  "+5\nmax node",
  "+10%\nmax node",
  "+10%\nsacrify",
  "sacrify only 90%\nof nodes",
  "+0.05 \ntime /s",
  "+1H \nmax time",
  "+1 \nmax autobuyers",
  "-5% maxAll\ninterval",
  "-5% warp\ninterval",
  "-5% buy node\ninterval",
  "-5% buy producer\ninterval",
  "-5% buy tickspeed\ninterval",
  "-5% buy leaf prod.\ninterval"
]
