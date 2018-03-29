import { Component, OnInit, ChangeDetectionStrategy, HostBinding, Input } from '@angular/core'
import { Modifier, Mod } from '../model/modifiers'

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorldComponent implements OnInit {
  @HostBinding('class.card') className = 'card'

  @Input() mod: Modifier
  strings = new Array<string>()

  constructor() { }

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
      }
      return ""
    })
  }

}
