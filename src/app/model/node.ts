import { Model } from './model'
import { Type } from './skill'
import { Mod } from './modifiers'
import { Options } from './options'

const BONUS = new Decimal(0.1)

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
  getBonus(model: Model): Decimal {
    return BONUS.times(this.bought)
      .times(1 + model.prestigeBonus[Type.BOUGHT_BONUS] * 0.2)
      .times(Math.pow(2, model.prestigeBonus[Type.DOUBLE_BONUS]))
      .times(model.getTotalMod(Mod.BONUS))
  }
  reloadPerSec(model: Model) {
    this.prodPerSec = this.getBonus(model).plus(1).times(this.sacrificeBonus.div(100).plus(1))

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

    if (this.level <= model.softResetAcks.length && model.softResetAcks[this.level - 1].done)
      this.prodPerSec = this.prodPerSec.times(1.1)
  }

  buy(model: Model): boolean {
    if (this.level === 1 || !this.canBuy(model))
      return false
    model.cuerrency.quantity = model.cuerrency.quantity.minus(this.priceBuy)
    const buyQta = new Decimal(1)
    this.quantity = this.quantity.plus(buyQta)
    this.bought = this.bought.plus(buyQta)
    this.reloadPriceBuy()
    this.reloadPerSec(model)
    model.buyNodeEmitter.emit(this)
    return true
  }
  buyNewProducer(model: Model): MyNode {

    if (!this.canBuyNewProd(model))
      return null

    model.cuerrency.quantity = model.cuerrency.quantity.minus(this.priceNewProd)

    const producer = model.getNewNode()
    this.addProducer(producer, model)

    producer.reloadNewProdPrice()
    producer.reloadPriceBuy()
    this.reloadNewProdPrice()

    this.reloadPerSec(model)
    producer.reloadPerSec(model)

    this.updateVis(model)
    producer.updateVis(model)

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

  reloadPriceBuy() {
    this.priceBuy = Decimal.pow(1.1, this.bought).times(Decimal.pow(50, this.level - 1))
  }
  reloadNewProdPrice() {
    this.priceNewProd = Decimal.pow(1.07, this.producer.length).times(Decimal.pow(50, this.level))
  }

  remove(model: Model): boolean {
    if (this.level === 1)
      return false

    model.remove(this)
    if (this.producer.length > 0)
      this.producer.forEach(n => n.remove(model))
    return true
  }
  //#region Sacrifice
  reloadSacrificeMulti(model: Model): Decimal {
    if (this.level < 3)
      return new Decimal(0)

    let prod = this.product
    let bonus = new Decimal(0)
    while (!!prod && prod.level > 1) {
      bonus = bonus.plus(
        new Decimal(prod.quantity.ln() / 0.7)
          .times(Decimal.pow(1.05 + model.softResetNum / 10, prod.level)).times(prod.level))
      prod = prod.product
    }
    console.log(bonus.toString())
    if (bonus.lte(10))
      return new Decimal(0)

    this.sacrificeMulti = bonus.div(10) // new Decimal(bonus.ln() * (this.level) / 2.5)
      .times(1 + model.prestigeBonus[Type.SACRIFY_MULTI] / 10)
      .times(Decimal.pow(2, model.softResetNum))
      .times(model.getTotalMod(Mod.SACRIFY))

    this.canSacrifice = this.sacrificeMulti.gte(this.sacrificeBonus)


    return this.sacrificeMulti
  }
  sacrifice(model: Model): boolean {
    if (this.sacrificeBonus.gte(this.reloadSacrificeMulti(model)))
      return false

    this.sacrificeBonus = new Decimal(this.sacrificeMulti)
    let product = this.product
    while (product && product.level > 1) {
      if (model.prestige[Type.SACRIFY_SPECIAL] > 0)
        product.quantity = product.quantity.times(Decimal.pow(0.9, model.prestige[Type.SACRIFY_SPECIAL]))
      else
        product.quantity = new Decimal(0)
      product = product.product
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

      prod.reloadNewProdPrice()
      prod.reloadPriceBuy()
      prod.reloadPerSec(model)
      prev = prod
      level += 1
    }
    this.quantity = new Decimal(0)
    let product = this.product
    while (product && product.level > 1) {
      product.quantity = new Decimal(0)
      product = product.product
    }
    let productor: MyNode = this
    while (productor) {
      productor.updateVis(model)
      productor = productor.producer[0]
    }
    this.reloadNewProdPrice()
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
    if (!vis)
      console.log(this.id)
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

    node.reloadNewProdPrice()
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
