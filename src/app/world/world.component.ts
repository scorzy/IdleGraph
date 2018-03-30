import { Component, OnInit, ChangeDetectionStrategy, HostBinding, Input, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Modifier, Mod } from '../model/modifiers'
import { ServService } from '../serv.service';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldComponent implements OnInit, OnDestroy {
  @HostBinding('class.card') className = 'card'

  @Input() mod: Modifier
  @Input() prestigeBtn = false
  strings = new Array<string>()
  prestSub: any

  constructor(public ser: ServService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.strings = this.mod.mods.map(m => {
      switch (m[0]) {
        case Mod.TICK_SPEED:
          return "+ " + m[1] + " % tick speed"
        case Mod.SACRIFY:
          return "+ " + m[1] + " % sacrifice bonus"
        case Mod.BONUS:
          return "+ " + m[1] + " % bought bonus"
        case Mod.TIME:
          return "+ " + m[1] + " % time"
        case Mod.WARP:
          return "+ " + m[1] + " % warp"
        case Mod.LEAF_PROD:
          return "+ " + m[1] + "+ % leaf production"
        case Mod.NODE1:
          return "+ " + m[1] + "+ % production from nod of level 1"
        case Mod.NODE2:
          return "+ " + m[1] + "+ % production from nod of level 2"
        case Mod.NODE3:
          return "+ " + m[1] + "+ % production from nod of level 3"
      }
      return ""
    })
    this.prestSub = this.ser.prestigeEmitter.subscribe(a => this.cd.markForCheck())
  }
  ngOnDestroy() {
    this.prestSub.unsubscribe()
  }
  prestige() {
    if (this.ser.model.canPrestige)
      this.ser.model.prestige(false, this.mod)
  }

}
