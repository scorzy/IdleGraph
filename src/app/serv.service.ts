import { Options } from './model/options'
import { Model } from './model/model'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/interval'
import { EventEmitter } from '@angular/core'

@Injectable()
export class ServService {

  model: Model = null
  options: Options
  last = 0
  graph: any = null

  edgeEmitter: EventEmitter<string> = new EventEmitter<string>()

  constructor() {
    this.last = Date.now()
    this.options = new Options()
    this.model = new Model()
    this.model.formatter = this.options.formatter

    const source = Observable
      .interval(100).subscribe(() => {
        const now = Date.now()
        this.model.update(now - this.last)
        this.last = now
      })

  }
  clear() {
    localStorage.removeItem("save")
    window.location.reload()
  }
  save() {
    const save: any = {}
    save.m = this.model.getSave()
    save.o = this.options.save()
    localStorage.setItem("save", JSON.stringify(save))
  }
  load() {
    const raw = localStorage.getItem("save")
    const data = JSON.parse(raw)
    this.model = null
    this.model = new Model()
    if (!!data.o)
      this.options.load(data.o)
    this.model.load(data.m)

  }

}
