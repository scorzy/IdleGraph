import { Component, OnInit, HostBinding } from '@angular/core';
declare let preventScroll

@Component({
  selector: 'app-opt-nav',
  templateUrl: './opt-nav.component.html',
  styleUrls: ['./opt-nav.component.scss']
})
export class OptNavComponent implements OnInit {
  @HostBinding('class.content-container') className = 'content-container'

  constructor() { }

  ngOnInit() {
    preventScroll()
  }

}
