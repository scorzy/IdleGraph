import { UpToTimePipe } from './../up-to-time.pipe'
import { MyNode } from './node'
import * as vis from 'vis'
import { Edge } from 'vis'
import { EventEmitter } from '@angular/core'
import { Skill, Type, labels } from './skill'
import { AutoBuy, MaxAllAutoBuy, TimeAutoBuy, BuyAutoBuy, ProdAutoBuy, TickAutoBuy, BuyLeafProd, LeafSacrify, Collapse } from './autoBuy'
import { Achievement } from './achievement'
import { ToastsManager } from 'ng2-toastr'
import { Modifier, suffixs, Mod } from './modifiers';

// const INIT_CUR = new Decimal(200)
const INIT_CUR = new Decimal(200E20)
const INIT_TICK_COST = new Decimal(500)
const INIT_TICK_MULTI = new Decimal(2)
const BASE_TIME_BANK = new Decimal(4)

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
  prestigeCurrency = 200
  totalCuerrency = new Decimal(0)
  thisRunPrestige = 0

  myNodes = new Map<string, MyNode>()
  nodes: vis.DataSet<MyNode>
  edges: vis.DataSet<any>
  network: vis.Network
  formatter: any

  perSec = new Decimal(0)

  skills: vis.DataSet<Skill>
  skillEdges: vis.DataSet<any>

  prestigeBonus = new Array<number>(labels.length)

  time = new Decimal(0)
  maxTime = ""

  autoBuyers = new Array<AutoBuy>()
  autoBuyersActiveOrder = new Array<AutoBuy>()

  showLeafSacrify = false
  showMaxCollapse = false

  achievements = new Array<Achievement>()
  softResetAcks = new Array<Achievement>()

  currentMods = new Array<Modifier>()

  constructor(public toastr: ToastsManager,
    public achievementsEmitter: EventEmitter<Achievement>,
    public buyNodeEmitter: EventEmitter<MyNode>) {
    this.prestigeBonus.fill(0)
    this.init()
    //#region Prestige
    this.autoBuyers = [
      new MaxAllAutoBuy(),
      new TimeAutoBuy(),
      new TickAutoBuy(),
      new BuyLeafProd(),
      new LeafSacrify(),
      new Collapse()
    ]
    for (let n = 2; n < 41; n++) {
      this.autoBuyers.push(new BuyAutoBuy(n))
      this.autoBuyers.push(new ProdAutoBuy(n))
    }

    this.skills = new vis.DataSet()
    this.skillEdges = new vis.DataSet()

    //  Tickspeed
    const tickSpeedNum = 10

    this.skills = new vis.DataSet([
      new Skill(1, Type.TICK_SPEED, "", false, true)
    ])

    this.skillEdges = new vis.DataSet()

    const stuff = [
      [12, 100, Type.TICK_SPEED, Type.TICK_SPEED_ADD],
      [12, 200, Type.MAX_NODE_ADD, Type.MAX_NODE_MULTI],
      [12, 300, Type.SACRIFY_MULTI, Type.SACRIFY_SPECIAL],
      [12, 400, Type.TIME_PER_SEC, Type.TIME_BANK_1H],
      [12, 500, Type.MAX_ALL_INTERVAL, Type.MAX_AUTO_BUY, Type.MAX_AUTO_BUY],
      [12, 2000, Type.BOUGHT_BONUS, Type.DOUBLE_BONUS]
    ]
    stuff.forEach(s => {
      this.skills.add(new Skill(s[1] - 1, s.length > 4 ? s[4] : s[2]))
      this.skillEdges.add({ from: 1, to: s[1] - 1 })
      for (let n = s[1]; n < s[0] + s[1]; n++) {
        this.skills.add(new Skill(n, s[2]))
        this.skillEdges.add({ from: n - 1, to: n })
      }
      this.skillEdges.add({ from: s[0] + s[1] - 1, to: s[1] - 1 })
      this.skills.add(new Skill(s[1] + 80, s[3]))
      this.skillEdges.add({ from: s[1] + s[0] / 2, to: s[1] + 80 })
    })
    this.makeLine(580, 1300, Type.MAX_AUTO_BUY, 4)
    this.makeLine(580, 1310, Type.MAX_AUTO_BUY, 4)
    this.skillEdges.add({ from: 1303, to: 1313 })

    this.makeLine(503, 700, Type.BUY_NODE_INTERVAL, 6)
    this.makeLine(503, 710, Type.BUY_NODE_INTERVAL, 6)
    this.skillEdges.add({ from: 705, to: 715 })
    this.makeLine(715, 781, Type.MAX_AUTO_BUY, 1)

    this.makeLine(509, 800, Type.BUY_PRODUCER_INTERVAL, 6)
    this.makeLine(509, 810, Type.BUY_PRODUCER_INTERVAL, 6)
    this.skillEdges.add({ from: 805, to: 815 })
    this.makeLine(815, 881, Type.MAX_AUTO_BUY, 3)

    this.makeLine(504, 1000, Type.BUY_LEAF_PROD_INTERVAL, 6)
    this.makeLine(504, 1010, Type.BUY_LEAF_PROD_INTERVAL, 6)
    this.skillEdges.add({ from: 1005, to: 1015 })
    this.makeLine(1015, 1081, Type.MAX_AUTO_BUY, 1)

    this.makeLine(505, 1200, Type.COLLAPSE_INTERVAL, 6)
    this.makeLine(505, 1210, Type.COLLAPSE_INTERVAL, 6)
    this.skillEdges.add({ from: 1205, to: 1215 })
    this.makeLine(1215, 1281, Type.MAX_AUTO_BUY, 1)


    this.makeLine(380, 1100, Type.LEAF_SACRIFY_INTERVAL, 6)
    this.makeLine(380, 1110, Type.LEAF_SACRIFY_INTERVAL, 6)
    this.skillEdges.add({ from: 1105, to: 1115 })
    this.makeLine(1115, 1181, Type.MAX_AUTO_BUY, 1)

    this.makeLine(180, 900, Type.BUY_TICKSPEED_INTERVAL, 6)
    this.makeLine(180, 910, Type.BUY_TICKSPEED_INTERVAL, 6)
    this.skillEdges.add({ from: 905, to: 915 })
    this.makeLine(915, 981, Type.MAX_AUTO_BUY, 1)

    this.makeLine(480, 600, Type.MAX_TIME_INTERVAL, 6)
    this.makeLine(480, 610, Type.MAX_TIME_INTERVAL, 6)
    this.skillEdges.add({ from: 605, to: 615 })
    this.makeLine(615, 681, Type.MAX_AUTO_BUY, 1)


    this.makeLine(1281, 1400, Type.ALL_AUTOBUY_INTERVAL, 4)
    this.skillEdges.add({ from: 1403, to: 1181 })

    this.makeLine(781, 1500, Type.MAX_AUTO_BUY, 6)
    this.skillEdges.add({ from: 1505, to: 1081 })

    this.makeLine(681, 1600, Type.MAX_AUTO_BUY, 6)
    this.skillEdges.add({ from: 1605, to: 981 })

    this.makeLine(1502, 1700, Type.MAX_AUTO_BUY, 3)
    this.skillEdges.add({ from: 1702, to: 1401 })

    this.makeLine(1603, 1800, Type.TICK_SPEED, 6)
    this.makeLine(1602, 1850, Type.TIME_PER_SEC, 6)
    this.makeLine(1855, 1870, Type.TIME_BANK_1H, 1)
    this.skillEdges.add({ from: 1805, to: 1870 })

    this.makeLine(1401, 1900, Type.MAX_AUTO_BUY, 3)
    this.makeLine(1902, 1910, Type.MAX_AUTO_BUY_PERC, 1)

    this.makeLine(2080, 2085, Type.BOUGHT_BONUS, 3)
    this.makeLine(2080, 2090, Type.BOUGHT_BONUS, 3)
    this.skillEdges.add({ from: 2087, to: 1603 })
    this.skillEdges.add({ from: 2092, to: 1602 })

    console.log("Tot skill point: " + this.skills.length)

    this.reloadMaxTime()
    this.reloadAutoBuyers()
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    //#endregion
    //#region Achivements
    const firsthAck = new Achievement(0, "Linear", "Do one soft reset", "+10% production from node of level 1",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const secondAck = new Achievement(0, "Quadratic", "Do two soft reset", "+10% production from node of level 2",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const thirdAck = new Achievement(0, "Cubic", "Do three reset", "+10% production from node of level 3",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g4Ack = new Achievement(0, "Quartic ", "Do four soft reset", "+10% production from node of level 4",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g5Ack = new Achievement(0, "Quintic ", "Do five soft reset", "+10% production from node of level 5",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g6Ack = new Achievement(0, "Sextic", "Do six soft reset", "+10% production from node of level 6",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g7Ack = new Achievement(0, "Septic", "Do seven soft reset", "+10% production from node of level 7",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g8Ack = new Achievement(0, "Octic", "Do eight soft reset", "+10% production from node of level 8",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g9Ack = new Achievement(0, "Nonic", "Do nine soft reset", "+10% production from node of level 9",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g10Ack = new Achievement(0, "Decic", "Do ten soft reset", "+10% production from node of level 10",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))

    this.softResetAcks.push(firsthAck, secondAck, thirdAck, g4Ack, g5Ack, g6Ack, g7Ack, g8Ack, g9Ack, g10Ack)
    this.achievements = this.achievements.concat(this.softResetAcks)
    //#endregion
  }
  makeLine(from: number, startId: number, type: Type, num: number) {
    this.skills.add(new Skill(startId, type))
    this.skillEdges.add({ id: startId, from: from, to: startId })
    for (let k = startId + 1; k < startId + num; k++) {
      this.skills.add(new Skill(k, type))
      this.skillEdges.add({ id: k, from: k - 1, to: k })
    }
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
  reloadMaxTime() {
    this.maxTime = new UpToTimePipe().transform((BASE_TIME_BANK.plus(this.prestigeBonus[Type.TIME_BANK_1H])).times(3600))
  }
  getTotalMod(mod: Mod): number {
    let ret = 0
    this.currentMods.forEach(m =>
      m.mods.filter(n => n[0] === mod).forEach(q => { ret = ret + q[1] })
    )
    return ret
  }
  //#region Update
  mainUpdate(delta: number) {
    this.time = Decimal.min(this.time.plus(this.prestigeBonus[Type.TIME_PER_SEC] * delta * 0.05 / 1000),
      BASE_TIME_BANK.plus(this.prestigeBonus[Type.TIME_BANK_1H]).times(3600))
    this.update(delta)
    this.autoBuyersActiveOrder.forEach(a => {
      a.update(delta / 1000, this)
      // console.log(delta + " - " + a.id)
    }
    )
  }
  update(delta: number) {
    this.deltaT = this.tickSpeed.times(delta / 1000)
    // this.myNodes.forEach(n => n.reloadPerSec())
    this.myNodes.forEach(n => n.producer.forEach(p => n.toAdd = n.toAdd.plus(this.getToAdd(p, 1))))
    this.myNodes.forEach(n => n.quantity = n.quantity.plus(n.toAdd))
    this.myNodes.forEach(n => n.toAdd = new Decimal(0))

    this.perSec = this.cuerrency.producer.map(n => n.prodPerSec.times(n.quantity))
      .reduce((p, n) => p.plus(n), new Decimal(0)).times(this.tickSpeed)
  }
  warp(delta: Decimal): boolean {
    if (delta.gt(this.time)) return false
    this.time = this.time.minus(delta)
    this.update(delta.times(1000).toNumber())  // update require number, but should work anyway...
    return true
  }
  getToAdd(node: MyNode, level: number): Decimal {
    let toAdd = node.quantity.times(node.prodPerSec.times(Decimal.pow(this.deltaT, level).div(level)))
    node.producer.forEach(n => toAdd = toAdd.plus(this.getToAdd(n, level + 1)))
    return toAdd
  }
  //#endregion
  //#region Node management
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
  //#endregion
  //#region MAX
  maxAll(): boolean {
    let bought = false
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
        else
          bought = true
    }
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    return bought
  }
  leafSacrify() {
    let ret = false
    this.myNodes.forEach(node => {
      if (node.producer.length === 0)
        if (node.sacrifice(this))
          ret = true
    })
    return ret
  }
  leafProd() {
    let ret = false
    this.myNodes.forEach(node => {
      if (node.producer.length === 0)
        if (node.buyNewProducer(this))
          ret = true
    })
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    return ret
  }
  maxCollapse() {
    let ret = false
    this.myNodes.forEach(node => {
      if (node.level === 3 && node.collapsible)
        if (node.collapse(this))
          ret = true
    })
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    return ret
  }
  checkLeafSacrify() {
    this.showLeafSacrify = !!Array.from(this.myNodes.values()).find(n => n.level > 2)
  }
  checkMaxCollapse() {
    this.showMaxCollapse = !!Array.from(this.myNodes.values()).find(n => n.collapsible)
  }
  //#endregion
  //#region Auto Buyers
  reloadAutoBuyers() {
    this.autoBuyers.forEach(a => a.reloadInterval(this))
    this.autoBuyersActiveOrder = this.autoBuyers.filter(a => a.on).sort((a, b) => a.priority - b.priority)
  }
  getMaxAutoBuy(): number {
    return this.prestigeBonus[Type.MAX_AUTO_BUY] * (Math.pow(1.2, this.prestigeBonus[Type.MAX_AUTO_BUY_PERC]))
  }
  //#endregion
  //#region TickSped
  canBuyTickSpeed(): boolean {
    return this.cuerrency.quantity.gte(this.tickSpeedCost)
  }
  buyTickSpeed(max = false): boolean {
    if (!this.canBuyTickSpeed())
      return false

    const toBuy = max ?
      Decimal.affordGeometricSeries(this.cuerrency.quantity, INIT_TICK_COST, this.tickSpeedCostMulti, this.tickSpeedOwned)
      : new Decimal(1)
    const totalPrice = Decimal.sumGeometricSeries(toBuy, INIT_TICK_COST, this.tickSpeedCostMulti, this.tickSpeedOwned)

    this.cuerrency.quantity = this.cuerrency.quantity.minus(totalPrice)
    this.tickSpeedOwned = this.tickSpeedOwned.plus(toBuy)
    this.reloadTickSpeed()
    return true
  }
  reloadTickSpeed() {
    //  Base
    this.tickSpeed = new Decimal(1)
    //  Prestige additive
    this.tickSpeed = this.tickSpeed.plus(this.prestigeBonus[Type.TICK_SPEED_ADD])
    //  Soft Reset
    this.tickSpeed = this.tickSpeed.times(Decimal.pow(1.2, this.softResetNum - 1))
    //  Manual buy
    this.tickSpeed = this.tickSpeed.times(INIT_TICK_MULTI.times(this.tickSpeedOwned).plus(1))
    //  Prestige
    this.tickSpeed = this.tickSpeed.times(1 + this.prestigeBonus[Type.TICK_SPEED] / 10)

    // Mod
    this.tickSpeed = this.tickSpeed.times(1 + this.getTotalMod(Mod.TICK_SPEED) / 100)
    //  Price
    this.tickSpeedCost = Decimal.sumGeometricSeries(1, INIT_TICK_COST, this.tickSpeedCostMulti, this.tickSpeedOwned)
  }
  //#endregion
  //#region Prestige
  reloadEarnPrestigeCur() {
    this.thisRunPrestige = Decimal.affordGeometricSeries(this.cuerrency.quantity,
      Number.MAX_VALUE, new Decimal(1.7), this.totalCuerrency).toNumber()
  }
  checkPrestige() {
    this.reloadEarnPrestigeCur()
    this.canPrestige = this.thisRunPrestige > 1
  }
  prestige(surrender = false) {
    if (!surrender) {
      if (!this.canPrestige)
        return false

      this.prestigeCurrency = Math.floor(this.thisRunPrestige + this.prestigeCurrency)
    }
    this.init()
    this.softResetNum = 1
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    this.softResetCheck()
  }
  buySkill(skill: Skill) {
    if (this.prestigeCurrency < 1)
      return false

    this.prestigeCurrency -= 1
    this.setSkill(skill)

    if (skill.type === Type.TICK_SPEED || skill.type === Type.TICK_SPEED_ADD || skill.type === Type.BUY_TICKSPEED_INTERVAL)
      this.reloadTickSpeed()
    else if (skill.type === Type.MAX_NODE_ADD || skill.type === Type.MAX_NODE_MULTI)
      this.reloadMaxNode()
    else if (skill.type === Type.TIME_BANK_1H)
      this.reloadMaxTime()
    else this.reloadAutoBuyers()
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

    if (this.softResetAcks.length >= this.softResetNum)
      this.unlockAchievement(this.softResetAcks[this.softResetNum - 1])

    this.softResetNum = this.softResetNum + 1
    this.reloadTickSpeed()
    this.checkLeafSacrify()
    this.checkMaxCollapse()
  }
  //#endregion
  //#region Achievements
  unlockAchievement(ack: Achievement): boolean {
    if (ack.done)
      return false

    ack.done = true
    if (ack.reloadFun)
      ack.reloadFun(this)

    this.toastr.info(ack.reward, ack.title)
    this.achievementsEmitter.emit(ack)
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
    d.t = this.time
    d.a = this.autoBuyers.map(a => a.save())
    d.k = this.achievements.filter(k => k.done).map(a => a.id)
    d.u = this.totalCuerrency
    d.h = this.currentMods.map(m => m.id)
    return d
  }
  load(data: any) {
    this.nodes = new vis.DataSet()
    this.edges = new vis.DataSet()
    if ("c" in data) this.cuerrency = MyNode.generate(data.c, this, null)
    this.cuerrency.label = "Main"
    if ("m" in data) this.maxNode = data.m
    if ("p" in data) this.prestigeCurrency = data.p
    if ("s" in data) this.softResetNum = data.s
    if ("o" in data) this.skills.get(data.o).forEach(s => this.setSkill(s))
    if ("l" in data) this.tickSpeedOwned = new Decimal(data.l)
    if ("t" in data) this.time = new Decimal(data.t)
    if ("a" in data) {
      for (let d of data.a) {
        const autoBuyer = this.autoBuyers.find(a => a.id === d.i)
        if (!!autoBuyer)
          autoBuyer.load(d)
      }
    }
    if ("k" in data) {
      this.achievements.forEach(a => a.done = false)
      for (let acks of data.k) {
        const ac = this.achievements.find(a => a.id === acks)
        if (ac) ac.done = true
      }
    }
    if ("u" in data)
      this.totalCuerrency = new Decimal(data.u)
    else
      this.totalCuerrency = new Decimal(0)
    if ("h" in data) {
      for (let mod of data.h) {
        const newMod = suffixs.find(n => n.id === mod)
        if (newMod)
          this.currentMods.push(newMod)
      }
    } else
      this.currentMods = new Array<Modifier>()

    this.reloadTickSpeed()
    this.reloadMaxNode()
    this.myNodes.forEach(n => n.reloadPerSec(this))
    this.reloadMaxTime()
    this.reloadAutoBuyers()
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    this.softResetCheck()
  }
  //#endregion

}
