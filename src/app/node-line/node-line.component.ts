import { MyNode } from '../model/node'
import { Component, OnInit, Input, OnDestroy } from '@angular/core'
import { ServService } from '../serv.service'
import { Options } from '../model/options';

@Component({
  selector: 'app-node-line',
  templateUrl: './node-line.component.html',
  styleUrls: ['./node-line.component.scss']
})
export class NodeLineComponent implements OnInit, OnDestroy {

  @Input() node: MyNode
  updateSub: any
  colModal = false
  sacModal = false
  removeModal = false

  constructor(public ser: ServService) { }

  ngOnInit() {
    this.updateSub = this.ser.updateEmitter.subscribe(a => this.node && this.node.reloadSacrificeMulti(this.ser.model))
    if (!!this.node)
      this.node.reloadSacrificeMulti(this.ser.model)
  }
  ngOnDestroy() {
    this.updateSub.unsubscribe()
  }

  sacrificeOrOpen() {
    if (this.ser.options.sacAlert)
      this.sacModal = true
    else
      this.node.sacrifice(this.ser.model)
  }

  collapseOrOpen() {
    if (this.ser.options.colAlert)
      this.colModal = true
    else
      this.node.collapse(this.ser.model)
  }
}
