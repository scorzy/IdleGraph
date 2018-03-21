import { Component, OnInit, HostBinding, Input } from '@angular/core'
import { AutoBuy } from '../model/autoBuy'
import { ServService } from '../serv.service'
import { Type } from '../model/skill';

@Component({
  selector: 'app-auto-buyer',
  templateUrl: './auto-buyer.component.html',
  styleUrls: ['./auto-buyer.component.scss']
})
export class AutoBuyerComponent implements OnInit {
  @HostBinding('class.card') className = 'card'

  @Input() autoB: AutoBuy
  numbers = []

  constructor(public ser: ServService) {
    this.numbers = Array.from(Array(this.ser.model.autoBuyers.length), (v, k) => k)
  }

  ngOnInit() {
  }

  getPercent(): number {
    return (this.autoB.wait / this.autoB.interval) * 100
  }
  change() {
    if (!this.canChange())
      this.autoB.on = false

    this.ser.model.reloadAutoBuyers()
  }
  canChange() {
    return this.autoB.on || this.ser.model.prestigeBonus[Type.MAX_AUTO_BUY] > this.ser.model.autoBuyersActiveOrder.length
  }
}
