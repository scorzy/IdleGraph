/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module "*.json" {
  const value: any;
  export default value;
}

declare class Decimal {

  constructor(any);

  gte: (any) => boolean
  gt: (any) => boolean
  lte: (any) => boolean
  lt: (any) => boolean

  times: (any) => Decimal
  div: (any) => Decimal
  plus: (any) => Decimal
  min: (any) => Decimal

  minus: (any) => Decimal
  max: (any) => Decimal
  pow: (any) => Decimal
  cmp: (any) => number
  ln: () => number
  log10: () => number
  floor: () => Decimal

  toNumber: () => number

  static min: (any, any2) => Decimal
  static max: (any, any2) => Decimal
  static pow: (any, any2) => Decimal
  static sumGeometricSeries: (any, any2, any3, any4) => Decimal
  static affordGeometricSeries: (any, any2, any3, any4) => Decimal
  static ln: (any) => number
  static log10: (any) => number
}
