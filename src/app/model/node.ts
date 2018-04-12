import { Model } from './model'
import { Type } from './skill'
import { Mod } from './modifiers'
import { Options } from './options'

const BONUS = new Decimal(0.1)
const COST_PER_LEVEL = new Decimal(50)
const INCREMENT_PERCENT = new Decimal(1.1)

export class MyNode {

  id = 1
  label = ""

  quantity = new Decimal(0)
  bought = new Decimal(0)
  level = 1

  prodPerSec = new Decimal(1)

  product: MyNode
  producer = new Array<MyNode>()

  toAdd = new Decimal(0)

  x: any = undefined
  y: any = undefined

  priceBuy = new Decimal(10)
  priceNewProd = new Decimal(10)
  sacrificeMulti = new Decimal(0)
  sacrificeBonus = new Decimal(0)
  canSacrifice = false

  collapsible = false

  thisPerSec = new Decimal(10)

  constructor() {

  }
  getVisNode(): any {
    const opt = Options.ref
    return {
      id: this.id,
      label: this.label,
      color: this.level === 1 ? opt.mainColor :
        (this.producer.length === 0 ? opt.leafColor : opt.normalColor)
    }
  }
  updateVis(model: Model) {
    model.nodes.update(this.getVisNode())
  }
  getBranchBonus(model: Model): Decimal {
    if (this.level === 1)
      return new Decimal(0)

    if (this.product.producer.length < 2)
      return new Decimal(0)

    return Decimal.pow(2, this.product.producer.length - 1)
      .times(1 + model.prestigeBonus[Type.BRANCH_ADD] * 0.2)
      .times(1 + model.prestigeBonus[Type.BRANCH_MULTI] * 10)
  }
  getBonus(model: Model): Decimal {
    return BONUS.times(this.bought)
      .times(1 + model.prestigeBonus[Type.BOUGHT_BONUS] * 0.3)
      .times(Math.pow(2, model.prestigeBonus[Type.DOUBLE_BONUS]))
      .times(model.getTotalMod(Mod.BONUS))
  }
  reloadPerSec(model: Model) {
    if (this.level === 1)
      return

    this.prodPerSec = this.getBonus(model).plus(1)
      .times(this.sacrificeBonus.div(100).plus(1))
      .times(this.getBranchBonus(model).plus(1))

    if (this.producer.length === 0)
      this.prodPerSec = this.prodPerSec.times(model.getTotalMod(Mod.LEAF_PROD))

    switch (this.level) {
      case 2:
        this.prodPerSec = this.prodPerSec.times(model.getTotalMod(Mod.NODE1))
        break
      case 3:
        this.prodPerSec = this.prodPerSec.times(model.getTotalMod(Mod.NODE2))
        break
      case 4:
        this.prodPerSec = this.prodPerSec.times(model.getTotalMod(Mod.NODE3))
        break
    }

    if ((this.level - 1) <= model.softResetAcks.length && model.softResetAcks[this.level - 2].done)
      this.prodPerSec = this.prodPerSec.times(1.1)

    if (this.level === 2 && model.why.done)
      this.prodPerSec = this.prodPerSec.times(1.1)
  }
  maxAllBuy(model: Model) {
    return this.buy(model, new Decimal(10), true)
  }
  buyMax(model: Model) {
    return this.buy(model, new Decimal(10), true)
  }
  buy(model: Model, upTo = new Decimal(1), max = false): boolean {
    if (this.level === 1 || !this.canBuy(model))
      return false


    const maxBuy = Decimal.affordGeometricSeries(model.cuerrency.quantity,
      this.getNodeBasePrice(), INCREMENT_PERCENT, this.bought)

    const buyQta = max ? maxBuy : Decimal.min(maxBuy, upTo)
    const price = Decimal.sumGeometricSeries(buyQta, this.getNodeBasePrice(), INCREMENT_PERCENT, this.bought)

    model.cuerrency.quantity = model.cuerrency.quantity.minus(price)
    this.quantity = this.quantity.plus(buyQta)
    this.bought = this.bought.plus(buyQta)

    this.reloadPriceBuy()
    this.reloadPerSec(model)
    model.buyNodeEmitter.emit(this)

    if (this.level === 2 && !model.why.done && this.quantity.gte(1E100) &&
      upTo.gte(0.9) && upTo.lte(1.3))
      model.unlockAchievement(model.why)

    return true
  }
  buyNewProducer(model: Model, free = false): MyNode {

    if (!free) {
      if (!this.canBuyNewProd(model))
        return null

      model.cuerrency.quantity = model.cuerrency.quantity.minus(this.priceNewProd)
    }

    const producer = model.getNewNode()
    this.addProducer(producer, model)

    producer.reloadNewProdPrice(model)
    producer.reloadPriceBuy()
    this.reloadNewProdPrice(model)

    this.reloadPerSec(model)
    producer.reloadPerSec(model)

    this.updateVis(model)
    producer.updateVis(model)

    if (this.level === 1 && this.producer.length > 49)
      model.unlockAchievement(model.notThatGame)

    if (producer.level === 79)
      model.unlockAchievement(model.levelAck)

    return producer
  }

  addProducer(producer: MyNode, model: Model) {
    producer.level = this.level + 1
    producer.product = this
    this.producer.push(producer)
    model.edges.add({
      id: producer.id + "-" + this.id,
      from: this.id,
      to: producer.id,
      arrows: 'from'
    })
    this.collapsible = this.level > 2 && this.producer.length > 1
    model.checkLeafSacrify()
    model.checkMaxCollapse()
    return producer
  }

  canBuy(model: Model): boolean {
    return !model.cuerrency.quantity.lt(this.priceBuy) && this.level > 1
  }
  canBuyNewProd(model: Model): boolean {
    return !model.cuerrency.quantity.lt(this.priceNewProd) && model.myNodes.size < model.maxNode
  }
  getNodeBasePrice(): Decimal {
    return COST_PER_LEVEL
      .times(Decimal.pow(1E2, this.level - 2))
  }
  reloadPriceBuy() {
    this.priceBuy = this.getNodeBasePrice()
      .times(Decimal.pow(INCREMENT_PERCENT, this.bought))
  }
  reloadNewProdPrice(model: Model) {
    this.priceNewProd = this.getNodeBasePrice()
      .times(Decimal.pow(2.5, this.producer.length))
      .times(Decimal.pow(12, this.level))
      .times(model.getFactorial(this.level))
  }

  remove(model: Model): boolean {
    if (this.level === 1)
      return false

    if (this.producer.length > 0)
      this.producer.forEach(n => n.remove(model))

    model.remove(this)
    return true
  }
  //#region Sacrifice
  reloadSacrificeMulti(model: Model): Decimal {
    if (this.level < 3)
      return new Decimal(0)

    let prod = this.product
    let bonus = new Decimal(0)
    while (!!prod && prod.level > 1) {
      if (prod.quantity.gte(11))
        bonus = bonus.plus(new Decimal(prod.quantity.log10()))
      prod = prod.product
    }

    this.sacrificeMulti = bonus.div(10).pow(1.8 + model.softResetNum / 3)
      .times(1 + model.prestigeBonus[Type.SACRIFY_MULTI] * 0.7)

    this.sacrificeMulti = Decimal.max(this.sacrificeMulti, 0)

    this.canSacrifice = this.sacrificeMulti.gte(this.sacrificeBonus) && this.sacrificeMulti.gte(1)

    return this.sacrificeMulti
  }
  sacrifice(model: Model): boolean {
    this.reloadSacrificeMulti(model)
    if (this.sacrificeBonus.gte(this.reloadSacrificeMulti(model)))
      return false

    this.sacrificeBonus = new Decimal(this.sacrificeMulti)
    let product = this.product
    while (product && product.level > 1) {
      if (model.prestige[Type.SACRIFY_SPECIAL] > 0)
        product.quantity = product.quantity.times(
          new Decimal(1).minus(Decimal.pow(0.1, model.prestige[Type.SACRIFY_SPECIAL])))
      else
        product.quantity = new Decimal(0)

      product.bought = new Decimal(0)
      product.sacrificeBonus = new Decimal(0)
      product = product.product
      product.reloadPerSec(model)
    }
    this.reloadSacrificeMulti(model)
    this.reloadPerSec(model)
    return true
  }
  //#endregion
  //#region Collapse
  collapse(model: Model): boolean {
    const firstProducer = this.producer[0]
    if (!firstProducer)
      return false

    const list = new Array<MyNode>()
    this.producer.forEach(pr => pr.addToList(list))

    let level = this.level + 1
    let prev: MyNode = this
    while (list.length > 0) {
      const prod = model.getNewNode()
      prev.addProducer(prod, model)

      const thisLevel = list.filter(n => n.level === prod.level)
      thisLevel.forEach(tl => {
        prod.quantity = prod.quantity.plus(tl.quantity)
        prod.bought = prod.bought.plus(tl.bought)
        prod.sacrificeBonus = prod.sacrificeBonus.plus(tl.sacrificeBonus)

        list.splice(list.indexOf(tl), 1)
        model.remove(tl)
      })

      prod.reloadNewProdPrice(model)
      prod.reloadPriceBuy()
      prod.reloadPerSec(model)
      prev = prod
      level += 1
    }
    this.quantity = new Decimal(0)
    let product = this.product
    while (product && product.level > 1) {
      product.quantity = new Decimal(0)
      product.bought = new Decimal(0)
      product.sacrificeBonus = new Decimal(0)
      product = product.product
      product.reloadPerSec(model)
    }
    let productor: MyNode = this
    while (productor) {
      productor.updateVis(model)
      productor = productor.producer[0]
    }
    this.reloadNewProdPrice(model)
    this.reloadPriceBuy()
    this.reloadPerSec(model)
    this.collapsible = this.level > 2 && this.producer.length > 1
    model.checkLeafSacrify()
    model.checkMaxCollapse()



    return true
  }
  addToList(list: Array<MyNode>): Array<MyNode> {
    list.push(this)
    this.producer.forEach(pr => pr.addToList(list))
    return list
  }
  //#endregion
  //#region Stats
  reloadStats() {
    this.thisPerSec = this.producer.map(p => p.prodPerSec.times(p.quantity)).reduce((p, c) => p.plus(c), new Decimal(0))
  }
  //#endregion
  //#region Save and Load
  getSave(model: Model): any {
    const vis = model.nodes.get(this.id)
    // if (!vis)
    //   console.log(this.id)
    return {
      i: this.id,
      q: this.quantity,
      b: this.bought,
      l: this.level,
      x: vis.x,
      y: vis.y,
      s: this.sacrificeBonus,
      p: this.producer.map(prod => prod.getSave(model))
    }
  }

  // tslint:disable-next-line:member-ordering
  static generate(data: any, model: Model, parent: MyNode): MyNode {
    const node = new MyNode()
    node.id = data.i
    if (!!parent)
      node.label = "" + node.id
    else
      node.label = "Main"
    node.quantity = new Decimal(data.q)
    node.bought = new Decimal(data.b)
    node.level = data.l
    node.x = data.x
    node.y = data.y
    if ("s" in data)
      node.sacrificeBonus = new Decimal(data.s)

    node.reloadNewProdPrice(model)
    node.reloadPriceBuy()

    model.myNodes.set("" + node.id, node)

    if (!!parent)
      node.product = parent

    if (!!data.p && data.p.length > 0)
      for (let prodData of data.p)
        node.producer.push(MyNode.generate(prodData, model, node))

    model.nodes.add(node.getVisNode())
    if (!!parent)
      model.edges.add({
        id: node.id + "-" + parent.id,
        from: parent.id,
        to: node.id,
        arrows: 'from'
      })

    return node
  }
  //#endregion

}
