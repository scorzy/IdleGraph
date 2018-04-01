import { Component, OnInit } from '@angular/core'
import { ServService } from '../serv.service'

@Component({
  selector: 'app-utility',
  templateUrl: './utility.component.html',
  styleUrls: ['./utility.component.scss']
})
export class UtilityComponent implements OnInit {

  constructor(public ser: ServService) { }

  ngOnInit() {
  }

}
