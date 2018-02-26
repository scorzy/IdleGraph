import { MyNode } from './node'
import * as vis from 'vis'
import { Edge } from 'vis'
import * as Decimal from 'break_infinity.js'
import { EventEmitter } from '@angular/core'
import { Skill, Type, labels } from './skill'

export class Model {

  initialVal = new Decimal(1E9)
  private deltaT = new Decimal(0)

  cuerrency = new MyNode()
  tickSpeed = new Decimal(1)
  tickSpeedMulti = new Decimal(1.5)
  tickSpeedCost = new Decimal(1)
  tickSpeedCostMulti = new Decimal(30)
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

    this.skills = new vis.DataSet([
      new Skill(1, Type.TICK_SPEED, "", false, true),
      new Skill(2, Type.TICK_SPEED),
      new Skill(3, Type.TICK_SPEED)
    ])

    this.skillEdges = new vis.DataSet([
      { id: 1, from: 1, to: 2 },
      { id: 2, from: 2, to: 3 }
    ])
    //#endregion
  }

  init() {
    this.tickSpeed = new Decimal(1)
    this.tickSpeedMulti = new Decimal(1.5)
    this.tickSpeedCost = new Decimal(1)
    this.tickSpeedCostMulti = new Decimal(30)

    this.myNodes = new Map<string, MyNode>()

    this.cuerrency = new MyNode()
    this.cuerrency.label = "Main"
    this.cuerrency.quantity = this.initialVal
    this.cuerrency.bonus = new Decimal(1)
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
    this.myNodes.delete("" + node.id)
    this.nodes.remove("" + node.id)
    this.edges.remove(node.id + "-" + node.product.id)
    node.producer.forEach(prod => this.edges.remove(prod.id + "-" + node.id))
  }

  buyTickSpeed() {
    if (this.cuerrency.quantity.lt(this.tickSpeedCost))
      return false

    this.cuerrency.quantity = this.cuerrency.quantity.minus(this.tickSpeedCost)
    this.tickSpeed = this.tickSpeed.times(this.tickSpeedMulti)
    this.tickSpeedCost = this.tickSpeedCost.times(this.tickSpeedCostMulti)
    return true
  }

  maxAll() {
    let stuff = []
    if (this.cuerrency.quantity.gte(this.tickSpeedCost))
      stuff.push([this.tickSpeedCost, this.buyTickSpeed.bind(this)])

    this.myNodes.forEach(n => {
      if (n.canBuy(this))
        stuff.push([n.priceBuy, n.buy.bind(n)])
      if (n.canBuyNewProd(this))
        stuff.push([n.priceNewProd, n.buyNewProducer.bind(n)])
    })
    if (stuff.length > 0) {
      stuff = stuff.sort((a, b) => a[0].gt(b[0]) ? 1 : -1)
      for (let el of stuff)
        if (!el[1](this))
          break
    }
  }
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
    this.softResetNum = this.softResetNum + 1
    this.tickSpeed = this.tickSpeed.times(Decimal.pow(2, this.softResetNum - 1))
  }
  //#endregion
  //#region Save Load
  getSave(): any {
    const d: any = {}
    d.c = this.cuerrency.getSave(this)
    d.s = this.softResetNum
    d.m = this.maxNode
    d.p = this.prestigeCurrency
    d.o = this.skills.get({ filter: i => i.owned }).map(p => p.id)
    return d
  }
  load(data: any) {
    this.nodes = new vis.DataSet()
    this.edges = new vis.DataSet()
    this.cuerrency = MyNode.generate(data.c, this, null)
    this.cuerrency.label = "Main"
    this.maxNode = data.m
    this.prestigeCurrency = data.p
    this.softResetNum = data.s
    this.skills.get(data.o).forEach(s => this.setSkill(s))
    this.myNodes.forEach(n => n.reloadPerSec())
  }
  //#endregion

}