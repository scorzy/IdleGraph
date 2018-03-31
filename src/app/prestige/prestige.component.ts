import { ServService } from './../serv.service'
import { Component, OnInit, HostBinding } from '@angular/core'
import { Model } from '../model/model'
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks'
import { Modifier } from '../model/modifiers'

@Component({
  selector: 'app-prestige',
  templateUrl: './prestige.component.html',
  styleUrls: ['./prestige.component.scss']
})
export class PrestigeComponent implements OnInit, OnDestroy {
  upSub: any
  prestSub: any
  Number = Number
  surrenderModal = false
  selModal = false

  constructor(public ser: ServService) { }

  ngOnInit() {
    this.upSub = this.ser.updateEmitter.subscribe(a => {
      this.ser.model.checkPrestige()
      this.ser.model.softResetCheck()
    })
    this.prestSub = this.ser.prestigeEmitter.subscribe(a => {
      this.selModal = false
      this.ser.model.softResetCheck()
      this.ser.model.checkPrestige()
    })
    this.ser.model.softResetCheck()
    this.ser.model.checkPrestige()
  }
  ngOnDestroy() {
    this.upSub.unsubscribe()
    this.prestSub.unsubscribe()
  }
  getVal() {
    return this.ser.model.cuerrency.quantity.log10() / this.ser.model.cuerrencyNextPrestige.log10() * 100
  }
  getSoftVal() {
    return this.ser.model.softResetHave.div(this.ser.model.softResetReq).times(100).toNumber()
  }
  getId(index: number, item: Modifier) {
    return item.id + index * 1E4
  }
}
