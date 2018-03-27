import { ActivatedRoute } from '@angular/router';
import { MyNode } from '../model/node'
import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core'
import { ServService } from '../serv.service'
import { Observable } from 'rxjs/Observable';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { FormatPipe } from '../format.pipe';

@Component({
  selector: 'app-noode-view',
  templateUrl: './noode-view.component.html',
  styleUrls: ['./noode-view.component.scss']
})
export class NoodeViewComponent implements OnInit, OnDestroy {
  @Input() node: MyNode
  sons: Array<MyNode>
  parents: Array<MyNode>
  bonus: string = ""

  public sonsActive = false
  public parentsActive = false

  paramsSub: any
  updateSub: any
  edgeSub: any
  subNode: any

  constructor(public ser: ServService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.paramsSub = this.activatedRoute.params.subscribe(params => {
      const id = params['id']
      this.node = this.ser.model.myNodes.get("" + id)
      this.sons = new Array<MyNode>()
      if (this.node) {
        this.bonus = new FormatPipe(this.ser).transform(this.node.getBonus())
        this.reloadSons()
        this.node.reloadStats()
      }
    })
    this.updateSub = this.ser.updateEmitter.subscribe(a => this.node && this.node.reloadStats())
    this.edgeSub = this.ser.edgeEmitter.subscribe(e => this.onEdge(e))

    this.subNode = this.ser.buyNodeEmitter.subscribe(n => {
      if (this.node && this.node === n) {
        this.bonus = new FormatPipe(this.ser).transform(this.node.getBonus())
        this.node.reloadStats()
      }
    })
  }

  ngOnDestroy() {
    this.paramsSub.unsubscribe()
    this.updateSub.unsubscribe()
    this.edgeSub.unsubscribe()
    this.subNode.unsubscribe()
  }

  exit() {
    this.node = null
  }
  reloadSons() {
    if (!!this.node) {
      let node = this.node.product
      while (!!node) {
        this.sons.push(node)
        node = node.product
      }
    }
    this.sons = this.sons.reverse()
  }

  buyProd() {
    this.node.buyNewProducer(this.ser.model)
  }

  onEdge(id: string) {
    this.parentsActive = id.endsWith("-" + this.node.id)
    this.sonsActive = id.startsWith(this.node.id + "-")

  }

}
