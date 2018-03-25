import { Component, OnInit } from '@angular/core';
import { ServService } from '../serv.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  public sacModal = false
  public colModal = false

  constructor(public ser: ServService) { }

  ngOnInit() {
  }

  sacrificeOrOpen() {
    if (this.ser.options.sacAllAlert)
      this.sacModal = true
    else
      this.ser.model.leafSacrify()
  }

  collapseOrOpen() {
    if (this.ser.options.colAllAlert)
      this.colModal = true
    else
      this.ser.model.maxCollapse()
  }

}
