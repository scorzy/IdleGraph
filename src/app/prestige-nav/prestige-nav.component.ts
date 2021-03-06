import { Component, OnInit, HostBinding } from '@angular/core';
declare let preventScroll

@Component({
  selector: 'app-prestige-nav',
  templateUrl: './prestige-nav.component.html',
  styleUrls: ['./prestige-nav.component.scss']
})
export class PrestigeNavComponent implements OnInit {
  @HostBinding('class.content-container') className = 'content-container'

  constructor() { }

  ngOnInit() {
    preventScroll()
  }

}
