import { Component, OnInit, HostBinding } from '@angular/core'
import { ServService } from '../serv.service'
declare let preventScroll

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  @HostBinding('class.content-container') className = 'content-container'

  constructor(public serv: ServService) { }

  ngOnInit() {
    preventScroll()
  }

}
