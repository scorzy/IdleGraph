import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ServService } from '../serv.service'
import { Skill, labels } from '../model/skill'
import { Model } from '../model/model'

@Component({
  selector: 'app-skill-stats',
  templateUrl: './skill-stats.component.html',
  styleUrls: ['./skill-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillStatsComponent implements OnInit {

  owned = []

  constructor(public serv: ServService) { }

  ngOnInit() {
    this.serv.model.prestigeBonus.forEach((v, i) => {
      if (v > 0) {
        this.owned.push(v + " x " + labels[i])
      }
    })
  }

}
