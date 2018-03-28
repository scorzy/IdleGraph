import { Type } from './../model/skill'
import { ServService } from './../serv.service'
import { Component, OnInit } from '@angular/core'
import { AutoBuy } from '../model/autoBuy'

@Component({
  selector: 'app-auto-buy-tab',
  templateUrl: './auto-buy-tab.component.html',
  styleUrls: ['./auto-buy-tab.component.scss']
})
export class AutoBuyTabComponent implements OnInit {

  haveAutoBuy = false
  maxAuto = 0

  constructor(public ser: ServService) { }

  ngOnInit() {
    this.maxAuto = this.ser.model.getMaxAutoBuy()
    this.haveAutoBuy = this.maxAuto > 0
  }

  getId (index: number, item: AutoBuy) {
    return item.id
  }
}
