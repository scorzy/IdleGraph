import { UpToTimePipe } from './../up-to-time.pipe'
import { MyNode } from './node'
import * as vis from 'vis'
import { Edge } from 'vis'
import { EventEmitter } from '@angular/core'
import { Skill, Type, labels } from './skill'
import { AutoBuy, MaxAllAutoBuy, TimeAutoBuy, BuyAutoBuy, ProdAutoBuy, TickAutoBuy, BuyLeafProd, LeafSacrify, Collapse } from './autoBuy'
import { Achievement } from './achievement'
import { ToastsManager } from 'ng2-toastr'
import { Modifier, Mod, Prefixs, Ggraph, Suffixs } from './modifiers'

// const INIT_CUR = new Decimal(200)
const INIT_CUR = new Decimal(1E300).times(new Decimal(1E100))
const INIT_TICK_COST = new Decimal(500)
const INIT_TICK_MULTI = new Decimal(1)
const BASE_TIME_BANK = new Decimal(4)
const MAX_NODE = 50
const TICK_COST_MULTI = new Decimal(1E3)

const PRESTIGE_START = Number.MAX_VALUE
const PRESTIGE_MULTI = 2E4

export class Model {

  static model: Model

  private deltaT = new Decimal(0)

  cuerrency = new MyNode()
  tickSpeed = new Decimal(1)
  tickSpeedMulti = INIT_TICK_MULTI

  tickSpeedOwned = new Decimal(0)
  tickSpeedCost = INIT_TICK_COST
  maxNode = MAX_NODE

  softResetNum = 1
  softResetReq = new Decimal(1E6)
  softResetHave = new Decimal(0)
  canSoftReset = false

  canPrestige = false
  prestigeCurrency = 0
  totalCuerrency = new Decimal(0)
  thisRunPrestige = 0

  myNodes = new Map<string, MyNode>()
  nodes: vis.DataSet<MyNode> = new vis.DataSet<MyNode>()
  edges: vis.DataSet<any> = new vis.DataSet<any>()
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

  prefixAcks = new Array<Achievement>()
  graphAcks = new Array<Achievement>()
  suffixAcks = new Array<Achievement>()

  why: Achievement
  notThatGame: Achievement
  levelAck: Achievement
  prestigeAck: Achievement

  currentMods = new Modifier(-1, "")
  nextMods = new Array<Modifier>()

  visivisited = new Array<Number>()
  showAchievements = false
  showKills = false
  cuerrencyNextPrestige = new Decimal(Number.MAX_VALUE)

  factorial: Map<number, Decimal> = new Map()
  isFull = false

  constructor(public toastr: ToastsManager,
    public achievementsEmitter: EventEmitter<Achievement>,
    public buyNodeEmitter: EventEmitter<MyNode>,
    public prestigeEmitter: EventEmitter<number>) {

    Model.model = this

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
      [12, 2000, Type.BOUGHT_BONUS, Type.DOUBLE_BONUS],
      [12, 3000, Type.BRANCH_ADD, Type.BRANCH_MULTI]
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

    this.makeLine(1303, 2100, Type.BULK_BUY, 3)
    this.makeLine(1313, 2200, Type.BULK_BUY, 3)
    this.skillEdges.add({ from: 2102, to: 2202 })

    this.makeLine(1500, 2300, Type.BULK_BUY, 3)
    this.makeLine(1501, 2310, Type.BULK_BUY, 3)
    this.makeLine(781, 2320, Type.BULK_BUY, 3)
    this.makeLine(711, 2330, Type.BULK_BUY, 3)
    this.makeLine(503, 2340, Type.BULK_BUY, 3)
    this.skillEdges.add({ from: 509, to: 2342 })

    this.makeLine(2003, 2350, Type.BOUGHT_BONUS, 3)
    this.skillEdges.add({ from: 2352, to: 912 })

    this.makeLine(208, 2360, Type.MAX_NODE_ADD, 3)
    this.skillEdges.add({ from: 2362, to: 102 })

    this.makeLine(204, 2370, Type.MAX_NODE_ADD, 3)
    this.skillEdges.add({ from: 2372, to: 803 })

    this.makeLine(2312, 2380, Type.MAX_NODE_ADD, 3)
    this.skillEdges.add({ from: 1181, to: 2382 })

    this.makeLine(1870, 2390, Type.TICK_SPEED, 1)
    this.makeLine(2390, 2395, Type.TICK_SPEED_ADD, 1)

    this.makeLine(1600, 3085, Type.MAX_NODE_ADD, 3)
    this.skillEdges.add({ from: 3080, to: 3087 })

    // console.log("Tot skill point: " + this.skills.length)

    this.reloadMaxTime()
    this.reloadAutoBuyers()
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    //#endregion
    //#region Achivements
    const firsthAck = new Achievement(1, "Linear", "Do one soft reset", "+10% production from node of level 2",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const secondAck = new Achievement(2, "Quadratic", "Do two soft reset", "+10% production from node of level 3",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const thirdAck = new Achievement(3, "Cubic", "Do three reset", "+10% production from node of level 4",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g4Ack = new Achievement(4, "Quartic ", "Do four soft reset", "+10% production from node of level 5",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g5Ack = new Achievement(5, "Quintic ", "Do five soft reset", "+10% production from node of level 6",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g6Ack = new Achievement(6, "Sextic", "Do six soft reset", "+10% production from node of level 7",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g7Ack = new Achievement(7, "Septic", "Do seven soft reset", "+10% production from node of level 8",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g8Ack = new Achievement(8, "Octic", "Do eight soft reset", "+10% production from node of level 9",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g9Ack = new Achievement(9, "Nonic", "Do nine soft reset", "+10% production from node of level 10",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    const g10Ack = new Achievement(10, "Decic", "Do ten soft reset", "+10% production from node of level 11",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))

    this.softResetAcks.push(firsthAck, secondAck, thirdAck, g4Ack, g5Ack, g6Ack, g7Ack, g8Ack, g9Ack, g10Ack)
    this.achievements = this.achievements.concat(this.softResetAcks)

    const pre1 = new Achievement(11, "Prefix", "Complete 2 prefix", "Prefix are 100% better")
    const pre2 = new Achievement(12, "Prefix 2", "Complete 4 prefix", "Prefix are 100% better")
    // const pre3 = new Achievement(13, "Prefix 3", "Complete 15 prefix", "Prefix are 100% better")
    this.prefixAcks = [pre1, pre2]

    const graph1 = new Achievement(14, "Graph", "Complete 2 graph", "Graph are 100% better")
    const graph2 = new Achievement(15, "Graph 2", "Complete 4 graph", "Graph are 100% better")
    // const graph3 = new Achievement(16, "Graph 3", "Complete 15 graph", "Graph are 100% better")
    this.graphAcks = [graph1, graph2]

    const suffix1 = new Achievement(17, "Suffix", "Complete 2 suffix", "Suffix are 100% better")
    const suffix2 = new Achievement(18, "Suffix 2", "Complete 4 suffix", "Suffix are 100% better")
    // const suffix3 = new Achievement(19, "Suffix 3", "Complete 15 suffix", "Suffix are 100% better")
    this.suffixAcks = [suffix1, suffix2]

    this.achievements = this.achievements.concat(this.prefixAcks).concat(this.graphAcks).concat(this.suffixAcks)

    this.why = new Achievement(20, "Why ?",
      "Buy a single second level node when you have more of 1E100 of them",
      "+10% production from node of level 2",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    this.achievements.push(this.why)

    this.notThatGame = new Achievement(21,
      "Not that kind of game !",
      "Get 50 producer of level 2",
      "Start 10 with node of level 2",
      (model) => model.myNodes.forEach(n => n.reloadPerSec(model)))
    this.achievements.push(this.notThatGame)

    this.levelAck = new Achievement(22, "Last Level",
      "Get a node of level 79",
      "+1 max node",
      (model) => model.reloadMaxNode())
    this.achievements.push(this.levelAck)

    this.prestigeAck = new Achievement(23, "First Prestige",
      "Prestige for the first time",
      "Start with 200 more currency")
    this.achievements.push(this.prestigeAck)

    //#endregion
    this.nextMods = [this.getRandomGraph(), this.getRandomGraph(), this.getRandomGraph()]
    this.currentMods = this.getRandomGraph()
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
    this.tickSpeedOwned = new Decimal(0)
    this.tickSpeedCost = INIT_TICK_COST

    this.myNodes = new Map<string, MyNode>()

    this.cuerrency = new MyNode()
    this.cuerrency.label = "Main"
    this.cuerrency.quantity = INIT_CUR
    this.cuerrency.bought = new Decimal(0)
    this.cuerrency.producer = new Array<MyNode>()
    this.cuerrency.reloadNewProdPrice(this)

    this.nodes.clear()
    this.edges.clear()
    this.myNodes.set("" + this.cuerrency.id, this.cuerrency)
    this.nodes.add(this.cuerrency.getVisNode())
  }
  reloadMaxTime() {
    this.maxTime = new UpToTimePipe().transform((BASE_TIME_BANK.plus(this.prestigeBonus[Type.TIME_BANK_1H])).times(3600))
  }
  getTotalMod(mod: Mod, noPercent = false): number {
    let ret = this.currentMods.mods.filter(n => n[0] === mod)
      .map(m => m[1]).reduce((p, c) => p + c, 0)

    if (!noPercent)
      ret = 1 + ret / 100

    return ret
  }
  getFactorial(num: number): Decimal {
    // console.log(num)
    if (num < 2)
      return new Decimal(1)

    let f = this.factorial.get(num)
    if (f === undefined) {
      f = this.getFactorial(num - 1).times(num)
      this.factorial.set(num, f)
    }

    // console.log(num + " : " + f.toString())
    return f
  }
  //#region Update
  mainUpdate(delta: number) {
    this.time = Decimal.min(
      this.time.plus(this.prestigeBonus[Type.TIME_PER_SEC] * delta * this.getTotalMod(Mod.TIME) * 0.05 / 1000),
      BASE_TIME_BANK.plus(this.prestigeBonus[Type.TIME_BANK_1H]).times(3600))

    this.update(delta)
    this.autoBuyersActiveOrder.forEach(a => a.update(delta / 1000, this))
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
  maxWarp() {
    return this.warp(new Decimal(this.time))
  }
  warp(delta = new Decimal(1)): boolean {
    if (delta.gt(this.time)) return false
    this.time = this.time.minus(delta)
    const up = delta.times(this.getTotalMod(Mod.WARP))
    this.update(up.times(1000).toNumber())
    this.toastr.info("" + new UpToTimePipe().transform(up), "Time Warp")
    return true
  }
  getToAdd(node: MyNode, level: number): Decimal {
    let toAdd = node.quantity
      .times(node.prodPerSec)
      .times(Decimal.pow(this.deltaT, level))
      .div(this.getFactorial(level))

    node.producer.forEach(n => toAdd = toAdd.plus(this.getToAdd(n, level + 1)))
    return toAdd
  }
  //#endregion
  //#region Node management
  getNewNode(x = 0, y = 0): MyNode {
    const node = new MyNode()
    node.id = this.nodes.max('id').id + 1
    node.label = "" + node.id
    node.quantity = new Decimal(1)
    if (x !== 0 || y !== 0) {
      node.x = x
      node.y = y
    }

    this.myNodes.set("" + node.id, node)
    this.nodes.add(node.getVisNode(true))

    this.isFull = this.myNodes.size >= this.maxNode
    return node
  }
  remove(node: MyNode) {
    node.product.producer = node.product.producer.filter(n => n !== node)
    this.myNodes.delete("" + node.id)
    this.nodes.remove("" + node.id)
    this.edges.remove(node.id + "-" + node.product.id)
    node.producer.forEach(prod => this.edges.remove(prod.id + "-" + node.id))
    node.product.reloadNewProdPrice(this)
    // node.product.updateVis(this)
    this.isFull = this.myNodes.size >= this.maxNode
  }
  reloadMaxNode() {
    this.maxNode = Math.floor((MAX_NODE + this.prestigeBonus[Type.MAX_NODE_ADD]) *
      (this.prestigeBonus[Type.MAX_NODE_MULTI] / 10 + 1))

    if (this.levelAck.done)
      this.maxNode += 1

    this.isFull = this.myNodes.size >= this.maxNode
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
        stuff.push([n.priceBuy, n.maxAllBuy.bind(n)])
      if (n.canBuyNewProd(this))
        stuff.push([n.priceNewProd, n.buyNewProducer.bind(n)])
    })
    if (stuff.length > 0) {
      stuff = stuff.sort((a, b) => a[0].cmp(b[0]))
      for (let el of stuff) {
        if (!el[1](this))
          break
        else
          bought = true
      }
    }
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    return bought
  }
  leafSacrify(leaf = false) {
    let ret = false
    const nodes = Array.from(this.myNodes.values())
      .filter(node => node.producer.length === 0 || !leaf)
      .sort((a, b) => b.level - a.level)

    nodes.forEach(node => {
      // console.log(node.id)
      if (node.sacrifice(this))
        ret = true
    })
    return ret
  }
  leafProd(all = false) {
    let ret = false

    let maxLevel = 1
    if (!all)
      maxLevel = Array.from(this.myNodes.values()).map(n => n.level)
        .reduce((p, c) => Math.max(p, c), 0)

    this.myNodes.forEach(node => {
      if (node.producer.length === 0 && (all || node.level === maxLevel))
        if (node.buyNewProducer(this))
          ret = true
    })
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    return ret
  }
  maxCollapse() {
    let ret = false
    const maxLevel = Array.from(this.myNodes.values())
      .map(n => n.level).reduce((p, c) => Math.max(p, c), -1)
    for (let l = 3; l <= maxLevel; l++) {
      this.myNodes.forEach(node => {
        if (node.level === l && node.collapsible)
          if (node.collapse(this))
            ret = true
      })
    }
    // this.myNodes.forEach(node => {
    //   if (node.level === 3 && node.collapsible)
    //     if (node.collapse(this))
    //       ret = true
    // })
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
  maxLeafBuy(all = true) {
    let maxLevel = 2
    if (!all)
      maxLevel = Array.from(this.myNodes.values()).map(n => n.level)
        .reduce((p, c) => Math.max(p, c), 0)
    Array.from(this.myNodes.values())
      .filter(l => l.producer.length === 0 && (all || l.level === maxLevel))
      .sort((a, b) => a.quantity.cmp(b.quantity))
      .forEach(l => l.buy(this, new Decimal(1), true))
  }
  //#endregion
  //#region Auto Buyers
  reloadAutoBuyers() {
    this.autoBuyers.forEach(a => {
      a.reloadInterval(this)
      a.reloadBulk(this)
    })
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
      Decimal.affordGeometricSeries(this.cuerrency.quantity, INIT_TICK_COST, TICK_COST_MULTI, this.tickSpeedOwned)
      : new Decimal(1)
    const totalPrice = Decimal.sumGeometricSeries(toBuy, INIT_TICK_COST, TICK_COST_MULTI, this.tickSpeedOwned)

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
    this.tickSpeed = this.tickSpeed.times(Decimal.pow(1.25, this.softResetNum - 1))
    //  Manual buy
    this.tickSpeed = this.tickSpeed.times(INIT_TICK_MULTI.times(this.tickSpeedOwned).plus(1))
    //  Prestige
    this.tickSpeed = this.tickSpeed.times(1 + this.prestigeBonus[Type.TICK_SPEED] * 0.3)

    // Mod
    this.tickSpeed = this.tickSpeed.times(this.getTotalMod(Mod.TICK_SPEED))
    //  Price
    this.tickSpeedCost = Decimal.sumGeometricSeries(1, INIT_TICK_COST, TICK_COST_MULTI, this.tickSpeedOwned)
  }
  //#endregion
  //#region Prestige
  reloadEarnPrestigeCur() {
    this.thisRunPrestige = Decimal.affordGeometricSeries(this.cuerrency.quantity,
      PRESTIGE_START, PRESTIGE_MULTI, this.totalCuerrency).toNumber()
  }
  checkPrestige() {
    this.reloadEarnPrestigeCur()
    this.canPrestige = this.thisRunPrestige > 1
  }
  prestige(surrender = false, mod: Modifier) {
    this.reloadEarnPrestigeCur()
    if (!surrender) {
      if (!this.canPrestige)
        return false

      this.currentMods.visit.forEach(v => {
        if (this.visivisited.findIndex(m => m === v) < 0)
          this.visivisited.push(v)
      })
      const numPref = this.visivisited.filter(t => t < 1E2).length
      const numGraph = this.visivisited.filter(t => t < 1E3 && t > 99).length
      const numSuffix = this.visivisited.filter(t => t < 1E4 && t > 1E3).length

      for (let i = 0; i < 2; i++) {
        if (!this.prefixAcks[i].done && numPref >= 2 * (1 + i))
          this.unlockAchievement(this.prefixAcks[i])
        if (!this.graphAcks[i].done && numGraph >= 2 * (1 + i))
          this.unlockAchievement(this.graphAcks[i])
        if (!this.suffixAcks[i].done && numSuffix >= 2 * (1 + i))
          this.unlockAchievement(this.suffixAcks[i])
      }

      this.prestigeCurrency = Math.floor(this.thisRunPrestige + this.prestigeCurrency)
      this.totalCuerrency = this.totalCuerrency.plus(this.thisRunPrestige)
      this.currentMods = mod
      this.showKills = true

      this.unlockAchievement(this.prestigeAck)
    } else {
      this.currentMods = new Modifier(-1, "Home World")
    }
    this.nextMods = [this.getRandomGraph(), this.getRandomGraph(), this.getRandomGraph()]
    this.init()
    this.addFirst()
    this.softResetNum = 1
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    this.softResetCheck()

    this.reloadAll()

    this.prestigeEmitter.emit(1)
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
  getRandomGraph(): Modifier {
    const prefix = Prefixs[Math.floor(Math.random() * (Prefixs.length))]
    const graph = Ggraph[Math.floor(Math.random() * (Ggraph.length))]
    const suffix = Suffixs[Math.floor(Math.random() * (Suffixs.length))]

    const mod = new Modifier(-1, prefix.name + " " + graph.name + " " + suffix.name)
    mod.visit = [prefix.id, graph.id, suffix.id]

    const stuffs: [[Mod, number][], number][] = [
      [prefix.mods, this.prefixAcks.filter(a => a.done).length + 1],
      [graph.mods, this.graphAcks.filter(b => b.done).length + 1],
      [suffix.mods, this.suffixAcks.filter(c => c.done).length + 1]]

    stuffs.forEach(s => {
      s[0].forEach(m2 => {
        const old = mod.mods.find(o => o[0] === m2[0])
        const val = m2[1] * s[1]
        if (old === undefined)
          mod.mods.push([m2[0], val])
        else
          old[1] = old[1] + val
      })
    })

    return mod
  }
  reloadNeedPrestige() {
    this.cuerrencyNextPrestige = Decimal.sumGeometricSeries(1, PRESTIGE_START, PRESTIGE_MULTI, this.totalCuerrency)
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
    this.addFirst()

    if (this.softResetAcks.length >= this.softResetNum)
      this.unlockAchievement(this.softResetAcks[this.softResetNum - 1])

    this.softResetNum = this.softResetNum + 1
    this.reloadTickSpeed()
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    this.isFull = false
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
    this.showAchievements = true
  }
  //#endregion
  //#region Save Load
  getSave(): any {
    return {
      c: this.cuerrency.getSave(this),
      s: this.softResetNum,
      p: this.prestigeCurrency,
      l: this.tickSpeedOwned,
      o: this.skills.get({ filter: i => i.owned }).map(p => p.id),
      t: this.time,
      a: this.autoBuyers.map(a => a.save()),
      k: this.achievements.filter(k => k.done).map(a => a.id),
      u: this.totalCuerrency,
      h: this.currentMods.getSave(),
      n: this.nextMods.map(m => m.getSave()),
      v: this.visivisited
    }
  }
  load(data: any) {
    this.nodes = new vis.DataSet()
    this.edges = new vis.DataSet()
    if ("c" in data) this.cuerrency = MyNode.generate(data.c, this, null)
    this.cuerrency.label = "Main"
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
    if ("h" in data)
      this.currentMods = Modifier.load(data.h)

    this.nextMods = []
    if ("n" in data)
      for (let m of data.n)
        this.nextMods.push(Modifier.load(m))

    if ("v" in data)
      this.visivisited = data.v
    else
      this.visivisited = new Array<Number>()

    // this.skills.forEach(s => this.setSkill(s))
    // this.totalCuerrency = new Decimal(100)
    // this.showKills = true

    this.reloadAll()
  }
  //#endregion
  reloadAll() {
    this.reloadTickSpeed()
    this.reloadMaxNode()
    this.myNodes.forEach(n => {
      n.reloadPerSec(this)
      n.reloadNewProdPrice(this)
      n.reloadPriceBuy()
      n.collapsible = n.level > 2 && n.producer.length > 1
    })
    this.reloadMaxTime()
    this.reloadAutoBuyers()
    this.checkLeafSacrify()
    this.checkMaxCollapse()
    this.softResetCheck()
    this.reloadNeedPrestige()
    this.showAchievements = this.achievements.findIndex(a => a.done) > -1
    this.showKills = this.totalCuerrency.gt(0)
    this.isFull = (this.myNodes.size >= this.maxNode)
  }

  addFirst() {
    if (this.notThatGame.done) {
      this.cuerrency.buyNewProducer(this, true).quantity = new Decimal(10)
    }
    if (this.prestigeAck.done) {
      this.cuerrency.quantity = this.cuerrency.quantity.plus(200)
    }
  }
}
