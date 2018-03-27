import { Options } from './model/options'
import { Model } from './model/model'
import { Injectable, Inject } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/interval'
import { EventEmitter } from '@angular/core'
import * as LZString from 'lz-string'
import { ToastsManager } from 'ng2-toastr'
import { DOCUMENT } from '@angular/common'
import * as moment from 'moment'
import * as Decimal from 'break_infinity.js'
import { Achievement } from './model/achievement';
import { MyNode } from './model/node';

@Injectable()
export class ServService {

  model: Model = null
  options: Options
  last = 0
  graph: any = null

  edgeEmitter: EventEmitter<string> = new EventEmitter<string>()
  updateEmitter: EventEmitter<number> = new EventEmitter<number>()
  autoBuyersEmitter: EventEmitter<boolean> = new EventEmitter<boolean>()
  achievementsEmitter: EventEmitter<Achievement> = new EventEmitter<Achievement>()
  buyNodeEmitter: EventEmitter<MyNode> = new EventEmitter<MyNode>()

  linkTheme: HTMLLinkElement

  constructor(
    public toastr: ToastsManager,
    @Inject(DOCUMENT) private document: Document) {
    moment.locale('en')

    this.last = Date.now()
    this.options = new Options()
    this.model = new Model(toastr, this.achievementsEmitter, this.buyNodeEmitter)
    this.model.formatter = this.options.formatter

    // setTimeout(this.load.bind(this), 0)

    this.linkTheme = this.document.createElement('link')
    this.linkTheme.rel = "stylesheet"
    this.linkTheme.type = "text/css"
    this.setTheme()
    this.document.querySelector('head').appendChild(this.linkTheme)

    const source = Observable
      .interval(200).subscribe(() => {
        const now = Date.now()
        const delta = now - this.last
        this.model.mainUpdate(delta)
        this.updateEmitter.emit(delta)
        this.last = now
      })
    const saveO = Observable
      .interval(60000).subscribe(() => {
        this.save(true)
      })
    const autoBuyUp = Observable
      .interval(1500).subscribe(() => {
        this.autoBuyersEmitter.emit(false)
      })

  }
  clear() {
    localStorage.removeItem("save")
    window.location.reload()
  }
  getSave(): string {
    try {
      const save: any = {}
      save.m = this.model.getSave()
      save.o = this.options.save()
      return LZString.compressToBase64(JSON.stringify(save))
    } catch (ex) {
      this.toastr.error(ex && ex.message ? ex.message : "unknow error", "Save Error")
    }
  }
  save(autosave = false) {
    try {
      const save = this.getSave()
      if (!!save) {
        localStorage.setItem("save", save)
        if (!autosave || this.options.autosaveNotification)
          this.toastr.success("", "Game Saved")
      } else
        this.toastr.error("Unknow error 1", "Save Error")
    } catch (ex) {
      this.toastr.error(ex && ex.message ? ex.message : "unknow error", "Save Error")
    }
  }
  import(raw: string): boolean {
    try {
      if (!raw) {
        this.toastr.error("No save foud", "Not Loaded")
        return false
      }
      const json = LZString.decompressFromBase64(raw)
      const data = JSON.parse(json)
      if (!data.m) {
        this.toastr.error("Save is not valid", "Not Loaded")
        return false
      }
      this.model = null
      this.model = new Model(this.toastr, this.achievementsEmitter, this.buyNodeEmitter)
      if (!!data.o)
        this.options.load(data.o)
      this.setTheme()
      this.model.load(data.m)
      this.toastr.success("", "Game Loaded")
    } catch (ex) {
      this.toastr.error(ex && ex.message ? ex.message : "unknow error", "Load Error")
    }
  }
  load() {
    try {
      this.import(localStorage.getItem("save"))
    } catch (ex) {
      this.toastr.error(ex && ex.message ? ex.message : "unknow error", "Load Error")
    }
  }

  setTheme() {
    this.linkTheme.href = this.options.dark ?
      "clr-ui-dark.min.css" : "clr-ui.min.css"
  }

}
