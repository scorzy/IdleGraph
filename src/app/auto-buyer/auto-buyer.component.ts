import { Component, OnInit, HostBinding, Input } from '@angular/core'
import { AutoBuy } from '../model/autoBuy'

@Component({
  selector: 'app-auto-buyer',
  templateUrl: './auto-buyer.component.html',
  styleUrls: ['./auto-buyer.component.scss']
})
export class AutoBuyerComponent implements OnInit {
  @HostBinding('class.card') className = 'card'

  @Input() autoB: AutoBuy

  constructor() { }

  ngOnInit() {
  }

  getPercent(): number {
    return (this.autoB.wait / this.autoB.interval ) * 100
  }

}
