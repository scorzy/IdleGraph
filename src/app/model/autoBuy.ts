import { Model } from './model'
import * as Decimal from 'break_infinity.js'
import { Type } from './skill'

export abstract class AutoBuy {
  id = 0
  on = false
  canBuy = false
  interval = 0
  upTo = new Decimal(0)
  wait = 0
  priority = 0
  name = ""
  constructor(
    public buyAction: (model: Model, upTo: Decimal) => boolean,
    public getInterval: (model: Model) => number
  ) { }

  reloadInterval(model: Model) {
    const int = this.getInterval(model)
    this.interval = int
  }

  update(time: number, model: Model) {
    if (!this.on) return false
    this.wait = this.wait + time
    this.canBuy = this.canBuy || this.wait >= this.interval

    if (this.canBuy && this.buyAction(model, this.upTo)) {
      this.canBuy = false
      this.wait = 0
    }

  }

  reset(model: Model) {
    this.canBuy = false
    this.reloadInterval(model)
    this.wait = 0
  }
  //#region Save Load
  save(): any {
    return {
      i: this.id,
      o: this.on,
      c: this.canBuy,
      w: this.wait,
      p: this.priority
    }
  }
  load(data: any) {
    this.on = !!data.o
    this.canBuy = !!data.c
    if ("w" in data)
      this.wait = data.w
    if ("p" in data)
      this.priority = data.p
  }
  //#endregion
}

export class MaxAllAutoBuy extends AutoBuy {

  constructor() {
    super(
      (model, upTo) => model.maxAll(),
      (model) => {
        return 300 * Math.pow(0.95, model.prestigeBonus[Type.MAX_ALL_INTERVAL])
      }
    )
    this.id = 0
    this.name = "Max All"
  }

}
