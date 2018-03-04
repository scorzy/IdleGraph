import { MyNode } from './node'
import * as vis from 'vis'
import { Edge } from 'vis'
import * as Decimal from 'break_infinity.js'
import { EventEmitter } from '@angular/core'
import { Skill, Type, labels } from './skill'

const INIT_CUR = new Decimal(200)
const INIT_TICK_COST = new Decimal(500)
const INIT_TICK_MULTI = new Decimal(1.5)

export class Model {

  private deltaT = new Decimal(0)

  cuerrency = new MyNode()
  tickSpeed = new Decimal(1)
  tickSpeedMulti = INIT_TICK_MULTI
  tickSpeedCostMulti = new Decimal(30)
  tickSpeedOwned = new Decimal(0)
  tickSpeedCost = INIT_TICK_COST
  maxNode = 100

  softResetNum = 1
  softResetReq = new Decimal(1E6)
  softResetHave = new Decimal(0)
  canSoftReset = false

  canPrestige = false
  prestigeCurrency = 10

  myNodes = new Map<string, MyNode>()
  nodes: vis.DataSet<MyNode>
  edges: vis.DataSet<any>
  network: vis.Network
  formatter: any

  perSec = new Decimal(0)

  updateEmitter: EventEmitter<number> = new EventEmitter<number>()

  skills: vis.DataSet<Skill>
  skillEdges: vis.DataSet<any>

  prestigeBonus = new Array<number>(labels.length)

  constructor() {
    this.prestigeBonus.fill(0)
    this.init()
    //#region Prestige
    this.skills = new vis.DataSet()
    this.skillEdges = new vis.DataSet()

    //  Tickspeed
    const tickSpeedNum = 10

    this.skills = new vis.DataSet([
      new Skill(1, Type.TICK_SPEED, "", false, true),
      new Skill(tickSpeedNum + 3, Type.TICK_SPEED_ADD)
    ])

    this.skillEdges = new vis.DataSet([
      { id: tickSpeedNum + 4, from: (tickSpeedNum + 4) / 2, to: tickSpeedNum + 3 },
      { id: tickSpeedNum + 5, from: tickSpeedNum + 1, to: 2 }
    ])

    for (let n = 2; n < tickSpeedNum + 2; n++) {
      this.skills.add(new Skill(n, Type.TICK_SPEED))
      this.skillEdges.add({ id: n, from: n - 1, to: n })
    }

    //  Max node
    const maxNodeAddNum = 10
    this.skills.add(new Skill(199, Type.MAX_NODE_ADD))
    this.skillEdges.add({ id: 198, from: 1, to: 199 })
    for (let n = 200; n < maxNodeAddNum + 200; n++) {
      this.skills.add(new Skill(n, Type.MAX_NODE_ADD))
      this.skillEdges.add({ id: n, from: n - 1, to: n })
    }
    this.skillEdges.add({ id: 210, from: 209, to: 199 })
    this.skills.add(new Skill(220, Type.MAX_NODE_MULTI))
    this.skillEdges.add({ id: 220, from: 200 + maxNodeAddNum / 2, to: 220 })

    //  Sacrify
    const sacrifyMultiNum = 10
    this.skills.add(new Skill(299, Type.SACRIFY_MULTI))
    this.skillEdges.add({ id: 298, from: 1, to: 299 })
    for (let n = 300; n < sacrifyMultiNum + 300; n++) {
      this.skills.add(new Skill(n, Type.SACRIFY_MULTI))
      this.skillEdges.add({ id: n, from: n - 1, to: n })
    }
    this.skillEdges.add({ id: 310, from: 309, to: 299 })
    this.skills.add(new Skill(320, Type.SACRIFY_SPECIAL))
    this.skillEdges.add({ id: 320, from: 300 + sacrifyMultiNum / 2, to: 320 })
    //#endregion
  }

  init() {
    this.tickSpeed = new Decimal(1)
    this.tickSpeedMulti = INIT_TICK_MULTI
    this.tickSpeedCostMulti = new Decimal(30)
    this.tickSpeedOwned = new Decimal(0)
    this.tickSpeedCost = INIT_TICK_COST

    this.myNodes = new Map<string, MyNode>()

    this.cuerrency = new MyNode()
    this.cuerrency.label = "Main"
    this.cuerrency.quantity = INIT_CUR
    this.cuerrency.bought = new Decimal(0)
    this.cuerrency.producer = new Array<MyNode>()
    this.cuerrency.reloadNewProdPrice()

    this.nodes = new vis.DataSet()
    this.edges = new vis.DataSet()
    this.myNodes.set("" + this.cuerrency.id, this.cuerrency)
    this.nodes.add(this.cuerrency.getVisNode())
  }

  update(delta: number) {
    this.deltaT = this.tickSpeed.times(delta / 1000)
    // this.myNodes.forEach(n => n.reloadPerSec())
    this.myNodes.forEach(n => n.producer.forEach(p => n.toAdd = n.toAdd.plus(this.getToAdd(p, 1))))
    this.myNodes.forEach(n => n.quantity = n.quantity.plus(n.toAdd))
    this.myNodes.forEach(n => n.toAdd = new Decimal(0))

    this.perSec = this.cuerrency.producer.map(n => n.prodPerSec.times(n.quantity))
      .reduce((p, n) => p.plus(n), new Decimal(0)).times(this.tickSpeed)

    this.updateEmitter.emit(delta)
  }

  getToAdd(node: MyNode, level: number): Decimal {

    let toAdd = node.quantity.times(node.prodPerSec.times(Decimal.pow(this.deltaT, level).div(level)))
    node.producer.forEach(n => toAdd = toAdd.plus(this.getToAdd(n, level + 1)))
    return toAdd
  }

  getNewNode(): MyNode {
    const node = new MyNode()
    node.id = this.nodes.max('id').id + 1
    node.label = "" + node.id
    node.quantity = new Decimal(1)
    // node.reloadNewProdPrice()
    // node.reloadPriceBuy()

    this.myNodes.set("" + node.id, node)
    this.nodes.add(node.getVisNode())
    return node
  }

  remove(node: MyNode) {
    node.product.producer = node.product.producer.filter(n => n !== node)
    this.myNodes.delete("" + node.id)
    this.nodes.remove("" + node.id)
    this.edges.remove(node.id + "-" + node.product.id)
    node.producer.forEach(prod => this.edges.remove(prod.id + "-" + node.id))
  }
  reloadMaxNode() {
    this.maxNode = Math.floor((100 + this.prestigeBonus[Type.MAX_NODE_ADD] * 5) *
      (this.prestigeBonus[Type.MAX_NODE_MULTI] / 10 + 1))
  }
  //#region MAX
  maxAll() {
    let stuff = []
    if (this.cuerrency.producer.length > 0 && this.canBuyTickSpeed())
      stuff.push([this.tickSpeedCost, this.buyTickSpeed.bind(this)])

    this.myNodes.forEach(n => {
      if (n.canBuy(this))
        stuff.push([n.priceBuy, n.buy.bind(n)])
      if (n.canBuyNewProd(this))
        stuff.push([n.priceNewProd, n.buyNewProducer.bind(n)])
    })
    if (stuff.length > 0) {
      stuff = stuff.sort((a, b) => a[0].cmp(b[0]))
      for (let el of stuff)
        if (!el[1](this))
          break
    }
  }
  leafSacrify() {
    this.myNodes.forEach(node => {
      if (node.producer.length === 0)
        node.sacrifice(this)
    })
  }
  leafProd() {
    this.myNodes.forEach(node => {
      if (node.producer.length === 0)
        node.buyNewProducer(this)
    })
  }
  maxCollapse() {
    this.myNodes.forEach(node => {
      if (node.level === 3 && node.collapsible)
        node.collapse(this)
    })
  }
  //#endregion
  //#region TickSped
  canBuyTickSpeed(): boolean {
    return this.cuerrency.quantity.gte(this.tickSpeedCost)
  }
  buyTickSpeed(max = false) {
    if (!this.canBuyTickSpeed())
      return false

    const toBuy = max ?
      Decimal.affordGeometricSeries(this.cuerrency.quantity, INIT_TICK_COST, this.tickSpeedCostMulti, this.tickSpeedOwned)
      : new Decimal(1)
    const totalPrice = Decimal.sumGeometricSeries(toBuy, INIT_TICK_COST, this.tickSpeedCostMulti, this.tickSpeedOwned)

    this.cuerrency.quantity = this.cuerrency.quantity.minus(totalPrice)
    this.tickSpeedOwned = this.tickSpeedOwned.plus(this.tickSpeedMulti.times(toBuy))
    this.reloadTickSpeed()
    return true
  }
  reloadTickSpeed() {
    //  Base
    this.tickSpeed = new Decimal(1)
    //  Prestige additive
    this.tickSpeed = this.tickSpeed.plus(this.prestigeBonus[Type.TICK_SPEED_ADD])
    //  Soft Reset
    this.tickSpeed = this.tickSpeed.times(Decimal.pow(2, this.softResetNum - 1))
    //  Manual buy
    this.tickSpeed = this.tickSpeed.times(Decimal.pow(INIT_TICK_MULTI, this.tickSpeedOwned))
    //  Prestige
    this.tickSpeed = this.tickSpeed.times(1 + this.prestigeBonus[Type.TICK_SPEED] / 10)

    //  Price
    this.tickSpeedCost = Decimal.sumGeometricSeries(1, INIT_TICK_COST, this.tickSpeedCostMulti, this.tickSpeedOwned)
  }
  //#endregion
  //#region Prestige
  checkPrestige() {
    this.canPrestige = this.cuerrency.quantity.gte(Number.MAX_VALUE)
  }
  prestige() {
    this.init()
    this.softResetNum = 0
    this.prestigeCurrency += 1
  }
  buySkill(skill: Skill) {
    if (this.prestigeCurrency < 1)
      return false

    this.prestigeCurrency -= 1
    this.setSkill(skill)
    this.reloadTickSpeed()
    this.reloadMaxNode()
  }
  setSkill(skill: Skill) {
    skill.owned = true
    skill.setColor()
    const av: any = this.skillEdges.get({
      filter: item => { return item.from === skill.id || item.to === skill.id }
    }).map(o => o.to === skill.id ? o.from : o.to).map(a => this.skills.get(a))
    av.forEach(b => { b.avaiable = true; b.setColor() })
    this.prestigeBonus[skill.type]++
    this.skills.update(av)
    this.skills.update(skill)
  }
  //#endregion
  //#region SoftReset
  softResetCheck() {
    this.softResetHave = Array.from(this.myNodes.values()).
      filter(p => p.level === this.softResetNum + 1).map(n => n.quantity).
      reduce((p, c) => p.plus(c), new Decimal(0))
    this.canSoftReset = this.softResetHave.gte(this.softResetReq)
  }
  doSoftRest() {
    if (!this.canSoftReset) return false
    this.init()
    // this.cuerrency.collapse(this)
    // let node = this.cuerrency
    // while (!!node && node.producer.length > 0) {
    //   node.quantity = new Decimal(0)
    //   node = node.producer[0]
    // }
    this.softResetNum = this.softResetNum + 1
    this.reloadTickSpeed()
  }
  //#endregion
  //#region Save Load
  getSave(): any {
    const d: any = {}
    d.c = this.cuerrency.getSave(this)
    d.s = this.softResetNum
    d.m = this.maxNode
    d.p = this.prestigeCurrency
    d.l = this.tickSpeedOwned
    d.o = this.skills.get({ filter: i => i.owned }).map(p => p.id)
    return d
  }
  load(data: any) {
    this.nodes = new vis.DataSet()
    this.edges = new vis.DataSet()
    if (!!data.c)
      this.cuerrency = MyNode.generate(data.c, this, null)
    this.cuerrency.label = "Main"
    if (!!data.m)
      this.maxNode = data.m
    if (!!data.p)
      this.prestigeCurrency = data.p
    if (!!data.s)
      this.softResetNum = data.s
    if (!!data.o)
      this.skills.get(data.o).forEach(s => this.setSkill(s))
    if (!!data.l)
      this.tickSpeedOwned = new Decimal(data.l)
    this.reloadTickSpeed()
    this.reloadMaxNode()
    this.myNodes.forEach(n => n.reloadPerSec())
  }
  //#endregion

}
