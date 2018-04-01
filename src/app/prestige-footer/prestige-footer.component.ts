import { Component, OnInit, OnDestroy } from '@angular/core'
import { ServService } from '../serv.service'

@Component({
  selector: 'app-prestige-footer',
  templateUrl: './prestige-footer.component.html',
  styleUrls: ['./prestige-footer.component.scss']
})
export class PrestigeFooterComponent implements OnInit, OnDestroy {
  upSub: any
  prestSub: any
  Number = Number
  constructor(public ser: ServService) { }

  ngOnInit() {
    this.upSub = this.ser.updateEmitter.subscribe(a => {
      this.ser.model.checkPrestige()
      this.ser.model.softResetCheck()
    })
    this.prestSub = this.ser.prestigeEmitter.subscribe(a => {
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
}
