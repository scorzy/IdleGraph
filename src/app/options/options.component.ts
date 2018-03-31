import { ServService } from './../serv.service'
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable'

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit, OnDestroy {

  nodeColorChanged = false

  constructor(public ser: ServService) { }

  ngOnInit() {
  }

  reformat() {
    this.ser.options.generateFormatter()
  }

  ngOnDestroy(): void {
    if (this.nodeColorChanged)
      this.refresh()
  }

  refresh() {
    this.ser.model.myNodes.forEach(n => n.updateVis(this.ser.model))
  }
  resetColors() {
    this.nodeColorChanged = true
    this.ser.options.resetColors()
  }
}
