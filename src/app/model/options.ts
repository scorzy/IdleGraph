import { numberformat } from 'swarm-numberformat'
import { Injectable } from '@angular/core';

@Injectable()
export class Options {

  static ref: Options

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
  usaFormat = false

  mainColor = "rgb(255,168,7)"
  normalColor = "rgb(97,195,238)"
  leafColor = '#7BE141'

  constructor() {
    Options.ref = this
  }
  generateFormatter() {
    this.formatter = new numberformat.Formatter({
      format: this.numFormat === "T" ? 'standard' : (
        this.numFormat === "S" ? 'scientific' : (
          this.numFormat === "E" ? 'engineering' : 'longScale'))
      , sigfigs: 2, flavor: 'short'
    })
  }
  resetColors() {
    this.mainColor = "rgb(255,168,7)"
    this.normalColor = "rgb(97,195,238)"
    this.leafColor = '#7BE141'
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
      p: this.lines,
      mc: this.mainColor,
      nc: this.normalColor,
      lc: this.leafColor,
      us: this.usaFormat
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
    if ("mc" in data)
      this.mainColor = data.mc
    if ("nc" in data)
      this.normalColor = data.nc
    if ("lc" in data)
      this.leafColor = data.lc
    this.usaFormat = !!data.us
    this.generateFormatter()
  }
}
