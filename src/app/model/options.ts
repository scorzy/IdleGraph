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
  colAllAlert = true
  sacAllAlert = true
  lines = 6

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
      g: this.showGraph,
      k: this.colAllAlert,
      l: this.sacAllAlert,
      p: this.lines
    }
  }
  load(data) {
    this.colAlert = !!data.c
    this.sacAlert = !!data.s
    this.colAllAlert = !!data.k
    this.sacAllAlert = !!data.l
    this.autosaveNotification = !!data.a
    this.dark = !!data.d
    this.showGraph = !!data.g
    this.numFormat = "n" in data ? data.n : "S"
    if ("p" in data)
      this.lines = data.p
    this.generateFormatter()
  }
}
