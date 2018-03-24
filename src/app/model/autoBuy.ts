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

export class TimeAutoBuy extends AutoBuy {
  constructor() {
    super(
      (model, upTo) => model.warp(upTo),
      (model) => {
        return 300 * Math.pow(0.95, model.prestigeBonus[Type.MAX_TIME_INTERVAL])
      }
    )
    this.id = 1
    this.name = "Time Warp"
    this.upTo = new Decimal(10)
  }
}

export class BuyAutoBuy extends AutoBuy {
  constructor(public level = 2) {
    super(
      (model, upTo) => {
        let done = false
        Array.from(model.myNodes.values())
          .filter(n => n.level === this.level && n.canBuy(model))
          .sort((a, b) => a.priceBuy.cmp(b.priceBuy))
          .forEach(n => { if (n.buy(model)) done = true })
        return done
      },
      (model) => {
        return 300 * Math.pow(0.95, model.prestigeBonus[Type.BUY_NODE_INTERVAL])
      }
    )
    this.id = 100 * this.level
    this.name = "Buy node of level " + this.level
  }
}

export class ProdAutoBuy extends AutoBuy {
  constructor(public level = 2) {
    super(
      (model, upTo) => {
        let done = false
        Array.from(model.myNodes.values())
          .filter(n => n.level === this.level && n.canBuyNewProd(model))
          .sort((a, b) => a.priceNewProd.cmp(b.priceNewProd))
          .forEach(n => { if (n.buyNewProducer(model)) done = true })
        return done
      },
      (model) => {
        return 600 * Math.pow(0.95, model.prestigeBonus[Type.BUY_PRODUCER_INTERVAL])
      }
    )
    this.id = 10000 * this.level
    this.name = "Buy prod. of level " + (this.level + 1)
  }
}

export class TickAutoBuy extends AutoBuy {
  constructor() {
    super(
      (model, upTo) => model.buyTickSpeed(),
      (model) => {
        return 300 * Math.pow(0.95, model.prestigeBonus[Type.BUY_TICKSPEED_INTERVAL])
      }
    )
    this.id = 2
    this.name = "Buy Tickspeed"
  }
}

export class BuyLeafProd extends AutoBuy {
  constructor() {
    super(
      (model, upTo) => model.leafProd(),
      (model) => {
        return 900 * Math.pow(0.95, model.prestigeBonus[Type.BUY_LEAF_PROD_INTERVAL])
      }
    )
    this.id = 3
    this.name = "Buy Leaf Producers"
  }
}
