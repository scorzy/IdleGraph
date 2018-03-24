import { Component, OnInit, HostBinding, Input, OnChanges, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AutoBuy } from '../model/autoBuy'
import { ServService } from '../serv.service'
import { Type } from '../model/skill'
import { zip } from 'rxjs/observable/zip'


@Component({
  selector: 'app-auto-buyer',
  templateUrl: './auto-buyer.component.html',
  styleUrls: ['./auto-buyer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutoBuyerComponent implements OnInit, OnDestroy {
  @HostBinding('class.card') className = 'card'

  @Input() autoB: AutoBuy
  sub: any

  constructor(public ser: ServService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.sub = this.ser.autoBuyersEmitter.subscribe(n => {
      if (n || this.autoB.on)
        this.cd.markForCheck()
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  getPercent(): number {
    return (this.autoB.wait / this.autoB.interval) * 100
  }
  change() {
    if (!this.canChange())
      this.autoB.on = false

    this.ser.model.reloadAutoBuyers()
    this.ser.autoBuyersEmitter.emit(true)
  }
  canChange() {
    return this.autoB.on || this.ser.model.prestigeBonus[Type.MAX_AUTO_BUY] > this.ser.model.autoBuyersActiveOrder.length
  }
}
