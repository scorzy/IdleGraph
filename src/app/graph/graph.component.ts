import { Router } from '@angular/router'
import { Component, OnInit, HostBinding } from '@angular/core'
import { AfterViewInit } from '@angular/core'
import * as vis from 'vis'
import { MyNode } from '../model/node'
import { ServService } from '../serv.service'
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks'
import { element } from 'protractor'

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {

  currentNode: MyNode  // MyNode
  container: any
  network: vis.Network

  constructor(public serv: ServService, private router: Router) { }

  ngAfterViewInit(): void {
    this.container = document.getElementById('mynetwork')

    const data = {
      nodes: this.serv.model.nodes,
      edges: this.serv.model.edges
    }
    this.serv.graph = null
    const options = {}

    this.network = new vis.Network(this.container, data, options)

    this.network.on('click', params => {
      const nodeId = params.nodes[0]
      if (!!nodeId) {
        this.currentNode = this.serv.model.myNodes.get("" + nodeId)
        this.router.navigateByUrl("/main/node/" + this.currentNode.id)
      } else {
        const edge = params.edges[0]
        if (!!edge) {
          this.serv.edgeEmitter.emit(edge)
        } else
          this.router.navigateByUrl("/main/prest")
      }
    })
    this.serv.model.network = this.network
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.serv.model.network = null
    this.network.storePositions()
  }
  objectToArray(obj: any) {
    return Object.keys(obj).map(function (key) {
      obj[key].id = key
      return obj[key]
    })
  }

}
