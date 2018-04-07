import { ServService } from './../serv.service';
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Achievement } from '../model/achievement';
declare let preventScroll

@Component({
  selector: 'app-achivement-list',
  templateUrl: './achivement-list.component.html',
  styleUrls: ['./achivement-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AchivementListComponent implements OnInit {
  @HostBinding('class.content-container') className = 'content-container'

  constructor(public ser: ServService) { }

  ngOnInit() {
    preventScroll()
  }

  getId (index: number, item: Achievement) {
    return item.id
  }

}
