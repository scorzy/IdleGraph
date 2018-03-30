export enum Mod {
  NOTHING,
  TICK_SPEED,
  SACRIFY,
  BONUS,
  TIME,
  WARP,
  LEAF_PROD
}

export class Modifier {

  static load(data: any): Modifier {
    const newMod = new Modifier(-1, data.n, data.m)
    return newMod
  }

  constructor(
    public id = 0,
    public name: string,
    public mods = new Array<[Mod, number]>()) { }

  getSave(): any {
    return {
      n: this.name,
      m: this.mods
    }

  }
}

export const Suffixs: Array<Modifier> = [
  new Modifier(0, ""),
  new Modifier(1, "of tick speed", [[Mod.TICK_SPEED, 100]]),
  new Modifier(2, "of sacrify", [[Mod.SACRIFY, 100]]),
  new Modifier(3, "of bonus", [[Mod.BONUS, 100]]),
  new Modifier(4, "of time", [[Mod.TIME, 100]]),
  new Modifier(5, "of warping", [[Mod.WARP, 100]]),
  new Modifier(6, "of leaf", [[Mod.LEAF_PROD, 100]])
]

export const Ggraph: Array<Modifier> = [
  new Modifier(1E2 + 1, "Thick", [[Mod.TICK_SPEED, 100]]),
  new Modifier(1E2 + 2, "Temple", [[Mod.SACRIFY, 100]]),
  new Modifier(1E2 + 3, "Bonus", [[Mod.BONUS, 100]]),
  new Modifier(1E2 + 4, "Clock", [[Mod.TIME, 100]]),
  new Modifier(1E2 + 5, "Warp", [[Mod.WARP, 100]]),
  new Modifier(1E2 + 6, "Leaf", [[Mod.LEAF_PROD, 100]])
]

export const Prefixs: Array<Modifier> = [
  new Modifier(1E3, ""),
  new Modifier(1E3 + 1, "Faster", [[Mod.TICK_SPEED, 100]]),
  new Modifier(1E3 + 2, "Sacrilegious", [[Mod.SACRIFY, 100]]),
  new Modifier(1E3 + 3, "Better", [[Mod.BONUS, 100]]),
  new Modifier(1E3 + 4, "Future", [[Mod.TIME, 100]]),
  new Modifier(1E3 + 5, "Warping", [[Mod.WARP, 100]]),
  new Modifier(1E3 + 6, "Rising", [[Mod.LEAF_PROD, 100]])
]
