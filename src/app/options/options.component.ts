import { ServService } from './../serv.service'
import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  constructor(public ser: ServService) { }

  ngOnInit() {
  }

  reformat() {
    this.ser.options.generateFormatter()
  }

}
