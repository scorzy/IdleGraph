import { Component, OnInit } from '@angular/core'
import { ServService } from '../serv.service'

@Component({
  selector: 'app-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.scss']
})
export class SaveComponent implements OnInit {

  constructor(public serv: ServService) { }

  ngOnInit() {
  }

}
