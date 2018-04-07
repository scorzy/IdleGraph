import { Component, OnInit, HostBinding } from '@angular/core';
declare let preventScroll

@Component({
  selector: 'app-prestige-container',
  templateUrl: './prestige-container.component.html',
  styleUrls: ['./prestige-container.component.scss']
})
export class PrestigeContainerComponent implements OnInit {
  @HostBinding('class.content-container') className = 'content-container'

  constructor() { }

  ngOnInit() {
    preventScroll()
  }

}
