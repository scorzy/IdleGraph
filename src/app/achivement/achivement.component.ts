import { ServService } from './../serv.service';
import { Achievement } from './../model/achievement'
import { Component, OnInit, Input, HostBinding, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'app-achivement',
  templateUrl: './achivement.component.html',
  styleUrls: ['./achivement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchivementComponent implements OnInit, OnDestroy {
  @HostBinding('class.card') className = 'card'

  @Input() ack: Achievement
  sub: any

  constructor(public ser: ServService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.sub = this.ser.model.achievementsEmitter.subscribe(a => {
      if (a === this.ack)
        this.cd.markForCheck()
    })
  }
  ngOnDestroy() {
    this.sub.unsubscribe()
  }


}
