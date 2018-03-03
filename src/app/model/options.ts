import { numberformat } from 'swarm-numberformat'

export class Options {

  formatter = new numberformat.Formatter({ format: 'standard', sigfigs: 2, flavor: 'short' })
  colAlert = true
  sacAlert = true
  numFormat = "S"

  constructor() {
  }
  generateFormatter() {
    this.formatter = new numberformat.Formatter({
      format: this.numFormat === "T" ? 'standard' : (
        this.numFormat === "S" ? 'scientific' : (
          this.numFormat === "E" ? 'engineering' : 'longScale'))
      , sigfigs: 2, flavor: 'short'
    })
  }
  save(): any {
    return {
      c: this.colAlert,
      s: this.sacAlert,
      n: this.numFormat
    }
  }
  load(data) {
    this.colAlert = !!data.c
    this.sacAlert = !!data.s
    this.numFormat = "S"
    if (!!data.n)
      this.numFormat = data.n
    this.generateFormatter()
  }
}