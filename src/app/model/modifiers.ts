
export enum Mod {
  TICK_SPEED
}

export class Modifier {

  constructor(
    public id = 0,
    public name: string,
    public mods = new Array<[Mod, number]>()) { }

}

export const suffixs: Array<Modifier> = [
  new Modifier(0, ""),
  new Modifier(1, "of tick speed", [[Mod.TICK_SPEED, 20]])
]
