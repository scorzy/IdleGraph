import { numberformat } from 'swarm-numberformat'

export class Options {

  formatter = new numberformat.Formatter({ format: 'standard', sigfigs: 2, flavor: 'short' })
  colAlert = true
  sacAlert = true
  numFormat = "S"
  autosaveNotification = false
  dark = true
  header = 1
  showGraph = true

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
      n: this.numFormat,
      a: this.autosaveNotification,
      d: this.dark,
      g: this.showGraph
    }
  }
  load(data) {
    this.colAlert = !!data.c
    this.sacAlert = !!data.s
    this.autosaveNotification = !!data.a
    this.dark = !!data.d
    this.showGraph = !!data.g
    this.numFormat = "n" in data ? data.n : "S"
    this.generateFormatter()
  }
}
