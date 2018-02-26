import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core'
import * as Decimal from 'break_infinity.js'
import { ServService } from '../serv.service';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.scss']
})
export class TopComponent implements OnInit {

  constructor(public serv: ServService) { }

  ngOnInit() {
  }

}
