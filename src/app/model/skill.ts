import * as positions from '../skillsPositions.json'

export class Skill {

  color = noColor
  setColor = this.setColorF
  isNotable = false

  constructor(
    public id: number,
    public type: Type,
    public label: string = "",
    public owned = false,
    public avaiable = false,
    public x = 0,
    public y = 0
  ) {
    if (this.id === 0)
      this.avaiable = true
    if (this.label === "") {
      this.label = this.id + " - " + labels[this.type]
      // this.label = labels[this.type]
    }
    if (this.id in positions) {
      this.x = positions[this.id].x
      this.y = positions[this.id].y
    }
    this.isNotable = notableSkills.indexOf(this.type) > -1
    this.setColor()
  }

  public setColorF() {
    this.color = this.isNotable ?
      this.owned ? notableColor : (this.avaiable ? notableAviableColor : notableNoColor) :
      this.owned ? ownedColor : (this.avaiable ? aviableColor : noColor)
  }
}

const aviableColor = "#FEFF73"
const ownedColor =  "#7BE141"
const noColor = "#c0c0c0"
const notableAviableColor = "#e14141"
const notableNoColor = "#d8938a"
const notableColor = "#ef2007"

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
  BUY_LEAF_PROD_INTERVAL,
  LEAF_SACRIFY_INTERVAL,
  COLLAPSE_INTERVAL,
  ALL_AUTOBUY_INTERVAL,
  MAX_AUTO_BUY_PERC,
  BOUGHT_BONUS,
  DOUBLE_BONUS
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
  "-5% buy leaf prod.\ninterval",
  "-5% leaf sacrify\ninterval",
  "-5% collapse\ninterval",
  "-5% autobuyers\ninterval",
  "+20% max\nautobuyers",
  "+20% bought\nbonus",
  "double \nbought bonus"
]

export const notableSkills = [
  Type.TICK_SPEED_ADD,
  Type.MAX_NODE_MULTI,
  Type.SACRIFY_SPECIAL,
  Type.TIME_BANK_1H,
  Type.DOUBLE_BONUS,
  Type.MAX_AUTO_BUY
]
